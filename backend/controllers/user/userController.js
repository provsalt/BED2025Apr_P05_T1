
import {createUser, getUser, getUserByEmail, updateUser, updateUserProfilePicture} from "../../models/user/userModel.js";
import {User} from "../../utils/validation/user.js";
import {SignJWT} from "jose";
import {z} from "zod/v4";
import bcrypt from "bcryptjs";

export const getCurrentUserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }
  res.status(200).json(req.user)
}

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



// PUT: Update Profile
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
    updates.hashedPassword = currentUser.hashedPassword;

    // Validate/fix dob
    if (!updates.dob || isNaN(Date.parse(updates.dob))) {
      updates.dob = currentUser.dob;
    }

    const success = await updateUser(userId, updates);

    if (!success) {
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
    password: z.string().min(8).max(255),
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
    sub: user.id
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
        console.log(error);
        res.status(500).json({ error: "Error creating user" });
    }
}

// Change Password
export const changePasswordController = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await getUser(userId);
    console.log("Submitted old password:", oldPassword);
    console.log("Stored hash from DB:", user.hashedPassword);
    console.log("Length of entered password:", oldPassword.length);
    console.log("Length of stored hash:", user.hashedPassword.length);

    const valid = await bcrypt.compare(oldPassword, user.hashedPassword);
    console.log("bcrypt.compare result:", valid); // true or false

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
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    const updated = await updateUserProfilePicture(userId, filePath);
    if (!updated) return res.status(500).json({ error: "Failed to update profile picture" });

    res.json({ message: "Profile picture uploaded", path: filePath });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};