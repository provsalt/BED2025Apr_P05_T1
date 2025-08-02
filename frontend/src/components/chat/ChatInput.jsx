"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

export const ChatInput = (props) => {
  const [messageInput, setMessageInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    props.onSend(messageInput);
    console.log("Message sent:", messageInput);
    setMessageInput("");
  };

  return (
    <div className="p-6 border-t bg-background">
      <form onSubmit={sendMessage} className="flex">
        <Input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full pl-4 pr-12 py-3 rounded-lg border"
        />
        <Button type="submit">
          <SendHorizontal className="hover:text-muted-foreground w-6 h-6 text-primary-foreground" />
        </Button>
      </form>
    </div>
  );
};