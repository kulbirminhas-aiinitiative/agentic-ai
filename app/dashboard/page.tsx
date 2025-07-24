"use client";
import React, { useState, useEffect } from 'react';
import ModernNavigation from '../components/ModernNavigation';
import './dashboard.css';

interface DashboardStats {
  totalAgents: number;
  activeChats: number;
  totalFiles: number;
  systemHealth: string;
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'upload' | 'create' | 'config';
  message: string;
  timestamp: string;
  agentName?: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    activeChats: 0,
    totalFiles: 0,
    systemHealth: 'Good'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch agents data
      const agentsResponse = await fetch('/api/agents');
      const agentsData = await agentsResponse.json();
      
      setStats({
        totalAgents: agentsData.agentCount || 0,
        activeChats: Math.floor(Math.random() * 10) + 1, // Mock data
        totalFiles: Math.floor(Math.random() * 50) + 10, // Mock data
        systemHealth: 'Excellent'
      });

      // Mock recent activity
      setRecentActivity([
        { id: '1', type: 'chat', message: 'Started chat with test2', timestamp: '2 minutes ago', agentName: 'test2' },
        { id: '2', type: 'upload', message: 'Uploaded requirements_enhanced_rag.txt', timestamp: '5 minutes ago', agentName: 'test4' },
        { id: '3', type: 'create', message: 'Created new agent test4', timestamp: '1 hour ago' },
        { id: '4', type: 'config', message: 'Updated RAG architecture for test', timestamp: '2 hours ago', agentName: 'test' },
        { id: '5', type: 'chat', message: 'Completed chat session', timestamp: '3 hours ago', agentName: 'test2' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      chat: '◒',
      upload: '◓',
      create: '◑',
      config: '◐'
    };
    return icons[type as keyof typeof icons] || '◯';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      chat: '#10b981',
      upload: '#667eea',
      create: '#f59e0b',
      config: '#ef4444'
    };
    return colors[type as keyof typeof colors] || '#666';
  };

  return (
    <div className="dashboard-container">
      <ModernNavigation />
      
      <main className="dashboard-main">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">
              <span className="title-icon">◐</span>
              Dashboard
            </h1>
            <p className="page-subtitle">
              Overview of your AI agent ecosystem
            </p>
          </div>
          
          <div className="time-info">
            <div className="current-time">
              {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </div>
            <div className="status-badge excellent">
              <span className="status-dot"></span>
              System Status: {stats.systemHealth}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">◎</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAgents}</div>
              <div className="stat-label">Total Agents</div>
              <div className="stat-trend">↗ Active</div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">◒</div>
            <div className="stat-content">
              <div className="stat-number">{stats.activeChats}</div>
              <div className="stat-label">Active Chats</div>
              <div className="stat-trend">↗ +12% this week</div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">◓</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalFiles}</div>
              <div className="stat-label">Knowledge Files</div>
              <div className="stat-trend">↗ +8 new files</div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">◑</div>
            <div className="stat-content">
              <div className="stat-number">98.2%</div>
              <div className="stat-label">Uptime</div>
              <div className="stat-trend">↗ Last 30 days</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-grid">
          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2>
                <span className="card-icon">◔</span>
                Recent Activity
              </h2>
              <button className="refresh-btn">↻</button>
            </div>
            
            <div className="activity-list">
              {loading ? (
                <div className="loading-activity">
                  <div className="loading-spinner">◯◎◐◑◒◓</div>
                  <p>Loading activity...</p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div 
                      className="activity-icon"
                      style={{ color: getActivityColor(activity.type) }}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <div className="activity-message">{activity.message}</div>
                      {activity.agentName && (
                        <div className="activity-agent">Agent: {activity.agentName}</div>
                      )}
                      <div className="activity-time">{activity.timestamp}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="dashboard-card health-card">
            <div className="card-header">
              <h2>
                <span className="card-icon">◕</span>
                System Health
              </h2>
            </div>
            
            <div className="health-metrics">
              <div className="health-item">
                <div className="health-label">RAG Backend</div>
                <div className="health-status good">
                  <div className="health-indicator"></div>
                  Operational
                </div>
              </div>
              
              <div className="health-item">
                <div className="health-label">Database</div>
                <div className="health-status good">
                  <div className="health-indicator"></div>
                  Connected
                </div>
              </div>
              
              <div className="health-item">
                <div className="health-label">File Storage</div>
                <div className="health-status good">
                  <div className="health-indicator"></div>
                  Available
                </div>
              </div>
              
              <div className="health-item">
                <div className="health-label">API Response</div>
                <div className="health-status good">
                  <div className="health-indicator"></div>
                  Fast (&lt;100ms)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card actions-card">
            <div className="card-header">
              <h2>
                <span className="card-icon">⚡</span>
                Quick Actions
              </h2>
            </div>
            
            <div className="quick-actions">
              <a href="/create-agent" className="action-item primary">
                <div className="action-icon">◑</div>
                <div className="action-content">
                  <div className="action-title">Create Agent</div>
                  <div className="action-desc">Build a new AI agent</div>
                </div>
              </a>
              
              <a href="/agents" className="action-item">
                <div className="action-icon">◎</div>
                <div className="action-content">
                  <div className="action-title">Manage Agents</div>
                  <div className="action-desc">View and configure</div>
                </div>
              </a>
              
              <a href="/chat" className="action-item">
                <div className="action-icon">◒</div>
                <div className="action-content">
                  <div className="action-title">Start Chat</div>
                  <div className="action-desc">Talk to your agents</div>
                </div>
              </a>
              
              <a href="/about" className="action-item">
                <div className="action-icon">◓</div>
                <div className="action-content">
                  <div className="action-title">Documentation</div>
                  <div className="action-desc">Learn more</div>
                </div>
              </a>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="dashboard-card architecture-card">
            <div className="card-header">
              <h2>
                <span className="card-icon">◈</span>
                RAG Architectures
              </h2>
            </div>
            
            <div className="architecture-list">
              <div className="arch-item">
                <div className="arch-icon">◯</div>
                <div className="arch-info">
                  <div className="arch-name">Baseline</div>
                  <div className="arch-count">1 agent</div>
                </div>
              </div>
              
              <div className="arch-item">
                <div className="arch-icon">◎</div>
                <div className="arch-info">
                  <div className="arch-name">Rerank</div>
                  <div className="arch-count">1 agent</div>
                </div>
              </div>
              
              <div className="arch-item">
                <div className="arch-icon">◐</div>
                <div className="arch-info">
                  <div className="arch-name">LlamaIndex + Pinecone</div>
                  <div className="arch-count">1 agent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
