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
        // Fetch user details for each chat
        const chatsWithUserDetails = await Promise.all(
          chats.map(async (chat) => {
            const otherUserId = chat.chat_initiator === user.id ? chat.chat_recipient : chat.chat_initiator;
            try {
              const otherUser = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/users/${otherUserId}`);
              return {
                id: chat.id,
                name: otherUser.name ? otherUser.name : `User ${otherUserId}`,
                profile_picture_url: otherUser.profile_picture_url || null,
                lastMessage: chat.last_message,
                lastMessageTime: chat.last_message_time
              };
            } catch (err) {
              return {
                id: chat.id,
                name: `User ${otherUserId}`,
                profile_picture_url: null,
                lastMessage: chat.last_message,
                lastMessageTime: chat.last_message_time
              };
            }
          })
        );
        setConversations(chatsWithUserDetails);
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
    <div className="chat-sidebar w-full max-w-sm bg-muted border-r p-6 space-y-2">
      {error ? (
        <div className="w-full max-w-sm bg-muted p-6 space-y-2">
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
