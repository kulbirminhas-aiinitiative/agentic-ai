"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatbotPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    async function fetchAgent() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/agents?id=${id}`);
        if (!res.ok) throw new Error("Agent not found");
        const data = await res.json();
        setAgent(data.agents ? data.agents[0] : null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAgent();
  }, [id]);


  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agent.id, query: input, history: newHistory }),
      });
      if (!res.ok) throw new Error("Chat API error");
      const data = await res.json();
      setMessages(msgs => [...msgs, { role: "assistant", content: data.response || "(no response)" }]);
    } catch (err: any) {
      setMessages(msgs => [...msgs, { role: "assistant", content: "[Error: Could not get response from backend]" }]);
    }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  if (!agent) return <div style={{ padding: 40 }}>Agent not found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{agent.display_name || agent.name}</h1>
      <div style={{ color: "#64748b", marginBottom: 24 }}>{agent.description}</div>
      <div style={{ minHeight: 200, marginBottom: 24 }}>
        {messages.length === 0 && <div style={{ color: "#888" }}>Start the conversation...</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 12, textAlign: msg.role === "user" ? "right" : "left" }}>
            <span style={{
              display: "inline-block",
              background: msg.role === "user" ? "#38bdf8" : "#f1f5f9",
              color: msg.role === "user" ? "#fff" : "#222",
              borderRadius: 8,
              padding: "8px 16px",
              maxWidth: "80%"
            }}>{msg.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: 8, border: "1.5px solid #cbd5e1", fontSize: 16 }}
        />
        <button type="submit" style={{ background: "#38bdf8", color: "#fff", border: "none", borderRadius: 8, padding: "0 24px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          Send
        </button>
      </form>
    </div>
  );
}
