"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import TopBar from "../components/TopBar";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";

interface Message {
  text: string;
  isUser?: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (msg: string) => {
    setMessages(prev => [...prev, { text: msg, isUser: true }]);
    setLoading(true);
    // Placeholder: Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { text: "This is a placeholder AI response.", isUser: false },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <>
      <Sidebar />
      <ChatArea>
        <TopBar />
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-2">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m.text} isUser={m.isUser} />
          ))}
          {loading && (
            <MessageBubble message="Thinking..." />
          )}
        </div>
        <ChatInput onSend={handleSend} loading={loading} />
      </ChatArea>
    </>
  );
}
