import userRouter from "./user/index.js";
import chatRouter from "./chat/index.js";
import nutritionRouter from "./nutrition/index.js";
import s3Router from "./s3/index.js";
import medicalRouter from "./medical/index.js";
import {Router} from "express";
import announcementsRouter from "./announcements/index.js";

/**
 * ApiController function setup api related routes for the application.
 * @constructor
 */
export const ApiController = () => {
  const router = Router();
  router.use("/users", userRouter);
  router.use("/chats", chatRouter);
  router.use("/nutrition", nutritionRouter);
  router.use("/s3", s3Router);
  router.use("/medications", medicalRouter);
  router.use("/announcements", announcementsRouter); // Add public announcements route
  return router;
}