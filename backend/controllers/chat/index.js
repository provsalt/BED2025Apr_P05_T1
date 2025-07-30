
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

router.get("/", getChatsController);
router.post("/", createChatController);
router.get("/:chatId", getChatMessagesController);
router.post("/:chatId", createMessageController);
router.put("/:chatId/:messageId", updateMessageController);
router.delete("/:chatId/:messageId", deleteMessageController);

export default router;
