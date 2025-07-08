
import {
  createUser,
  getUser,
  getUserByEmail,
  updateUser,
  updateUserProfilePicture
} from "../../models/user/userModel.js";
import { randomUUID } from "crypto";
import { User } from "../../utils/validation/user.js";
import { SignJWT } from "jose";
import { z } from "zod/v4";
import bcrypt from "bcryptjs";
import { uploadFile, deleteFile } from "../../services/s3Service.js";

export const getCurrentUserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const fullUser = await getUser(req.user.id);
    if (!fullUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      profile_picture_url: fullUser.profile_picture_url,
      gender: fullUser.gender,
      date_of_birth: fullUser.date_of_birth,
      language: fullUser.language
    });
  } catch (err) {
    console.error("Fetch current user failed:", err);
    res.status(500).json({ error: "Failed to fetch current user" });
  }
};

export const getUserController = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error); 
    res.status(500).json({ error: "Error fetching user" });
  }
};



export const updateUserController = async (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;

  try {
    const currentUser = await getUser(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Protect non-editable fields
    updates.email = currentUser.email;
    updates.hashedPassword = currentUser.password;

    if (!updates.date_of_birth || isNaN(Date.parse(updates.date_of_birth))) {
      updates.date_of_birth = currentUser.date_of_birth;
    }

    const success = await updateUser(userId, updates);

    if (!success) {
      console.log("Backend update failed (model returned false)");
      return res.status(400).json({ error: "Failed to update user" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const loginUserController = async (req, res) => {
  const body = req.body;
  const validate = z.object({
    email: z.email().max(255),
    password: z.string().min(12).max(255).regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter").regex(/(?=.*[!@#$%^&*()])/, "Password must contain at least one special character"),
  }).safeParse(body)
  if (!validate.success) {
    return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
  }

  const user = await getUserByEmail(validate.data.email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const isPasswordValid = await bcrypt.compare(validate.data.password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const secret = new TextEncoder().encode(process.env.SECRET || "");
  const tok = await new SignJWT({
    sub: user.id,
    admin: user.role
  }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(secret);
  res.status(200).json({
    id: user.id,
    token: tok
  });
}

export const createUserController = async (req, res) => {
    const body = req.body;

    const validate = User.safeParse(body);

    if (!validate.success) {
        return res.status(400).json({ error: "Invalid user data", details: validate.error.issues });
    }
    try {
        const newUser = await createUser(validate.data);
        const secret = new TextEncoder().encode(process.env.SECRET || "");
        const tok = await new SignJWT({
          sub: newUser.id
        }).setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("1d")
          .sign(secret);
        res.status(201).json({
          id: newUser.id,
          token: tok
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
}

export const changePasswordController = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await getUser(userId);

    const valid = await bcrypt.compare(oldPassword, user.hashedPassword);

    if (!valid) {
      return res.status(403).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await updateUser(userId, { hashedPassword });

    if (!updated) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadProfilePictureController = async (req, res) => {
  const userId = parseInt(req.params.id);
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const uniqueId = randomUUID();
  const key = `uploads/${uniqueId}`;

  try {
    const user = await getUser(userId);
    if (user?.profile_picture_url) {
      const oldKey = `/uploads/${decodeURIComponent(user.profile_picture_url.split("/").pop())}`;
      await deleteFile(oldKey);
    }

    await uploadFile(file, key);

    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + key

    await updateUserProfilePicture(userId, publicUrl)

    res.status(200).json({ message: "Upload successful", url:  publicUrl });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
};

export const deleteProfilePictureController = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const user = await getUser(userId);
    if (!user || !user.profile_picture_url) {
      return res.status(404).json({ error: "No profile picture to delete" });
    }

    const key = `uploads/${user.profile_picture_url.split("/").pop()}`;

    await deleteFile(key);

    await updateUserProfilePicture(userId, null)
    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (err) {
    console.error("Delete picture error:", err);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
};
