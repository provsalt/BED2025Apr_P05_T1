import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import announcementRouter from "./announcementcontroller.js";
const router = Router();
// import {  addAdminRoleController,
//   getAllAdminsController,
//   removeAdminRoleController,
//   getAllUsersController,
//   getUserByIdController,
//   updateUserRoleController,
//   deleteUserController,
//   getUsersByRoleController,
//   bulkUpdateUserRolesController } from "../user/userRoleController.js";

// Apply authentication middleware to all admin routes
router.use(getUserMiddleware);

// router.post("/admins", addAdminRoleController);
// router.get("/admins", getAllAdminsController);
// router.delete("/admins/:id", removeAdminRoleController);
// router.get("/users", getAllUsersController);
// router.get("/users/:id", getUserByIdController);
// router.put("/users/:id/role", updateUserRoleController);
// router.delete("/users/:id", deleteUserController);
// router.get("/users/role/:role", getUsersByRoleController);
// router.put("/users/role/bulk", bulkUpdateUserRolesController);

// Announcement routes
router.use("/announcements", announcementRouter);

export default router;