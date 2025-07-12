import {
  createUser,
  getAllUsers,
  getUser,
  getUserByEmail,
  updateUser,
  updateUserProfilePicture,
  insertLoginHistory 
} from "../../models/user/userModel.js";
import {randomUUID} from "crypto";
import {User, Password} from "../../utils/validation/user.js";
import {SignJWT} from "jose";
import {z} from "zod/v4";
import bcrypt from "bcryptjs";
import {deleteFile, uploadFile} from "../../services/s3Service.js";
import {deleteUser} from "../../models/admin/adminModel.js";

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user
 *     description: Get the currently authenticated user's details.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch current user
 */
export const getCurrentUserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({message: "Unauthorized"});
  }

  try {
    const fullUser = await getUser(req.user.id);
    if (!fullUser) return res.status(404).json({error: "User not found"});

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
    res.status(500).json({error: "Failed to fetch current user"});
  }
};

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user by ID
 *     description: Get a user's details by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID.
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching user
 */
export const getUserController = async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({error: "Invalid user ID"});
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({error: "Error fetching user"});
  }
};


/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user
 *     description: Update a user's details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Failed to update user
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
export const updateUserController = async (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;

  try {
    const currentUser = await getUser(userId);
    if (!currentUser) {
      return res.status(404).json({error: "User not found"});
    }

    // Protect non-editable fields
    updates.email = currentUser.email;
    updates.hashedPassword = currentUser.password;

    if (!updates.date_of_birth || isNaN(Date.parse(updates.date_of_birth))) {
      updates.date_of_birth = currentUser.date_of_birth;
    }

    const success = await updateUser(userId, updates);

    if (!success) {

      return res.status(400).json({error: "Failed to update user"});
    }

    res.json({message: "User updated successfully"});
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({error: "Failed to update user"});
  }
};

/**
 * @openapi
 * /api/users/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Login user
 *     description: Authenticate a user and get a JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid user data
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Error creating user
 */
export const loginUserController = async (req, res) => {
  const body = req.body;
  const validate = z.object({
    email: z.email().max(255),
    password: z.string().min(12).max(255).regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter").regex(/(?=.*[!@#$%^&*()])/, "Password must contain at least one special character"),
  }).safeParse(body)
  if (!validate.success) {
    return res.status(400).json({error: "Invalid user data", details: validate.error.issues});
  }

  const user = await getUserByEmail(validate.data.email);
  if (!user) {
    return res.status(401).json({error: "Invalid email or password"});
  }
  const isPasswordValid = await bcrypt.compare(validate.data.password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }                       
  await insertLoginHistory(user.id);

  const secret = new TextEncoder().encode(process.env.SECRET || "");
  const tok = await new SignJWT({
    sub: user.id,
    role: user.role
  }).setProtectedHeader({alg: "HS256"})
    .setExpirationTime("1d")
    .sign(secret);
  res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_picture_url: user.profile_picture_url,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      language: user.language,
      role: user.role
    },
    token: tok
  });
}

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags:
 *       - User
 *     summary: Create user
 *     description: Create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid user data
 *       500:
 *         description: Error creating user
 */
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
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            profile_picture_url: newUser.profile_picture_url,
            gender: newUser.gender,
            date_of_birth: newUser.date_of_birth,
            language: newUser.language,
            role: newUser.role
          },
          token: tok
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating user" });
    }
}

/**
 * @openapi
 * /api/users/password:
 *   put:
 *     tags:
 *       - User
 *     summary: Change password
 *     description: Change the current user's password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Old password is incorrect
 *       500:
 *         description: Failed to update password
 */
export const changePasswordController = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  const validation = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: Password,
  }).safeParse({oldPassword, newPassword});
  if (!validation.success) {
    return res.status(400).json({
      error: "Invalid input",
      details: validation.error.issues,
    });
  }
  try {
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(403).json({error: "Old password is incorrect"});
    }
    const isTheSame = await bcrypt.compare(newPassword, user.password);
    if (isTheSame) {
      return res.status(400).json({error: "New password must be different from old password"});
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await updateUser(userId, {password: hashedPassword});
    if (!success) {
      return res.status(500).json({error: "Failed to update password"});
    }

    res.json({message: "Password updated successfully"});
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({error: "Internal server error"});
  }
};

/**
 * @openapi
 * /api/users/me/picture:
 *   post:
 *     tags:
 *       - User
 *     summary: Upload profile picture
 *     description: Upload a profile picture for the current user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Failed to upload image
 */
export const uploadUserProfilePictureController = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({error: "No file uploaded"});
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

    res.status(200).json({message: "Upload successful", url: publicUrl});
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({error: "Failed to upload image"});
  }
};

/**
 * @openapi
 * /api/users/me/picture:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete profile picture
 *     description: Delete the current user's profile picture.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
 *       404:
 *         description: No profile picture to delete
 *       500:
 *         description: Failed to delete profile picture
 */
export const deleteUserProfilePictureController = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await getUser(userId);
    if (!user || !user.profile_picture_url) {
      return res.status(404).json({error: "No profile picture to delete"});
    }

    const key = `uploads/${user.profile_picture_url.split("/").pop()}`;

    await deleteFile(key);

    await updateUserProfilePicture(userId, null)
    res.status(200).json({message: "Profile picture deleted successfully"});
  } catch (err) {
    console.error("Delete picture error:", err);
    res.status(500).json({error: "Failed to delete profile picture"});
  }
};

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Delete user by ID
 *     description: Delete a user's account by their ID. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's ID.
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID or trying to delete own account
 *       404:
 *         description: User not found
 *       500:
 *         description: Error deleting user
 */
export const deleteUserController = async (req, res) => {
  const {id: userId} = req.params; // Fix: use 'id' from params, not 'userId'

  if (!userId || isNaN(userId)) {
    return res.status(400).json({error: "Invalid user ID"});
  }

  // Prevent admin from deleting themselves
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({error: "Cannot delete your own account"});
  }

  try {
    await deleteUser(parseInt(userId));
    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: parseInt(userId)
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({error: "User not found"});
    }
    res.status(500).json({error: "Error deleting user"});
  }
};

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - User
 *     summary: Get all users
 *     description: Get a list of all users. This is an admin-only action.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Error fetching users
 */
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({error: "Error fetching users"});
  }
};

