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
          } else if (event.type === "message_updated") {
            setMessages((prevMessages) => 
              prevMessages.map((msg) => 
                msg.id === event.messageId 
                  ? { ...msg, msg: event.message }
                  : msg
              )
            );
          } else if (event.type === "message_deleted") {
            setMessages((prevMessages) => 
              prevMessages.filter((msg) => msg.id !== event.messageId)
            );
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

  const handleMessageUpdated = (messageId, newMessage) => {
    setMessages((prevMessages) => 
      prevMessages.map((msg) => 
        msg.id === messageId 
          ? { ...msg, msg: newMessage }
          : msg
      )
    );
  };

  const handleMessageDeleted = (messageId) => {
    setMessages((prevMessages) => 
      prevMessages.filter((msg) => msg.id !== messageId)
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 max-h-[70svh] overflow-y-auto p-6"
    >
      <div className="flex flex-col space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages found</p>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              messageId={msg.id}
              chatId={chatId}
              isSender={msg.sender === currentUserId}
              onMessageUpdated={handleMessageUpdated}
              onMessageDeleted={handleMessageDeleted}
            >
              {msg.msg}
            </Message>
          ))
        )}
      </div>
    </div>
  );
};