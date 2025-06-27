"use client";

import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatInput } from "@/components/chat/ChatInput";
import { fetcher } from "@/lib/fetcher";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";

export const ChatContent = ({ chatId }) => {
  const { id, isAuthenticated } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    if (!isAuthenticated) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetcher( `${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`);
      setMessages(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchMessages();
  }, [chatId, isAuthenticated]);

  const handleSendMessage = async (messageContent) => {
    const optimisticMessage = {
      id: Date.now(),
      msg: messageContent,
      sender: id,
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/chats/${chatId}`, {
        method: "POST",
        body: JSON.stringify({ message: messageContent }),
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== optimisticMessage.id),
      );
    }

    await fetchMessages();
  };

  if (error) {
    return <p>Error loading messages.</p>;
  }

  if (isLoading && !messages.length) return <p>Loading...</p>;

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 min-h-0">
        <ChatMessages currentUserId={id} messages={messages} />
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

