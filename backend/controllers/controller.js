import {createUserController, getCurrentUserController, loginUserController} from "./user/userController.js";
import {getUserMiddleware} from "../middleware/getUser.js";
import {getChatsController, createChatController} from "./chat/chatController.js";
import {getChatMessagesController, createMessageController, updateMessageController, deleteMessageController} from "./chat/messageController.js";
import {authorizeRole} from "../middleware/authorizeRole.js"
import { createUploadMiddleware } from "../middleware/upload.js";
import { validateImageType } from "../middleware/validateImage.js";
import { prepareImageForOpenAI } from "../middleware/resizeImage.js";
import { compressImage } from "../middleware/compression.js";
import { uploadNutritionImage } from "./nutrition/foodImageController.js";

/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
  // app.get("/api/users/:id", getUserController)
  app.post("/api/user", createUserController)
  app.post("/api/user/login", loginUserController)
  app.get("/api/user", getUserMiddleware, getCurrentUserController)

  app.get("/api/chats", getUserMiddleware, getChatsController)
  app.post("/api/chats", getUserMiddleware, createChatController)
  app.get("/api/chats/:chatId", getUserMiddleware, getChatMessagesController)
  
  app.post("/api/chats/:chatId", getUserMiddleware, createMessageController)
  app.put("/api/chats/:chatId/:messageId", getUserMiddleware, updateMessageController)
  app.delete("/api/chats/:chatId/:messageId", getUserMiddleware, deleteMessageController)

  const upload = createUploadMiddleware({
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSize: 5 * 1024 * 1024,
  });
  // Nutrition image uploading route
  app.post(
    "/api/nutrition/food-image-upload",
    upload.single("image"),
    validateImageType,
    prepareImageForOpenAI,
    compressImage,
    uploadNutritionImage
  );
}