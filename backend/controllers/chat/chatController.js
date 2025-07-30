import {getChats, createChat, getChatBetweenUsers} from "../../models/chat/chatModel.js";
import {createMessage} from "../../models/chat/messageModel.js";
import {broadcastMessageCreated} from "../../utils/websocket.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/chats:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get all chats for the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No chats yet
 */
/**
 * getChats fetches the list of users a user has had chatted with
 */
export const getChatsController = async (req, res, next) => {
  try {
    const chats = await getChats(req.user.id);

    if (!chats) {
      throw ErrorFactory.notFound("Chats");
    }
    res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/chats:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new chat
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 chatId:
 *                   type: integer
 *       400:
 *         description: recipientId and message are required
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Chat already exists between these users
 *       500:
 *         description: Internal server error
 */
export const createChatController = async (req, res, next) => {
  try {
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      throw ErrorFactory.validation("recipientId and message are required");
    }

    if (recipientId === req.user.id) {
      throw ErrorFactory.validation("You cannot chat with yourself");
    }

    // Check if chat already exists between the two users
    const existingChat = await getChatBetweenUsers(req.user.id, recipientId);
    
    if (existingChat) {
      throw ErrorFactory.conflict(
        "Chat already exists between these users",
        `Chat already exists. Chat ID: ${existingChat.id}`
      );
    }

    const chatId = await createChat(req.user.id, recipientId);
    const messageId = await createMessage(req.user.id, message, chatId);
    
    await broadcastMessageCreated(chatId, messageId, message, req.user.id);
    
    res.status(201).json({
      "message": "Chat created successfully",
      "chatId": chatId
    });
  } catch (error) {
    next(error);
  }
};
