import {createUser, getUser, updateUser} from "../../models/user/userModel.js";
import {User} from "../../utils/validation/user.js";
import {SignJWT} from "jose";

// Import bcrypt for password hashing
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
    const success = await updateUser(userId, updates);
    if (!success) {
      return res.status(404).json({ error: "User not found or not updated" });
    }
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};


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
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await getUser(userId);
    const valid = await bcrypt.compare(oldPassword, user.hashedPassword);
    if (!valid) return res.status(403).json({ error: "Old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await updateUser(userId, { hashedPassword });
    if (!updated) return res.status(500).json({ error: "Failed to update password" });

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    console.error("Password update error:", e);
    res.status(500).json({ error: "Error updating password" });
  }
};
