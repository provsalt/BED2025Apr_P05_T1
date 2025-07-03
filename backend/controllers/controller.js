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
import { uploadProfilePic } from "../middleware/userSettingsUpload.js";

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
  app.post("/api/user/:id/picture", getUserMiddleware, uploadProfilePic.single("avatar"), uploadProfilePictureController);
  app.delete("/api/profile-picture/:id", getUserMiddleware, deleteProfilePictureController);


  // Chat 
  app.get("/api/chats", getUserMiddleware, getChatsController);
  app.post("/api/chats", getUserMiddleware, createChatController);

  app.get("/api/chats/:chatId", getUserMiddleware, getChatMessagesController);
  app.post("/api/chats/:chatId", getUserMiddleware, createMessageController);
  app.put("/api/chats/:chatId/:messageId", getUserMiddleware, updateMessageController);
  app.delete("/api/chats/:chatId/:messageId", getUserMiddleware, deleteMessageController);
};
