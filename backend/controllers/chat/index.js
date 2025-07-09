
import { Router } from "express";
import { getUserMiddleware } from "../../middleware/getUser.js";
import {
  getChatsController,
  createChatController
} from "./chatController.js";
import {
  getChatMessagesController,
  createMessageController,
  updateMessageController,
  deleteMessageController
} from "./messageController.js";

const router = Router();

router.get("/", getUserMiddleware, getChatsController);
router.post("/", getUserMiddleware, createChatController);
router.get("/:chatId", getUserMiddleware, getChatMessagesController);
router.post("/:chatId", getUserMiddleware, createMessageController);
router.put("/:chatId/:messageId", getUserMiddleware, updateMessageController);
router.delete("/:chatId/:messageId", getUserMiddleware, deleteMessageController);

export default router;
