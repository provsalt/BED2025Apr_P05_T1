import { getIO } from "../config/socket.js";
import { getChat } from "../models/chat/chatModel.js";

/**
 * Broadcast message event to users in a chat
 * @param {string} eventType - Type of event (message_created, message_updated, message_deleted)
 * @param {number} chatId - Chat ID
 * @param {object} messageData - Message data to broadcast
 */
export const broadcastToChat = async (eventType, chatId, messageData) => {
  try {
    const io = getIO();
    const chat = await getChat(chatId);
    
    if (!chat) {
      console.error('Chat not found for broadcasting:', chatId);
      return;
    }

    const event = {
      type: eventType,
      chatId: parseInt(chatId),
      timestamp: new Date().toISOString(),
      ...messageData
    };

    io.to(`user_${chat.chat_initiator}`).emit('chat_update', event);
    io.to(`user_${chat.chat_recipient}`).emit('chat_update', event);
    
  } catch (error) {
    console.error('Error broadcasting to chat:', error);
  }
};

/**
 * Broadcast message created event
 */
export const broadcastMessageCreated = async (chatId, messageId, message, senderId) => {
  await broadcastToChat('message_created', chatId, {
    messageId: parseInt(messageId),
    message,
    sender: parseInt(senderId)
  });
};

/**
 * Broadcast message updated event
 */
export const broadcastMessageUpdated = async (chatId, messageId, newMessage, senderId) => {
  await broadcastToChat('message_updated', chatId, {
    messageId: parseInt(messageId),
    message: newMessage,
    sender: parseInt(senderId)
  });
};

/**
 * Broadcast message deleted event
 */
export const broadcastMessageDeleted = async (chatId, messageId, senderId) => {
  await broadcastToChat('message_deleted', chatId, {
    messageId: parseInt(messageId),
    sender: parseInt(senderId)
  });
};