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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)' }}>
      <Navigation />
      <main className="container flex flex-col items-center justify-center" style={{ flex: 1, padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          marginBottom: 'var(--spacing-lg)', 
          color: 'var(--color-text-primary)', 
          textAlign: 'center',
          letterSpacing: '-0.05em'
        }}>
          Welcome to Agentic AI
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--color-text-secondary)', 
          maxWidth: '600px', 
          textAlign: 'center', 
          marginBottom: 'var(--spacing-2xl)',
          lineHeight: 1.7
        }}>
          Build, manage, and deploy intelligent AI agents for your business. Get started by creating a new agent or exploring the platform features below.
        </p>
        <form onSubmit={handleSearch} className="card" style={{ 
          width: '100%', 
          maxWidth: '480px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          marginBottom: 'var(--spacing-xl)',
          padding: 'var(--spacing-xl)'
        }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search agents, knowledge, or anything..."
            style={{
              width: '100%',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border)',
              fontSize: '1rem',
              marginBottom: 'var(--spacing-lg)',
              outline: 'none',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-primary)',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button type="submit" className="btn btn-primary btn-lg" style={{ marginBottom: 'var(--spacing-md)' }}>
            Search Platform
          </button>
        </form>
        {result && (
          <div className="card" style={{ 
            marginTop: 'var(--spacing-md)', 
            fontSize: 'var(--font-size-lg)', 
            color: 'var(--color-text-primary)' 
          }}>
            {result}
          </div>
        )}
        <Link href="/agents" className="btn btn-primary btn-lg" style={{ marginTop: 'var(--spacing-xl)' }}>
          + Manage Agents
        </Link>
        <div style={{ 
          marginTop: 'var(--spacing-lg)', 
          color: 'var(--color-text-secondary)', 
          fontSize: 'var(--font-size-base)', 
          textAlign: 'center', 
          maxWidth: '600px' 
        }}>
          <p>Agentic AI empowers you to automate workflows, integrate with your favorite tools, and deliver smarter customer experiences. No coding required.</p>
        </div>
      </main>
      <footer style={{ 
        padding: 'var(--spacing-md) 0', 
        textAlign: 'center', 
        color: 'var(--color-text-secondary)', 
        fontSize: 'var(--font-size-sm)', 
        borderTop: '1px solid var(--color-border)' 
      }}>
        &copy; 2025 Agentic AI. All rights reserved.
      </footer>
    </div>
  );
}
