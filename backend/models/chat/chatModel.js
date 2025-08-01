import sql from "mssql";
import {dbConfig} from "../../config/db.js";
import { ErrorFactory } from "../../utils/AppError.js";

export const getChats = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    // this query left joins a different select from ChatMessage and splices the current Chat table
    const query = `
      SELECT c.*, lm.last_message, lm.last_message_time
      FROM Chat c
             LEFT JOIN (
        SELECT
          chat_id,
          MAX(msg) as last_message,
          MAX(msg_created_at) as last_message_time
        FROM ChatMsg
        GROUP BY chat_id
      ) lm ON c.id = lm.chat_id
      WHERE c.chat_initiator = @id OR c.chat_recipient = @id
      ORDER BY c.updated_at DESC;
    `
    const request = db.request();
    request.input("id", userId);
    const result = await request.query(query)

    return result.recordset.length === 0 ? null : result.recordset
  } catch (error) {
    throw ErrorFactory.database(`Failed to get chats: ${error.message}`);
  }
}

export const getChat = async (chatId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "SELECT * FROM Chat WHERE id=@id";
    const request = db.request();
    request.input("id", chatId);
    const result = await request.query(query)

    return result.recordset.length === 0 ? null : result.recordset[0]
  } catch (error) {
    throw ErrorFactory.database(`Failed to get chat: ${error.message}`);
  }
}

export const createChat = async (initiatorId, recipientId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      INSERT INTO Chat (chat_initiator, chat_recipient, created_at, updated_at)
      VALUES (@initiatorId, @recipientId, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const request = db.request();
    request.input("initiatorId", initiatorId);
    request.input("recipientId", recipientId);
    const result = await request.query(query);
    
    return result.recordset[0].id;
  } catch (error) {
    throw ErrorFactory.database(`Failed to create chat: ${error.message}`);
  }
}

export const getChatBetweenUsers = async (userId1, userId2) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = `
      SELECT * FROM Chat 
      WHERE (chat_initiator = @userId1 AND chat_recipient = @userId2) 
         OR (chat_initiator = @userId2 AND chat_recipient = @userId1)
    `;
    const request = db.request();
    request.input("userId1", userId1);
    request.input("userId2", userId2);
    const result = await request.query(query);
    
    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    throw ErrorFactory.database(`Failed to get chat between users: ${error.message}`);
  }
}

export const updateChatTimestamp = async (chatId) => {
  try {
    const db = await sql.connect(dbConfig);
    const query = "UPDATE Chat SET updated_at = GETDATE() WHERE id = @chatId";
    const request = db.request();
    request.input("chatId", chatId);
    const result = await request.query(query);
    
    return result.rowsAffected[0] > 0;
  } catch (error) {
    throw ErrorFactory.database(`Failed to update chat timestamp: ${error.message}`);
  }
}