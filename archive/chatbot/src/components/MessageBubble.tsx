import React from "react";

interface MessageBubbleProps {
  message: string;
  isUser?: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm whitespace-pre-line
          ${isUser ? "bg-blue-500 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md border"}`}
      >
        {message}
      </div>
    </div>
  );
}
