
"use client";
import React, { useRef, useState } from "react";

const allowedTypes = [".pdf", ".docx", ".txt", ".csv", ".json"];

const KnowledgeBaseSection: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [webScrapingEnabled, setWebScrapingEnabled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(fileList)]);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <section style={{ padding: 0 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Knowledge Base / Data Sources</h2>
      <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Upload Files */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
            <label style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>Upload Files</label>
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(",")}
              multiple
              onChange={handleFileChange}
              style={{ flex: 1 }}
            />
          </div>
          <ul style={{ marginTop: 8 }}>
            {files.map((file, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', padding: '4px 0' }}>
                <span>{file.name}</span>
                <button
                  style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', marginLeft: 8 }}
                  onClick={() => handleRemoveFile(idx)}
                >Remove</button>
              </li>
            ))}
          </ul>
        </div>
        {/* Connect Database */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>Connect Database</label>
          <button
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: dbConnected ? '#22c55e' : '#e5e7eb', color: dbConnected ? '#fff' : '#374151', border: 'none', fontWeight: 600, fontSize: 16 }}
            onClick={() => setDbConnected((v) => !v)}
          >
            {dbConnected ? 'Connected' : 'Connect'}
          </button>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>(UI stub)</span>
        </div>
        {/* Integrate API */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>Integrate API</label>
          <button
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: apiConnected ? '#22c55e' : '#e5e7eb', color: apiConnected ? '#fff' : '#374151', border: 'none', fontWeight: 600, fontSize: 16 }}
            onClick={() => setApiConnected((v) => !v)}
          >
            {apiConnected ? 'Connected' : 'Connect'}
          </button>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>(UI stub)</span>
        </div>
        {/* Web Scraping / Crawler */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>Web Scraping / Crawler</label>
          <button
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, background: webScrapingEnabled ? '#22c55e' : '#e5e7eb', color: webScrapingEnabled ? '#fff' : '#374151', border: 'none', fontWeight: 600, fontSize: 16 }}
            onClick={() => setWebScrapingEnabled((v) => !v)}
          >
            {webScrapingEnabled ? 'Enabled' : 'Enable'}
          </button>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 8 }}>(UI stub)</span>
        </div>
        {/* Data Preprocessing / Chunking Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <label style={{ flex: '0 0 180px', fontWeight: 600, fontSize: 16 }}>Data Preprocessing / Chunking</label>
          <span style={{ flex: 1, color: '#64748b', fontSize: 15 }}>Settings for chunk size, overlap, etc. (UI stub)</span>
        </div>
      </div>
    </section>
  );
};

export default KnowledgeBaseSection;
