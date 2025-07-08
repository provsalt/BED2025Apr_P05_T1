import { createUploadMiddleware } from "../middleware/upload.js";
import { validateImageType } from "../middleware/validateImage.js";
import { prepareImageForOpenAI } from "../middleware/resizeImage.js";
import { uploadNutritionImage } from "./nutrition/foodImageController.js";
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
import { createMedication } from "./medical/medicalController.js";

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

  const upload = createUploadMiddleware({
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSize: 5 * 1024 * 1024,
  });
  // Nutrition image uploading route
  app.post(
"/api/nutrition/food/upload",
    upload.single("image"),
    validateImageType,
    prepareImageForOpenAI,
    compressImage,
    uploadNutritionImage
  );

  app.get("/api/s3", getFileByKey)

  // Medication Reminders
  app.post(
    "/api/medications",
    getUserMiddleware,
    createUploadMiddleware({
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSize: 5 * 1024 * 1024,
    }).single("image"),
    createMedication
  );
};
