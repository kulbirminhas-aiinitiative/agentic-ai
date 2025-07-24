'use client';
import Navigation from './components/Navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(`You searched for: "${query}"`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 24, color: '#181e2a', textAlign: 'center' }}>
          Welcome to Agentic AI
        </h1>
        <p style={{ fontSize: 20, color: '#374151', maxWidth: 600, textAlign: 'center', marginBottom: 40 }}>
          Build, manage, and deploy intelligent AI agents for your business. Get started by creating a new agent or exploring the platform features below.
        </p>
        <form onSubmit={handleSearch} style={{ width: 480, maxWidth: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search agents, knowledge, or anything..."
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: 24,
              border: '1px solid #ddd',
              fontSize: 20,
              marginBottom: 24,
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 36px',
              borderRadius: 24,
              background: '#4285f4',
              color: '#fff',
              fontWeight: 600,
              fontSize: 18,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(60,64,67,.08)'
            }}
          >
            Search
          </button>
        </form>
        {result && (
          <div style={{ marginTop: 8, fontSize: 20, color: '#444', background: '#fafafa', borderRadius: 12, padding: '20px 40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            {result}
          </div>
        )}
        <Link href="/agents" style={{
          background: '#38bdf8',
          color: '#fff',
          padding: '1rem 2.5rem',
          borderRadius: 32,
          fontWeight: 700,
          fontSize: 20,
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(56,189,248,0.12)',
          marginTop: 40
        }}>
          + Manage Agents
        </Link>
        <div style={{ marginTop: 32, color: '#64748b', fontSize: 16, textAlign: 'center', maxWidth: 600 }}>
          <p>Agentic AI empowers you to automate workflows, integrate with your favorite tools, and deliver smarter customer experiences. No coding required.</p>
        </div>
      </main>
      <footer style={{ padding: '1rem 0', textAlign: 'center', color: '#888', fontSize: 15, borderTop: '1px solid #eee' }}>
        &copy; 2025 Agentic AI. All rights reserved.
      </footer>
    </div>
  );
}
