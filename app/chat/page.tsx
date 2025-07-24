"use client";
import { useState } from "react";
import ModernNavigation from "../components/ModernNavigation";
import './chat.css';

export default function Chat() {
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage = { user: "You", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setLogs(prev => [
      ...prev,
      `User input: ${input}`
    ]);

    try {
      const payload = {
        messages: [
          ...messages.map(m => ({ role: m.user === "You" ? "user" : "assistant", content: m.text })),
          { role: "user", content: input }
        ],
        model: "gpt-4o",
        temperature: 0.7,
        max_tokens: 512
      };
      setLogs(prev => [
        ...prev,
        `Sending to /api/chat: ${JSON.stringify(payload)}`
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(prev => [
          ...prev,
          `Received response: ${JSON.stringify(data)}`
        ]);
        if (data.choices && data.choices[0]) {
          setMessages(prev => [...prev, { user: "AI", text: data.choices[0].message.content }]);
        } else {
          setMessages(prev => [...prev, { user: "AI", text: "I received your message but couldn't generate a response." }]);
        }
      } else {
        setLogs(prev => [
          ...prev,
          `HTTP Error: ${response.status} ${response.statusText}`
        ]);
        setMessages(prev => [...prev, { user: "AI", text: "Sorry, I encountered an error." }]);
      }
    } catch (error: any) {
      setLogs(prev => [
        ...prev,
        `Error: ${error?.message || error}`
      ]);
      setMessages(prev => [...prev, { user: "AI", text: "Sorry, I couldn't connect to the server." }]);
    }

    setIsLoading(false);
  }

  return (
    <div className="chat-container">
      <ModernNavigation />
      
      <main className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-content">
            <h1 className="chat-title">
              <span className="chat-icon">◒</span>
              AI Chat Interface
            </h1>
            <p className="chat-subtitle">
              Intelligent conversations powered by your knowledge base
            </p>
          </div>
          
          <div className="chat-controls">
            <button 
              className={`control-btn ${showLogs ? 'active' : ''}`}
              onClick={() => setShowLogs(!showLogs)}
            >
              <span className="btn-icon">◓</span>
              Logs
            </button>
            <button 
              className="control-btn"
              onClick={() => {
                setMessages([]);
                setLogs([]);
              }}
            >
              <span className="btn-icon">◯</span>
              Clear
            </button>
          </div>
        </div>

        <div className="chat-layout">
          {/* Main Chat Area */}
          <div className="chat-area">
            {/* Messages Container */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <div className="empty-icon">◒</div>
                  <h3>Start a conversation</h3>
                  <p>Ask me anything! I can help you with information from your uploaded documents.</p>
                  <div className="sample-questions">
                    <div className="sample-title">Try asking:</div>
                    <button 
                      className="sample-btn"
                      onClick={() => setInput("What information do you have?")}
                    >
                      "What information do you have?"
                    </button>
                    <button 
                      className="sample-btn"
                      onClick={() => setInput("Summarize the key points")}
                    >
                      "Summarize the key points"
                    </button>
                  </div>
                </div>
              ) : (
                <div className="messages-list">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`message ${msg.user === "You" ? 'user-message' : 'ai-message'}`}
                    >
                      <div className="message-avatar">
                        {msg.user === "You" ? '◑' : '◒'}
                      </div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-author">{msg.user}</span>
                          <span className="message-time">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="message-text">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="message ai-message loading">
                      <div className="message-avatar">◒</div>
                      <div className="message-content">
                        <div className="message-header">
                          <span className="message-author">AI</span>
                        </div>
                        <div className="message-text">
                          <div className="typing-indicator">
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                            <span className="typing-dot"></span>
                          </div>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="input-area">
              <div className="input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type your message..."
                  className="chat-input"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="send-btn"
                >
                  <span className="send-icon">↗</span>
                </button>
              </div>
            </div>
          </div>

          {/* Logs Panel */}
          {showLogs && (
            <div className="logs-panel">
              <div className="logs-header">
                <h3>
                  <span className="logs-icon">◓</span>
                  Debug Logs
                </h3>
                <button 
                  className="close-logs"
                  onClick={() => setShowLogs(false)}
                >
                  ×
                </button>
              </div>
              <div className="logs-content">
                {logs.length === 0 ? (
                  <div className="no-logs">No logs yet</div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="log-entry">
                      <span className="log-time">
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span className="log-text">{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
