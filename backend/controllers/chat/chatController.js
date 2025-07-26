import {getChats, createChat, getChatBetweenUsers} from "../../models/chat/chatModel.js";
import {createMessage} from "../../models/chat/messageModel.js";
import {broadcastMessageCreated} from "../../utils/websocket.js";

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
export const getChatsController = async (req, res) => {
  const chats = await getChats(req.user.id)

  if (!chats) {
    return res.status(404).json({"message": "No chats yet"})
  }
  res.status(200).json(chats)
}

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
export const createChatController = async (req, res) => {
  const { recipientId, message } = req.body;

  if (!recipientId || !message) {
    return res.status(400).json({"message": "recipientId and message are required"});
  }

  if (recipientId === req.user.id) {
    return res.status(400).json({"message": "You cannot chat with yourself"});
  }

  try {
    // Check if chat already exists between the two users
    const existingChat = await getChatBetweenUsers(req.user.id, recipientId);
    
    if (existingChat) {
      return res.status(409).json({
        "message": "Chat already exists between these users",
        "chatId": existingChat.id
      });
    }

    const chatId = await createChat(req.user.id, recipientId);
    const messageId = await createMessage(req.user.id, message, chatId);
    
    await broadcastMessageCreated(chatId, messageId, message, req.user.id);
    
    res.status(201).json({
      "message": "Chat created successfully",
      "chatId": chatId
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}
