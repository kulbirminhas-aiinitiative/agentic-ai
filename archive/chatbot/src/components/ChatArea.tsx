import React from "react";

export default function ChatArea({ children }: { children: React.ReactNode }) {
  return (
    <main className="ml-64 flex flex-col h-screen bg-gray-50">
      {children}
    </main>
  );
}
