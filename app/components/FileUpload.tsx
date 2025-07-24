"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("No file selected");
    setLoading(true);
    setStatus("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`Uploaded and processing: ${data.filename}`);
      } else {
        setStatus(data.error || "Upload failed");
      }
    } catch (err) {
      setStatus("Error: " + String(err));
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "32px auto", padding: 24, background: "#f1f5f9", borderRadius: 10 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Upload Knowledge File</h3>
      <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input type="file" accept=".pdf,.docx,.txt,.csv,.json" onChange={handleFileChange} />
        <button type="submit" disabled={loading} style={{ background: "#38bdf8", color: "#fff", fontWeight: 600, border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {status && <div style={{ marginTop: 12, color: status.startsWith("Uploaded") ? "#22c55e" : "#ef4444" }}>{status}</div>}
    </div>
  );
}
