import {createUserController, getCurrentUserController, changePasswordController, getUserController, updateUserController, uploadProfilePictureController} from "./user/userController.js";  // Import user controller functions   "getUserController, updateUserController"
import {getUserMiddleware} from "../middleware/getUser.js";
import { uploadProfilePic } from "../middleware/userSettingsUpload.js";
import sql from "mssql";
import { dbConfig } from "../config/db.js";


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

  // Authenticated user
  app.get("/api/user", getUserMiddleware, getCurrentUserController)

  // Password update
  app.put("/api/user/:id/password", getUserMiddleware, changePasswordController);

  // Profile picture upload
  app.post("/api/user/:id/picture", uploadProfilePic.single("avatar"), uploadProfilePictureController);
};