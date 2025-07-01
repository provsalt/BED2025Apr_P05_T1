
import {createUserController, getCurrentUserController, loginUserController, changePasswordController, getUserController, updateUserController, uploadProfilePictureController} from "./user/userController.js";  // Import user controller functions   "getUserController, updateUserController"

import {getUserMiddleware} from "../middleware/getUser.js";

import { uploadProfilePic } from "../middleware/userSettingsUpload.js";
import sql from "mssql";
import { dbConfig } from "../config/db.js";
import {getChatsController, createChatController} from "./chat/chatController.js";
import {getChatMessagesController, createMessageController, updateMessageController, deleteMessageController} from "./chat/messageController.js";


/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
  // User CRUD
  app.get("/api/user/:id", getUserController)
  app.put("/api/user/:id", updateUserController);
  app.post("/api/user", createUserController)
  app.post("/api/user/login", loginUserController)
  app.get("/api/user", getUserMiddleware, getCurrentUserController)


  app.put("/api/user/:id/password", getUserMiddleware, changePasswordController);

  // Profile picture upload
  app.post("/api/user/:id/picture", uploadProfilePic.single("avatar"), uploadProfilePictureController);

  app.get("/api/chats", getUserMiddleware, getChatsController)
  app.post("/api/chats", getUserMiddleware, createChatController)
  app.get("/api/chats/:chatId", getUserMiddleware, getChatMessagesController)
  
  app.post("/api/chats/:chatId", getUserMiddleware, createMessageController)
  app.put("/api/chats/:chatId/:messageId", getUserMiddleware, updateMessageController)
  app.delete("/api/chats/:chatId/:messageId", getUserMiddleware, deleteMessageController)
}
