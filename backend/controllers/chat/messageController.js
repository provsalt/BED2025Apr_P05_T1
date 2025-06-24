import {getMessages, createMessage, getMessage, updateMessage, deleteMessage} from "../../models/chat/messageModel.js";
import {getChat, updateChatTimestamp} from "../../models/chat/chatModel.js";

export const getChatMessagesController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

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

export const createMessageController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

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

    res.status(201).json({
      "message": "Message sent successfully",
      "messageId": messageId
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}

export const updateMessageController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

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

    res.status(200).json({"message": "Message updated successfully"});
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}

export const deleteMessageController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

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

    res.status(200).json({"message": "Message deleted successfully"});
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}