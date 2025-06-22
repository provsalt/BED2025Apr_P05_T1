import {getChats} from "../../models/chat/chatModel.js";
import express from "express";

/**
 * getChats fetches the list of users a user has had chatted with
 * @param req {express.Request}
 * @param res {express.Response}
 */
export const getChatsController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

  const chats = await getChats()

  if (!chats) {
    return res.status(404).json({"message": "No chats yet"})
  }
  return res.status(200).json(chats)
}