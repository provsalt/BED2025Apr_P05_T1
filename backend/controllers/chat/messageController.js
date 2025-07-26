import {getMessages, createMessage, getMessage, updateMessage, deleteMessage} from "../../models/chat/messageModel.js";
import {getChat, updateChatTimestamp} from "../../models/chat/chatModel.js";
import {broadcastMessageCreated, broadcastMessageUpdated, broadcastMessageDeleted} from "../../utils/websocket.js";
import { ErrorFactory } from "../../utils/AppError.js";

/**
 * @openapi
 * /api/chats/{chatId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get all messages in a chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       400:
 *         description: Chat ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No messages found for this chat
 *       500:
 *         description: Internal server error
 */
export const getChatMessagesController = async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) {
      throw ErrorFactory.validation("Chat ID is required");
    }

    const messages = await getMessages(req.user.id, chatId);
    if (!messages || messages.length === 0) {
      throw ErrorFactory.notFound("Messages for this chat");
    }
    res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/chats/{chatId}:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new message in a chat
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 messageId:
 *                   type: integer
 *       400:
 *         description: Chat ID and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not authorized to send messages in this chat
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Internal server error
 */
export const createMessageController = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId || !message) {
      throw ErrorFactory.validation("Chat ID and message are required");
    }

    const chat = await getChat(chatId);
    if (!chat) {
      throw ErrorFactory.notFound("Chat");
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      throw ErrorFactory.forbidden("You are not authorized to send messages in this chat");
    }

    const messageId = await createMessage(req.user.id, message, chatId);
    await updateChatTimestamp(chatId);

    await broadcastMessageCreated(chatId, messageId, message, req.user.id);

    res.status(201).json({
      "message": "Message sent successfully",
      "messageId": messageId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/chats/{chatId}/{messageId}:
 *   put:
 *     tags:
 *       - Chat
 *     summary: Update a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       400:
 *         description: Chat ID, message ID, and message are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You can only edit your own messages
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */
export const updateMessageController = async (req, res, next) => {
  try {
    const { chatId, messageId } = req.params;
    const { message } = req.body;

    if (!chatId || !messageId || !message) {
      throw ErrorFactory.validation("Chat ID, message ID, and message are required");
    }

    const chat = await getChat(chatId);
    if (!chat) {
      throw ErrorFactory.notFound("Chat");
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      throw ErrorFactory.forbidden("You are not authorized to access this chat");
    }

    const existingMessage = await getMessage(messageId);
    if (!existingMessage) {
      throw ErrorFactory.notFound("Message");
    }

    if (existingMessage.chat_id !== parseInt(chatId)) {
      throw ErrorFactory.validation("Message does not belong to this chat");
    }

    const updated = await updateMessage(messageId, message, req.user.id);
    if (!updated) {
      throw ErrorFactory.forbidden("You can only edit your own messages");
    }

    await updateChatTimestamp(chatId);

    await broadcastMessageUpdated(chatId, messageId, message, req.user.id);

    res.status(200).json({"message": "Message updated successfully"});
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /api/chats/{chatId}/{messageId}:
 *   delete:
 *     tags:
 *       - Chat
 *     summary: Delete a message
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       400:
 *         description: Chat ID and message ID are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You can only delete your own messages
 *       404:
 *         description: Chat or message not found
 *       500:
 *         description: Internal server error
 */
export const deleteMessageController = async (req, res, next) => {
  try {
    const { chatId, messageId } = req.params;

    if (!chatId || !messageId) {
      throw ErrorFactory.validation("Chat ID and message ID are required");
    }

    const chat = await getChat(chatId);
    if (!chat) {
      throw ErrorFactory.notFound("Chat");
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      throw ErrorFactory.forbidden("You are not authorized to access this chat");
    }

    const existingMessage = await getMessage(messageId);
    if (!existingMessage) {
      throw ErrorFactory.notFound("Message");
    }

    if (existingMessage.chat_id !== parseInt(chatId)) {
      throw ErrorFactory.validation("Message does not belong to this chat");
    }

    const deleted = await deleteMessage(messageId, req.user.id);
    if (!deleted) {
      throw ErrorFactory.forbidden("You can only delete your own messages");
    }

    await updateChatTimestamp(chatId);

    await broadcastMessageDeleted(chatId, messageId, req.user.id);

    res.status(200).json({"message": "Message deleted successfully"});
  } catch (error) {
    next(error);
  }
};
