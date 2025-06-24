import sql from "mssql";
import {dbConfig} from "../../config/db.js";

export const getChats = async (userId) => {
  const db = await sql.connect(dbConfig);
  const query = "SELECT * FROM Chat WHERE chat_initiator = @id OR chat_recipient = @id ORDER BY updated_at DESC;";
  const request = db.request();
  request.input("id", userId);
  const result = await request.query(query)

  return result.recordset.length === 0 ? null : result.recordset
}

export const getChat = async (chatId) => {
  const db = await sql.connect(dbConfig);
  const query = "SELECT * FROM Chat WHERE id=@id";
  const request = db.request();
  request.input("id", chatId);
  const result = await request.query(query)

  return result.recordset.length === 0 ? null : result.recordset[0]
}

export const createChat = async (initiatorId, recipientId) => {
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
}

export const getChatBetweenUsers = async (userId1, userId2) => {
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
}

export const updateChatTimestamp = async (chatId) => {
  const db = await sql.connect(dbConfig);
  const query = "UPDATE Chat SET updated_at = GETDATE() WHERE id = @chatId";
  const request = db.request();
  request.input("chatId", chatId);
  const result = await request.query(query);
  
  return result.rowsAffected[0] > 0;
}