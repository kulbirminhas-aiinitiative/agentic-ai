import React from "react";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-md flex flex-col z-20">
      <div className="flex items-center h-16 px-6 border-b">
        <span className="font-bold text-xl tracking-tight">AI Chatbot</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-700">Chat</a>
        <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-700">History</a>
        <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-gray-700">Settings</a>
      </nav>
      <div className="px-6 py-4 border-t">
        <span className="text-xs text-gray-400">Inspired by Gemini UI</span>
      </div>
    </aside>
  );
}
