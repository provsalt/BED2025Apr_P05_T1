import {getMessages, createMessage, getMessage, updateMessage, deleteMessage} from "../../models/chat/messageModel.js";
import {getChat, updateChatTimestamp} from "../../models/chat/chatModel.js";
import {broadcastMessageCreated, broadcastMessageUpdated, broadcastMessageDeleted} from "../../utils/websocket.js";

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
export const getChatMessagesController = async (req, res) => {
  const chatId = req.params.chatId;
  if (!chatId) {
    return res.status(400).json({"message": "Chat ID is required"});
  }

  try {
    const messages = await getMessages(req.user.id, chatId);
    if (!messages || messages.length === 0) {
      return res.status(404).json({"message": "No messages found for this chat"});
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}

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
export const createMessageController = async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;

  if (!chatId || !message) {
    return res.status(400).json({"message": "Chat ID and message are required"});
  }

  try {
    const chat = await getChat(chatId);
    if (!chat) {
      return res.status(404).json({"message": "Chat not found"});
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      return res.status(403).json({"message": "You are not authorized to send messages in this chat"});
    }

    const messageId = await createMessage(req.user.id, message, chatId);
    await updateChatTimestamp(chatId);

    await broadcastMessageCreated(chatId, messageId, message, req.user.id);

    res.status(201).json({
      "message": "Message sent successfully",
      "messageId": messageId
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}

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
export const updateMessageController = async (req, res) => {
  const { chatId, messageId } = req.params;
  const { message } = req.body;

  if (!chatId || !messageId || !message) {
    return res.status(400).json({"message": "Chat ID, message ID, and message are required"});
  }

  try {
    const chat = await getChat(chatId);
    if (!chat) {
      return res.status(404).json({"message": "Chat not found"});
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      return res.status(403).json({"message": "You are not authorized to access this chat"});
    }

    const existingMessage = await getMessage(messageId);
    if (!existingMessage) {
      return res.status(404).json({"message": "Message not found"});
    }

    if (existingMessage.chat_id !== parseInt(chatId)) {
      return res.status(400).json({"message": "Message does not belong to this chat"});
    }

    const updated = await updateMessage(messageId, message, req.user.id);
    if (!updated) {
      return res.status(403).json({"message": "You can only edit your own messages"});
    }

    await updateChatTimestamp(chatId);

    await broadcastMessageUpdated(chatId, messageId, message, req.user.id);

    res.status(200).json({"message": "Message updated successfully"});
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}

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
export const deleteMessageController = async (req, res) => {
  const { chatId, messageId } = req.params;

  if (!chatId || !messageId) {
    return res.status(400).json({"message": "Chat ID and message ID are required"});
  }

  try {
    const chat = await getChat(chatId);
    if (!chat) {
      return res.status(404).json({"message": "Chat not found"});
    }

    if (chat.chat_initiator !== req.user.id && chat.chat_recipient !== req.user.id) {
      return res.status(403).json({"message": "You are not authorized to access this chat"});
    }

    const existingMessage = await getMessage(messageId);
    if (!existingMessage) {
      return res.status(404).json({"message": "Message not found"});
    }

    if (existingMessage.chat_id !== parseInt(chatId)) {
      return res.status(400).json({"message": "Message does not belong to this chat"});
    }

    const deleted = await deleteMessage(messageId, req.user.id);
    if (!deleted) {
      return res.status(403).json({"message": "You can only delete your own messages"});
    }

    await updateChatTimestamp(chatId);

    await broadcastMessageDeleted(chatId, messageId, req.user.id);

    res.status(200).json({"message": "Message deleted successfully"});
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}
