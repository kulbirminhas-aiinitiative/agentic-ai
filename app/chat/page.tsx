"use client";
import { useState } from "react";
import Navigation from "../components/Navigation";

export default function Chat() {
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);


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
        setMessages(prev => [...prev, { user: "AI", text: data.response }]);
      } else {
        setLogs(prev => [
          ...prev,
          `Error: Received HTTP ${response.status}`
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
        {/* Chat Interface */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ 
            background: "#fff", 
            borderBottom: "1px solid #e5e7eb", 
            padding: "1rem 2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#181e2a", margin: 0 }}>
              🤖 Chat with AI Agent
            </h1>
            <p style={{ color: "#64748b", margin: "0.5rem 0 0", fontSize: "0.875rem" }}>
              Ask questions and get intelligent responses powered by your knowledge base
            </p>
          </div>
          {/* Logging Section */}
          <div style={{ background: "#f1f5f9", borderBottom: "1px solid #e5e7eb", padding: "0.5rem 2rem", fontSize: "0.9rem", color: "#334155", maxHeight: 120, overflowY: "auto" }}>
            <strong>Logs:</strong>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {logs.slice(-8).map((log, idx) => (
                <li key={idx} style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{log}</li>
              ))}
            </ul>
          </div>
          {/* Messages */}
          <div style={{ 
            flex: 1, 
            padding: "2rem", 
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            {messages.length === 0 && (
              <div style={{ 
                textAlign: "center", 
                color: "#64748b", 
                marginTop: "2rem",
                background: "#fff",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Start a conversation</h3>
                <p>Ask me anything! I can help you with information from your uploaded documents.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                justifyContent: msg.user === "You" ? "flex-end" : "flex-start",
                marginBottom: "1rem"
              }}>
                <div style={{
                  maxWidth: "70%",
                  padding: "1rem 1.5rem",
                  borderRadius: "18px",
                  background: msg.user === "You" ? "#38bdf8" : "#fff",
                  color: msg.user === "You" ? "#fff" : "#374151",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  lineHeight: 1.5
                }}>
                  <div style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 600, 
                    marginBottom: "0.25rem",
                    opacity: 0.8
                  }}>
                    {msg.user}
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "18px",
                  background: "#fff",
                  color: "#64748b",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontStyle: "italic"
                }}>
                  AI is thinking...
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div style={{ 
            background: "#fff", 
            borderTop: "1px solid #e5e7eb", 
            padding: "1.5rem 2rem",
            boxShadow: "0 -2px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: "1rem 1.5rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "25px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  background: "#f8fafc"
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                style={{
                  padding: "1rem 2rem",
                  background: input.trim() && !isLoading ? "#38bdf8" : "#94a3b8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "25px",
                  cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                  fontWeight: 600,
                  fontSize: "1rem",
                  transition: "background-color 0.2s"
                }}
              >
                {isLoading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
