import {useContext, useEffect, useState} from "react";
import {UserContext} from "@/provider/UserContext.js";
import {fetcher} from "@/lib/fetcher.js";
import {ChatList} from "./ChatList.jsx";

export const ChatSideBar = () => {
  const user = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await fetcher(import.meta.env.VITE_BACKEND_URL + "/api/chats");
        setConversations(
          chats.map((chat) => ({
            id: chat.id,
            username: chat.chat_initiator === user.id ? chat.chat_recipient : chat.chat_initiator,
            lastMessage: "No messages yet", // Placeholder for lastMessage
          }))
        );
      } catch (err) {
        setError(err.message);
      }
    };

    if (user) {
      fetchChats();
    }
  }, [user]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="chat-sidebar">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <ChatList
          conversations={conversations}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
        />
      )}
    </div>
  );
};
