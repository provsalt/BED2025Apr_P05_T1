import {useContext, useEffect, useState} from "react";
import {UserContext} from "@/provider/UserContext.js";
import {fetcher} from "@/lib/fetcher.js";
import {ChatList} from "./ChatList.jsx";
import {useParams} from "react-router";

export const ChatSideBar = () => {
  const user = useContext(UserContext);
  const [conversations, setConversations] = useState([]);
  const { chatId } = useParams();
  const [selectedChatId, setSelectedChatId] = useState(Number(chatId));
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await fetcher(import.meta.env.VITE_BACKEND_URL + "/api/chats");
        setConversations(
          chats.map((chat) => ({
            id: chat.id,
            username: chat.chat_initiator === user.id ? chat.chat_recipient : chat.chat_initiator,
            lastMessage: chat.last_message,
            lastMessageTime: chat.last_message_time
          }))
        );
      } catch (err) {
        setError(err.message);
      }
    };

    if (user.isAuthenticated) {
      fetchChats();
    }
  }, [user]);

  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
  };

  return (
    <div className="chat-sidebar w-full max-w-sm bg-gray-50 border-r p-4 space-y-2">
      {error ? (
        <div className="w-full max-w-sm bg-gray-50 p-4 space-y-2">
          No chats yet
        </div>
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
