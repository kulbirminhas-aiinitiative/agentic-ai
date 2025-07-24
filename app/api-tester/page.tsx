"use client";
import { useState } from "react";

const apiEndpoints = [
  {
    name: "Create Agent",
    method: "POST",
    url: "/api/agents",
    sampleBody: { name: "Test Agent", description: "A test agent." },
  },
  {
    name: "List Agents (not implemented)",
    method: "GET",
    url: "/api/agents",
    sampleBody: null,
  },
  {
    name: "Upload File",
    method: "POST",
    url: "/api/upload",
    sampleBody: null,
  },
];

export default function ApiTester() {
  const [selected, setSelected] = useState(0);
  const [body, setBody] = useState(JSON.stringify(apiEndpoints[0].sampleBody, null, 2));
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState("");
  const endpoint = apiEndpoints[selected];

  const handleSend = async () => {
    setResponse("Loading...");
    try {
      let res, data;
      if (endpoint.url === "/api/upload") {
        if (!file) return setResponse("No file selected");
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch(endpoint.url, { method: "POST", body: formData });
        data = await res.json();
      } else {
        res = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: endpoint.method === "POST" ? { "Content-Type": "application/json" } : {},
          body: endpoint.method === "POST" ? body : undefined,
        });
        data = await res.json();
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse(String(err));
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#f1f5f9", borderRadius: 10 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>API Tester</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Select Endpoint:</label>
        <select
          value={selected}
          onChange={e => {
            setSelected(Number(e.target.value));
            setBody(JSON.stringify(apiEndpoints[Number(e.target.value)].sampleBody, null, 2));
            setFile(null);
            setResponse("");
          }}
          style={{ marginLeft: 12, padding: 6, borderRadius: 4 }}
        >
          {apiEndpoints.map((ep, i) => (
            <option value={i} key={ep.url + ep.method}>{ep.method} {ep.url} - {ep.name}</option>
          ))}
        </select>
      </div>
      {endpoint.url === "/api/upload" ? (
        <div style={{ marginBottom: 16 }}>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
      ) : endpoint.method === "POST" ? (
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Request Body (JSON):</label>
          <textarea
            rows={6}
            style={{ width: "100%", marginTop: 6, fontFamily: "monospace" }}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
      ) : null}
      <button
        onClick={handleSend}
        style={{ background: "#38bdf8", color: "#fff", fontWeight: 600, border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", marginBottom: 16 }}
      >
        Send
      </button>
      <div>
        <label style={{ fontWeight: 600 }}>Response:</label>
        <pre style={{ background: "#fff", padding: 12, borderRadius: 6, minHeight: 80, marginTop: 6 }}>{response}</pre>
      </div>
    </div>
  );
}
