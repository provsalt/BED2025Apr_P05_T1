import {getMessages} from "../../models/chat/messageModel.js";

export const getChatMessagesController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({"message": "Unauthorized"});
  }

  const chatId = req.params.chatId;
  if (!chatId) {
    return res.status(400).json({"message": "Chat ID is required"});
  }

  try {
    const messages = await getMessages(req.user.id, chatId);
    if (!messages || messages.length === 0) {
      return res.status(404).json({"message": "No messages found for this chat"});
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({"message": "Internal server error"});
  }
}