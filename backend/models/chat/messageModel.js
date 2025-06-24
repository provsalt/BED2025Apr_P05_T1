import sql from "mssql";
import {dbConfig} from "../../config/db.js";
import {getChat} from "./chatModel.js";

export const getMessages = async (userId, chatId) => {
  const chat = await getChat(chatId)
  if (!chat) {
    return null
  }

  if (chat.message_sender !== userId || chat.message_receiver !== userId) {
    return null
  }

  const db = await sql.connect(dbConfig);
  const query = "SELECT * FROM ChatMsg WHERE chat_id = @chat_id";
  const request = db.request();
  request.input("id", userId);
  const result = await request.query(query)

  return result.recordset.length === 0 ? null : result.recordset
}

export const createMessage = async (fromUserId, toUserId, message, chatId) => {
  const chat = await getChat(chatId)

  if (!chat) {
    return false
  }

  console.log(chat)
}