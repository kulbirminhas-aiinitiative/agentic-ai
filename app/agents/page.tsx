"use client";
import React, { useState, useEffect } from 'react';
import ModernNavigation from '../components/ModernNavigation';
import './agents-page.css';

interface Agent {
  id: number;
  name: string;
  rag_architecture: string;
}

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getArchitectureIcon = (architecture: string) => {
    const icons = {
      'baseline': '◯',
      'rerank': '◎',
      'llamaindex-pinecone': '◐',
      'enhanced': '◑',
      'advanced': '◒'
    };
    return icons[architecture as keyof typeof icons] || '◓';
  };

  const getArchitectureDescription = (architecture: string) => {
    const descriptions = {
      'baseline': 'Basic RAG implementation with vector search',
      'rerank': 'Enhanced with re-ranking for better relevance',
      'llamaindex-pinecone': 'LlamaIndex with Pinecone vector database',
      'enhanced': 'Advanced RAG with multiple retrieval strategies',
      'advanced': 'State-of-the-art with hybrid search capabilities'
    };
    return descriptions[architecture as keyof typeof descriptions] || 'Custom architecture';
  };

  return (
    <div className="agents-container">
      <ModernNavigation />
      
      <main className="agents-main">
        {/* Header Section */}
        <div className="agents-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">◎</span>
              My Agents
            </h1>
            <p className="page-subtitle">
              Manage and monitor your intelligent AI agents
            </p>
          </div>
          
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon">◯</div>
              <div className="stat-content">
                <div className="stat-number">{agents.length}</div>
                <div className="stat-label">Total Agents</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">◐</div>
              <div className="stat-content">
                <div className="stat-number">{agents.filter(a => a.rag_architecture).length}</div>
                <div className="stat-label">Active RAG</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">◑</div>
              <div className="stat-content">
                <div className="stat-number">3</div>
                <div className="stat-label">Architectures</div>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="agents-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">◯◎◐◑◒◓</div>
              <p>Loading your agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◯</div>
              <h3>No agents yet</h3>
              <p>Create your first AI agent to get started</p>
              <a href="/create-agent" className="create-btn">
                <span className="btn-icon">◑</span>
                Create Agent
              </a>
            </div>
          ) : (
            agents.map((agent) => (
              <div 
                key={agent.id} 
                className={`agent-card ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="agent-header">
                  <div className="agent-icon">
                    {getArchitectureIcon(agent.rag_architecture)}
                  </div>
                  <div className="agent-info">
                    <h3 className="agent-name">{agent.name}</h3>
                    <div className="agent-id">Agent #{agent.id}</div>
                  </div>
                </div>
                
                <div className="agent-architecture">
                  <div className="arch-label">Architecture</div>
                  <div className="arch-name">{agent.rag_architecture}</div>
                  <div className="arch-description">
                    {getArchitectureDescription(agent.rag_architecture)}
                  </div>
                </div>

                <div className="agent-actions">
                  <button className="action-btn primary">
                    <span className="btn-icon">◒</span>
                    Chat
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">◐</span>
                    Configure
                  </button>
                  <button className="action-btn">
                    <span className="btn-icon">◓</span>
                    Files
                  </button>
                </div>

                <div className="agent-status">
                  <div className="status-indicator active"></div>
                  <span>Active</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Agent Details Panel */}
        {selectedAgent && (
          <div className="agent-details-panel">
            <div className="panel-header">
              <h2>
                <span className="detail-icon">{getArchitectureIcon(selectedAgent.rag_architecture)}</span>
                {selectedAgent.name}
              </h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedAgent(null)}
              >
                ×
              </button>
            </div>
            
            <div className="panel-content">
              <div className="detail-section">
                <h3>Agent Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Agent ID</label>
                    <value>#{selectedAgent.id}</value>
                  </div>
                  <div className="detail-item">
                    <label>Architecture</label>
                    <value>{selectedAgent.rag_architecture}</value>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <value className="status-active">Active</value>
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <button className="detail-btn primary">
                  <span className="btn-icon">◒</span>
                  Start Chat Session
                </button>
                <button className="detail-btn">
                  <span className="btn-icon">◐</span>
                  Configure Settings
                </button>
                <button className="detail-btn">
                  <span className="btn-icon">◓</span>
                  Manage Files
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentsPage;
