"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToFirstAgent = async () => {
      try {
        // Fetch agents from the backend
        const response = await fetch('http://localhost:8000/agents');
        
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        
        const agents = await response.json();
        
        if (agents && agents.length > 0) {
          // Redirect to the first agent's chat
          const firstAgentId = agents[0].id;
          router.push(`/chat/${firstAgentId}`);
        } else {
          // No agents available, redirect to create agent page
          router.push('/create-agent');
        }
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Unable to load agents. Redirecting to agents page...');
        // Fallback to agents page after a delay
        setTimeout(() => {
          router.push('/agents');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    redirectToFirstAgent();
  }, [router]);

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ color: '#d32f2f' }}>{error}</div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Please check if the backend is running on port 8000
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>
        {loading ? 'Loading agents...' : 'Redirecting to chat...'}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#666' }}>
        Finding the first available agent for you
      </div>
      {loading && (
        <div style={{ 
          width: '20px', 
          height: '20px', 
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
