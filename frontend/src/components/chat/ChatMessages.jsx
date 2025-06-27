import React, { useEffect, useRef } from "react";
import { Message } from "@/components/chat/Message";

export const ChatMessages = ({
                               messages,
                               currentUserId,
                             }) => {
  const containerRef = useRef(null);

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