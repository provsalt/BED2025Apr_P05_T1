import {createUserController, getCurrentUserController, loginUserController} from "./user/userController.js";
import {getUserMiddleware} from "../middleware/getUser.js";
import {getChatsController, createChatController} from "./chat/chatController.js";
import {getChatMessagesController, createMessageController, updateMessageController, deleteMessageController} from "./chat/messageController.js";
import {authorizeRole} from "../middleware/authorizeRole.js"
import { addAdminRoleController, getAllAdminsController, removeAdminRoleController, getAllUsersController, getUserByIdController, updateUserRoleController, deleteUserController, getUsersByRoleController, bulkUpdateUserRolesController } from "./admin/adminController.js";
import { AdminController } from "./admin/announcementcontroller.js";

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

  // Admin routes (no separate login needed - use regular login)
  app.get("/api/admin", getUserMiddleware, getAllAdminsController)
  app.post("/api/admin/add-role", getUserMiddleware, addAdminRoleController)
  app.post("/api/admin/remove-role", getUserMiddleware, removeAdminRoleController)

  // User management routes (Admin only)
  app.get("/api/admin/users", getUserMiddleware, getAllUsersController)
  app.get("/api/admin/users/:userId", getUserMiddleware, getUserByIdController)
  app.put("/api/admin/users/:userId/role", getUserMiddleware, updateUserRoleController)
  app.delete("/api/admin/users/:userId", getUserMiddleware, deleteUserController)
  app.get("/api/admin/users/role/:role", getUserMiddleware, getUsersByRoleController)
  app.put("/api/admin/users/bulk-role-update", getUserMiddleware, bulkUpdateUserRolesController)

  // Announcement routes (if needed)
  AdminController(app);
}