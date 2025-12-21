import sql from "mssql";
import {dbConfig} from "../../config/db.js";
import { ErrorFactory } from "../../utils/AppError.js";

export const getChats = async (userId) => {
  try {
    const db = await sql.connect(dbConfig);
    // this query left joins a different select from ChatMessage and splices the current Chat table
    const query = `
      SELECT c.*, lm.msg as last_message, lm.msg_created_at as last_message_time
      FROM Chat c
      LEFT JOIN (
        SELECT chat_id, msg, msg_created_at
        FROM (
            SELECT chat_id, msg, msg_created_at,
                   ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY msg_created_at DESC) as rn
            FROM ChatMsg
        ) t
        WHERE rn = 1
      ) lm ON c.id = lm.chat_id
      WHERE c.chat_initiator = @id OR c.chat_recipient = @id
      ORDER BY c.updated_at DESC;
    `
    const request = db.request();
    request.input("id", userId);
    const result = await request.query(query)

    return result.recordset.length === 0 ? null : result.recordset
  } catch (error) {
    throw ErrorFactory.database(`Failed to get chats: ${error.message}`, "Unable to process request at this time", error);
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
    throw ErrorFactory.database(`Failed to get chat: ${error.message}`, "Unable to process request at this time", error);
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
    throw ErrorFactory.database(`Failed to create chat: ${error.message}`, "Unable to process request at this time", error);
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
    throw ErrorFactory.database(`Failed to get chat between users: ${error.message}`, "Unable to process request at this time", error);
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
    throw ErrorFactory.database(`Failed to update chat timestamp: ${error.message}`, "Unable to process request at this time", error);
  }
}

export const getOrCreateChat = async (initiatorId, recipientId) => {
  const transaction = new sql.Transaction(await sql.connect(dbConfig));
  try {
    await transaction.begin();
    
    // 1. Check if chat exists
    const checkQuery = `
      SELECT id FROM Chat 
      WHERE (chat_initiator = @userId1 AND chat_recipient = @userId2) 
         OR (chat_initiator = @userId2 AND chat_recipient = @userId1)
    `;
    const checkRequest = new sql.Request(transaction);
    checkRequest.input("userId1", initiatorId);
    checkRequest.input("userId2", recipientId);
    const checkResult = await checkRequest.query(checkQuery);
    
    if (checkResult.recordset.length > 0) {
      await transaction.commit();
      return { chatId: checkResult.recordset[0].id, created: false };
    }
    
    // 2. Create chat if not exists
    const createQuery = `
      INSERT INTO Chat (chat_initiator, chat_recipient, created_at, updated_at)
      VALUES (@initiatorId, @recipientId, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS id;
    `;
    const createRequest = new sql.Request(transaction);
    createRequest.input("initiatorId", initiatorId);
    createRequest.input("recipientId", recipientId);
    const createResult = await createRequest.query(createQuery);
    
    await transaction.commit();
    return { chatId: createResult.recordset[0].id, created: true };
  } catch (error) {
    await transaction.rollback();
    throw ErrorFactory.database(`Failed to get or create chat: ${error.message}`, "Unable to process request at this time", error);
  }
}