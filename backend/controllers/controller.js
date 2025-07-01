import {
  createUserController,
  getCurrentUserController,
  loginUserController,
  changePasswordController,
  getUserController,
  updateUserController,
  uploadProfilePictureController
} from "./user/userController.js";

import { getUserMiddleware } from "../middleware/getUser.js";
import { uploadProfilePic } from "../middleware/userSettingsUpload.js";

// Chat controllers
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
 * Sets up all API routes for the application.
 * @param {import("express").Application} app - Express app instance.
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

  // Upload profile picture
  app.post("/api/user/:id/picture", getUserMiddleware, uploadProfilePic.single("avatar"), uploadProfilePictureController);


  // Chat 
  app.get("/api/chats", getUserMiddleware, getChatsController);
  app.post("/api/chats", getUserMiddleware, createChatController);

  app.get("/api/chats/:chatId", getUserMiddleware, getChatMessagesController);
  app.post("/api/chats/:chatId", getUserMiddleware, createMessageController);
  app.put("/api/chats/:chatId/:messageId", getUserMiddleware, updateMessageController);
  app.delete("/api/chats/:chatId/:messageId", getUserMiddleware, deleteMessageController);
};
