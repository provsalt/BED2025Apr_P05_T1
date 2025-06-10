import {createUserController, getCurrentUserController, changePasswordController, getUserController, updateUserController} from "./user/userController.js";  // Import user controller functions   "getUserController, updateUserController"
import {getUserMiddleware} from "../middleware/getUser.js";

/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
  // app.get("/api/users/:id", getUserController)
  // app.put("/api/users/:id", updateUserController);
  app.post("/api/user", createUserController)
  app.get("/api/user", getUserMiddleware, getCurrentUserController)
  app.put("/api/users/:id/password", changePasswordController);
  app.get("/api/users/:id", getUserController);
  app.put("/api/users/:id", updateUserController);
}