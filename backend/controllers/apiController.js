import userRouter from "./user/index.js";
import chatRouter from "./chat/index.js";
import nutritionRouter from "./nutrition/index.js";
import s3Router from "./s3/index.js";
import {Router} from "express";

/**
 * ApiController function setup api related routes for the application.
 * @constructor
 */
export const ApiController = () => {
  const router = Router();
  router.use("/user", userRouter);
  router.use("/chats", chatRouter);
  router.use("/nutrition", nutritionRouter);
  router.use("/s3", s3Router);
  return router;
}