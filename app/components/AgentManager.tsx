"use client";
import { useEffect, useState } from "react";

// RAG architectures (sync with rag-architectures/page.tsx)
const ragTypes = [
  { key: "baseline", label: "Baseline RAG" },
  { key: "rerank", label: "Retrieve and Rerank RAG" },
  { key: "multihop", label: "Multi-hop RAG" },
  { key: "hyde", label: "HyDE" },
  { key: "graph", label: "Graph RAG" },
  { key: "hybrid", label: "Hybrid RAG" },
  { key: "branched", label: "Branched RAG" },
  { key: "sentencewindow", label: "Sentence Window Retrieval" },
  { key: "crag", label: "Corrective RAG (CRAG)" },
  { key: "selfrag", label: "Self-RAG" },
  { key: "metarag", label: "MetaRAG" },
  { key: "adaptive", label: "Adaptive RAG" },
  { key: "agentic", label: "Agentic RAG" },
  { key: "modular", label: "Modular RAG" },
  { key: "multimodal", label: "Multimodal RAG" },
  { key: "memo", label: "Memo RAG" },
  { key: "speculative", label: "Speculative RAG" },
];

interface AgentManagerProps {
  onSelect?: (agentId: string | null) => void;
}

export default function AgentManager({ onSelect }: AgentManagerProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ragArch, setRagArch] = useState(ragTypes[0].key);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, rag_architecture: ragArch }),
    });
    if (res.ok) {
      alert("Agent created!");
      setName("");
      setDescription("");
      setRagArch(ragTypes[0].key);
      // Reload agents
      fetch("/api/agents")
        .then((res) => res.json())
        .then((data) => setAgents(data.agents || []));
    } else {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "Invalid server response" };
      }
      alert(data.error || "Failed to create agent");
    }
  };
  // Delete agent handler
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    const res = await fetch('/api/agents', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) {
      setAgents(agents.filter(a => a.id !== id));
    } else {
      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: 'Invalid server response' };
      }
      alert(data.error || 'Failed to delete agent');
    }
  };

  return (
    <div>
      <div style={{ margin: "32px 0", padding: 24, background: "#f1f5f9", borderRadius: 10, maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Create New Agent</h3>
        <form onSubmit={handleCreate}>
          <input
            name="name"
            placeholder="Agent Name"
            style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            name="description"
            placeholder="Description"
            style={{ marginBottom: 8, width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontWeight: 500, marginRight: 8 }}>RAG Architecture:</label>
            <select value={ragArch} onChange={e => setRagArch(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
              {ragTypes.map(rt => (
                <option key={rt.key} value={rt.key}>{rt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ background: "#38bdf8", color: "#fff", fontWeight: 600, border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>
            Create Agent
          </button>
        </form>
      </div>
      <div style={{ margin: "32px 0", padding: 24, background: "#f8fafc", borderRadius: 10, maxWidth: 480 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Agents List</h3>
        {loading ? (
          <div>Loading agents...</div>
        ) : !agents.length ? (
          <div>No agents found.</div>
        ) : (
          <ul style={{ paddingLeft: 0 }}>
            {agents.map((a) => (
              <li key={a.id} style={{ marginBottom: 8, listStyle: 'none', background: '#fff', borderRadius: 6, padding: 10, border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>{a.name}</strong>
                  <div style={{ color: '#555', fontSize: 14 }}>{a.description}</div>
                </div>
                <button onClick={() => handleDelete(a.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 12px', fontWeight: 600, cursor: 'pointer', marginLeft: 12 }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
