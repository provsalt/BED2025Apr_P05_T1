import sql from "mssql";
import {dbConfig} from "../../config/db.js";
import {getChat} from "./chatModel.js";
import { ErrorFactory } from "../../utils/AppError.js";

export const getMessages = async (userId, chatId) => {
  try {
    const chat = await getChat(chatId)
    if (!chat) {
      return null
    }

    if (chat.chat_initiator === userId || chat.chat_recipient === userId) {
      const db = await sql.connect(dbConfig);
      const query = "SELECT * FROM ChatMsg WHERE chat_id = @chat_id ORDER BY msg_created_at ASC";
      const request = db.request();
      request.input("chat_id", chatId);
      const result = await request.query(query)

      return result.recordset.length === 0 ? [] : result.recordset
    }
    throw ErrorFactory.forbidden("You do not have permission to view these messages");
  } catch (error) {
    if (error.statusCode) throw error;
    throw ErrorFactory.database(`Failed to get messages: ${error.message}`, "Unable to fetch messages", error);
  }
}

export const createMessage = async (senderId, message, chatId) => {
  try {
    const chat = await getChat(chatId)

    if (!chat) {
      throw ErrorFactory.notFound("Chat");
    }

    const db = await sql.connect(dbConfig);
    const query = `
      INSERT INTO ChatMsg (chat_id, msg, sender, msg_created_at)
      VALUES (@chatId, @message, @senderId, GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = db.request();
    request.input("chatId", chatId);
    request.input("message", message);
    request.input("senderId", senderId);
    const result = await request.query(query);
    
    return result.recordset[0].id;
  } catch (error) {
    if (error.statusCode) throw error;
    throw ErrorFactory.database(`Failed to create message: ${error.message}`, "Unable to send message", error);
  }
}

export const getMessage = async (messageId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM ChatMsg WHERE id = @messageId";
    const request = db.request();
    request.input("messageId", messageId);
    const result = await request.query(query);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    throw ErrorFactory.database(`Failed to get message: ${error.message}`, "Unable to fetch message", error);
  }
}

export const updateMessage = async (messageId, newMessage, userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      UPDATE ChatMsg 
      SET msg = @newMessage 
      WHERE id = @messageId AND sender = @userId
    `;
    const request = db.request();
    request.input("messageId", messageId);
    request.input("newMessage", newMessage);
    request.input("userId", userId);
    const result = await request.query(query);
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to update message: ${error.message}`, "Unable to update message", error);
  }
}

export const deleteMessage = async (messageId, userId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "DELETE FROM ChatMsg WHERE id = @messageId AND sender = @userId";
    const request = db.request();
    request.input("messageId", messageId);
    request.input("userId", userId);
    const result = await request.query(query);
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to delete message: ${error.message}`, "Unable to delete message", error);
  }
}