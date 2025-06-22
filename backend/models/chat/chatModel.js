import sql from "mssql";
import {dbConfig} from "../../config/db.js";

export const getChats = async (userId) => {
  const db = await sql.connect(dbConfig);
  const query = "SELECT * FROM Chat WHERE message_receiver = @id OR message_sender = @id ORDER BY updated_at DESC;";
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

export const createChat = async (chatId) => {
  const db = await sql.connect(dbConfig);
}