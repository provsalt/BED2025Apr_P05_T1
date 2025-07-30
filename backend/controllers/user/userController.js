import {
  createUser,
  getAllUsers,
  getUser,
  getUserByEmail,
  updateUser,
  updateUserProfilePicture,
  insertLoginHistory,
  requestUserDeletion,
  getUsersWithDeletionRequested,
  approveUserDeletionRequest,
  cancelUserDeletionRequest
} from "../../models/user/userModel.js";
import {randomUUID} from "crypto";
import {User, Password} from "../../utils/validation/user.js";
import {SignJWT} from "jose";
import {z} from "zod/v4";
import bcrypt from "bcryptjs";
import {deleteFile, uploadFile} from "../../services/s3Service.js";
import {deleteUser} from "../../models/admin/adminModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

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
export const getCurrentUserController = async (req, res, next) => {
  try {
    if (!req.user) {
      throw ErrorFactory.unauthorized("Unauthorized");
    }

    const fullUser = await getUser(req.user.id);
    if (!fullUser) {
      throw ErrorFactory.notFound("User");
    }

    res.status(200).json({
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      profile_picture_url: fullUser.profile_picture_url,
      gender: fullUser.gender,
      date_of_birth: fullUser.date_of_birth,
      language: fullUser.language,
      deletionRequested: fullUser.deletionRequested,
      deletionRequestedAt: fullUser.deletionRequestedAt
    });
  } catch (error) {
    next(error);
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
export const getUserController = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    const user = await getUser(userId);
    if (!user) {
      throw ErrorFactory.notFound("User");
    }
    res.json(user);
  } catch (error) {
    next(error);
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
export const updateUserController = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    const currentUser = await getUser(userId);
    if (!currentUser) {
      throw ErrorFactory.notFound("User");
    }

    // Protect non-editable fields
    updates.email = currentUser.email;
    updates.hashedPassword = currentUser.password;

    if (!updates.date_of_birth || isNaN(Date.parse(updates.date_of_birth))) {
      updates.date_of_birth = currentUser.date_of_birth;
    }

    const success = await updateUser(userId, updates);

    if (!success) {
      throw ErrorFactory.external("Database", "Failed to update user", "Update operation failed");
    }

    res.json({message: "User updated successfully"});
  } catch (error) {
    next(error);
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid user data
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Error creating user
 */
export const loginUserController = async (req, res, next) => {
  try {
    const body = req.body;

    const user = await getUserByEmail(body.email);
    if (!user) {
      throw ErrorFactory.unauthorized("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw ErrorFactory.unauthorized("Invalid email or password");
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
  } catch (error) {
    next(error);
  }
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
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid user data
 *       500:
 *         description: Error creating user
 */
export const createUserController = async (req, res, next) => {
    try {
        const newUser = await createUser(req.body);
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
        next(error);
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
export const changePasswordController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const validation = z.object({
      oldPassword: z.string().min(1, "Old password is required"),
      newPassword: Password,
    }).safeParse({oldPassword, newPassword});
    if (!validation.success) {
      throw ErrorFactory.validation("Invalid input");
    }
    
    const user = await getUser(userId);
    if (!user) {
      throw ErrorFactory.notFound("User");
    }
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw ErrorFactory.forbidden("Old password is incorrect");
    }
    const isTheSame = await bcrypt.compare(newPassword, user.password);
    if (isTheSame) {
      throw ErrorFactory.validation("New password must be different from old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await updateUser(userId, {password: hashedPassword});
    if (!success) {
      throw ErrorFactory.external("Database", "Failed to update password", "Password update failed");
    }

    res.json({message: "Password updated successfully"});
  } catch (error) {
    next(error);
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
export const uploadUserProfilePictureController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      throw ErrorFactory.validation("No file uploaded");
    }

    const uniqueId = randomUUID();
    const key = `uploads/${uniqueId}`;

    const user = await getUser(userId);
    if (user?.profile_picture_url) {
      const oldKey = `/uploads/${decodeURIComponent(user.profile_picture_url.split("/").pop())}`;
      await deleteFile(oldKey);
    }

    await uploadFile(file, key);

    const publicUrl = process.env.BACKEND_URL + "/api/s3?key=" + key

    await updateUserProfilePicture(userId, publicUrl)

    res.status(200).json({message: "Upload successful", url: publicUrl});
  } catch (error) {
    next(error);
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
export const deleteUserProfilePictureController = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await getUser(userId);
    if (!user || !user.profile_picture_url) {
      throw ErrorFactory.notFound("Profile picture");
    }

    const key = `uploads/${user.profile_picture_url.split("/").pop()}`;

    await deleteFile(key);

    await updateUserProfilePicture(userId, null)
    res.status(200).json({message: "Profile picture deleted successfully"});
  } catch (error) {
    next(error);
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
export const deleteUserController = async (req, res, next) => {
  try {
    const {id: userId} = req.params;

    if (!userId || isNaN(userId)) {
      throw ErrorFactory.validation("Invalid user ID");
    }

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      throw ErrorFactory.validation("Cannot delete your own account");
    }

    await deleteUser(parseInt(userId));
    res.status(200).json({
      message: "User deleted successfully",
      deletedUserId: parseInt(userId)
    });
  } catch (error) {
    if (error.message.includes("not found")) {
      return next(ErrorFactory.notFound("User"));
    }
    next(error);
  }
};

/**
 * @openapi
 * /api/users/me/request-delete:
 *   post:
 *     tags:
 *       - User
 *     summary: Request account deletion
 *     description: Request to delete the current user's account (admin approval required).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deletion request submitted
 *       400:
 *         description: Request failed
 *       500:
 *         description: Server error
 */
export const requestUserDeletionController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const success = await requestUserDeletion(userId);
    if (!success) {
      throw ErrorFactory.external("Database", "Failed to request account deletion", "Request submission failed");
    }
    res.status(200).json({ message: "Account deletion request submitted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/users/me/cancel-delete:
 *   post:
 *     tags:
 *       - User
 *     summary: Cancel account deletion request
 *     description: Cancel the current user's account deletion request.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Deletion request cancelled
 *       400:
 *         description: Cancel failed
 *       500:
 *         description: Server error
 */
export const cancelUserDeletionController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const success = await cancelUserDeletionRequest(userId);
    if (!success) {
      throw ErrorFactory.external("Database", "Failed to cancel deletion request", "Cancellation failed");
    }
    res.status(200).json({ message: "Account deletion request cancelled" });
  } catch (error) {
    next(error);
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
export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

