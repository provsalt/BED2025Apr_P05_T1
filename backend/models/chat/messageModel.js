import sql from "mssql";
import {dbConfig} from "../../config/db.js";
import {getChat} from "./chatModel.js";

export const getMessages = async (userId, chatId) => {
  const chat = await getChat(chatId)
  if (!chat) {
    return null
  }

  if (chat.chat_initiator === userId || chat.chat_recipient === userId) {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM ChatMsg WHERE chat_id = @chat_id";
    const request = db.request();
    request.input("chat_id", chatId);
    const result = await request.query(query)
    console.log(result)

    return result.recordset.length === 0 ? null : result.recordset
  }
  return null
}

export const createMessage = async (senderId, message, chatId) => {
  const chat = await getChat(chatId)

  if (!chat) {
    return false
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
}

export const getMessage = async (messageId) => {
  const db = await sql.connect(dbConfig);
  const query = "SELECT * FROM ChatMsg WHERE id = @messageId";
  const request = db.request();
  request.input("messageId", messageId);
  const result = await request.query(query);
  
  return result.recordset.length > 0 ? result.recordset[0] : null;
}

export const updateMessage = async (messageId, newMessage, userId) => {
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
}

export const deleteMessage = async (messageId, userId) => {
  const db = await sql.connect(dbConfig);
  const query = "DELETE FROM ChatMsg WHERE id = @messageId AND sender = @userId";
  const request = db.request();
  request.input("messageId", messageId);
  request.input("userId", userId);
  const result = await request.query(query);
  
  return result.rowsAffected[0] > 0;
}