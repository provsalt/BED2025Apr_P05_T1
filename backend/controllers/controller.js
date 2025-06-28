import {createUserController, getCurrentUserController } from "./user/userController.js";
import {createAdminController, getCurrentAdminController} from "./admin/adminController.js";
import {adminAuthorizeMiddleware} from "../middleware/adminAuthorize.js";
import {getUserMiddleware} from "../middleware/getUser.js";
import { createAnnouncementController, getAllAnnouncementsController } from "./admin/announcementController.js";
/**
 * Controller function to set up routes for the application.
 * @param app {import("express").Application} - The Express application instance.
 * @constructor
 */
export const Controller = (app) => {
  // app.get("/api/users/:id", getUserController)
  app.post("/api/user", createUserController)
  app.get("/api/user", getUserMiddleware, getCurrentUserController)
  app.post("/api/admin", createAdminController)
  app.get("/api/admin", adminAuthorizeMiddleware, getCurrentAdminController)
  app.post("/api/admin/announcement", adminAuthorizeMiddleware, createAnnouncementController)
  app.get("/api/admin/announcement", adminAuthorizeMiddleware, getAllAnnouncementsController)
}