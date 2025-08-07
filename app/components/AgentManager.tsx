"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

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
    console.log('AgentManager: Fetching agents...');
    fetch("http://localhost:8000/agents")
      .then((res) => {
        console.log('AgentManager: API response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('AgentManager: API response data:', data);
        setAgents(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('AgentManager: Fetch error:', error);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");
    const res = await fetch("http://localhost:8000/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, display_name: name, description, rag_architecture: ragArch }),
    });
    if (res.ok) {
      alert("Agent created!");
      setName("");
      setDescription("");
      setRagArch(ragTypes[0].key);
      // Reload agents
      fetch("http://localhost:8000/agents")
        .then((res) => res.json())
        .then((data) => setAgents(data || []));
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
    // TODO: Implement DELETE endpoint in backend API
    alert('Delete functionality will be implemented in the backend API');
    // const res = await fetch(`http://localhost:8000/agents/${id}`, {
    //   method: 'DELETE',
    // });
    // if (res.ok) {
    //   setAgents(agents.filter(a => a.id !== id));
    // } else {
    //   alert('Failed to delete agent');
    // }
  };

  return (
    <div>
      <div className="card" style={{ margin: "var(--spacing-lg) 0", maxWidth: '480px' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Create New Agent</h3>
        <form onSubmit={handleCreate}>
          <input
            name="name"
            placeholder="Agent Name"
            className="form-input"
            style={{ marginBottom: 'var(--spacing-xs)' }}
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            name="description"
            placeholder="Description"
            className="form-input"
            style={{ marginBottom: 'var(--spacing-xs)', minHeight: '80px', resize: 'vertical' }}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div style={{ marginBottom: 'var(--spacing-xs)' }}>
            <label style={{ fontWeight: 'var(--font-weight-medium)', marginRight: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>RAG Architecture:</label>
            <select 
              value={ragArch} 
              onChange={e => setRagArch(e.target.value)} 
              className="form-input"
              style={{ display: 'inline-block', width: 'auto', minWidth: '200px' }}
            >
              {ragTypes.map(rt => (
                <option key={rt.key} value={rt.key}>{rt.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Create Agent
          </button>
        </form>
      </div>
      <div className="card" style={{ margin: "var(--spacing-lg) 0", maxWidth: '480px' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Agents List</h3>
        {(() => {
          console.log('AgentManager render: loading =', loading, 'agents =', agents, 'agents.length =', agents.length);
          return null;
        })()}
        {loading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading agents...</div>
        ) : !agents.length ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>No agents found.</div>
        ) : (
          <ul style={{ paddingLeft: 0 }}>
            {agents.map((a) => (
              <li key={a.id} style={{ 
                marginBottom: 'var(--spacing-xs)', 
                listStyle: 'none', 
                background: 'var(--color-background)', 
                borderRadius: 'var(--radius-md)', 
                padding: 'var(--spacing-sm)', 
                border: '1px solid var(--color-border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{a.name}</strong> 
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-xs)' }}>#{a.id}</span>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>{a.description}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-xs)' }}>RAG: {a.rag_architecture}</div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                  <Link 
                    href={`/chat/${a.id}`}
                    className="btn btn-success btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    Chat
                  </Link>
                  <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
