import {getChats, createChat, getChatBetweenUsers} from "../../models/chat/chatModel.js";
import {createMessage} from "../../models/chat/messageModel.js";
import express from "express";

/**
 * getChats fetches the list of users a user has had chatted with
 */
export const getChatsController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

  const chats = await getChats(req.user.id)

  if (!chats) {
    return res.status(404).json({"message": "No chats yet"})
  }
  res.status(200).json(chats)
}

export const createChatController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

  const { recipientId, message } = req.body;

  if (!recipientId || !message) {
    return res.status(400).json({"message": "recipientId and message are required"});
  }

  try {
    // Check if chat already exists between the two users
    const existingChat = await getChatBetweenUsers(req.user.id, recipientId);
    
    if (existingChat) {
      return res.status(409).json({
        "message": "Chat already exists between these users",
        "chatId": existingChat.id
      });
    }

    const chatId = await createChat(req.user.id, recipientId);
    await createMessage(req.user.id, message, chatId);
    
    res.status(201).json({
      "message": "Chat created successfully",
      "chatId": chatId
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}