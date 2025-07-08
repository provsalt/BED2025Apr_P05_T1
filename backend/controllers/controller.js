import { createUploadMiddleware } from "../middleware/upload.js";
import { compressImage } from "../middleware/compression.js";
import {
  createUserController,
  getCurrentUserController,
  loginUserController,
  changePasswordController,
  getUserController,
  updateUserController,
  uploadProfilePictureController,
  deleteProfilePictureController
} from "./user/userController.js";

import { getUserMiddleware } from "../middleware/getUser.js";

import {
  getChatsController,
  createChatController
} from "./chat/chatController.js";

import {
  getChatMessagesController,
  createMessageController,
  updateMessageController,
  deleteMessageController
} from "./chat/messageController.js";

import {getFileByKey} from "./s3/fileController.js";

import {
  addAdminRoleController,
  getAllAdminsController,
  removeAdminRoleController,
  getAllUsersController,
  getUserByIdController,
  updateUserRoleController,
  deleteUserController,
  getUsersByRoleController,
  bulkUpdateUserRolesController
} from "./admin/adminController.js";

import { AdminController } from "./admin/announcementcontroller.js";

/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {

  // Register and login
  app.post("/api/user", createUserController);
  app.post("/api/user/login", loginUserController);

  // Get current user using JWT
  app.get("/api/user", getUserMiddleware, getCurrentUserController);

  // User profile by ID
  app.get("/api/user/:id", getUserController);
  app.put("/api/user/:id", getUserMiddleware, updateUserController);

  // Update password
  app.put("/api/user/:id/password", getUserMiddleware, changePasswordController);

  // profile picture
  app.post("/api/user/:id/picture", getUserMiddleware, createUploadMiddleware({
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSize: 8 * 1024 * 1024,
  }).single("avatar"), compressImage, uploadProfilePictureController);
  app.delete("/api/profile-picture/:id", getUserMiddleware, deleteProfilePictureController);


  // Chat 
  app.get("/api/chats", getUserMiddleware, getChatsController);
  app.post("/api/chats", getUserMiddleware, createChatController);

  app.get("/api/chats/:chatId", getUserMiddleware, getChatMessagesController);
  app.post("/api/chats/:chatId", getUserMiddleware, createMessageController);
  app.put("/api/chats/:chatId/:messageId", getUserMiddleware, updateMessageController);
  app.delete("/api/chats/:chatId/:messageId", getUserMiddleware, deleteMessageController);

  app.get("/api/s3", getFileByKey);

  // Admin routes (require authentication and admin role)
  app.get("/api/admin", getUserMiddleware, getAllAdminsController);
  app.post("/api/admin/add-role", getUserMiddleware, addAdminRoleController);
  app.post("/api/admin/remove-role", getUserMiddleware, removeAdminRoleController);

  // User management routes (Admin only)
  app.get("/api/admin/users", getUserMiddleware, getAllUsersController);
  app.get("/api/admin/users/:userId", getUserMiddleware, getUserByIdController);
  app.put("/api/admin/users/:userId/role", getUserMiddleware, updateUserRoleController);
  app.delete("/api/admin/users/:userId", getUserMiddleware, deleteUserController);
  app.get("/api/admin/users/role/:role", getUserMiddleware, getUsersByRoleController);
  app.put("/api/admin/users/bulk-role-update", getUserMiddleware, bulkUpdateUserRolesController);

  // Announcement routes
  AdminController(app);
};
