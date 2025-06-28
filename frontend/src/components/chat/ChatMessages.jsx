import React, { useEffect, useRef, useState } from "react";
import { Message } from "@/components/chat/Message";
import { useSocket } from "@/provider/SocketProvider";

export const ChatMessages = ({ messages: initialMessages, currentUserId, chatId }) => {
  const [messages, setMessages] = useState(initialMessages);
  const containerRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (socket) {
      socket.on("chat_update", (event) => {
        if (event.chatId === Number(chatId)) {
          if (event.type === "message_created") {
            setMessages((prevMessages) => [...prevMessages, {
              id: event.messageId,
              msg: event.message,
              sender: event.sender,
            }]);
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("chat_update");
      }
    };
  }, [socket, chatId]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 max-h-[70svh] overflow-y-auto p-4"
    >
      <div className="flex flex-col space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages found</p>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              isSender={msg.sender === currentUserId}
            >
              {msg.msg}
            </Message>
          ))
        )}
      </div>
    </div>
  );
};