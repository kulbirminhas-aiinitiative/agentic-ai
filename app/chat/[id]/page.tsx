"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ModernNavigation from "../../components/ModernNavigation";
import Footer from "../../components/Footer";
import Link from "next/link";
import '../chat.css';

interface Message {
  role: string;
  content: string;
  timestamp?: Date;
}

interface Agent {
  id: string;
  display_name?: string;
  name: string;
  description: string;
  rag_architecture?: string;
}

interface AgentSettings {
  temperature: number;
  model: string;
  top_p: number;
  top_k: number;
  max_tokens: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop_sequences: string;
}

const defaultSettings: AgentSettings = {
  temperature: 0.7,
  model: "gpt-4o",
  top_p: 1,
  top_k: 40,
  max_tokens: 2048,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop_sequences: "",
};

export default function ChatV2AgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [error, setError] = useState("");
  const [sidebarSection, setSidebarSection] = useState<'agents' | 'info' | 'history' | 'settings'>('agents');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [agentChatHistory, setAgentChatHistory] = useState<{[key: string]: Message[]}>({});
  const [expandedInfoCard, setExpandedInfoCard] = useState<string | null>(null);
  const [selectedAgentForDetails, setSelectedAgentForDetails] = useState<Agent | null>(null);
  const [selectedSectionCard, setSelectedSectionCard] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents();
    loadChatHistory();
    loadAllAgentChatHistory();
  }, []);

  useEffect(() => {
    if (agentId && agents.length > 0) {
      loadAgentData();
    }
  }, [agentId, agents]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function fetchAgents() {
    setLoadingAgents(true);
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        const agentsArray = Array.isArray(data) ? data : data.agents || [];
        setAgents(agentsArray);
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      setError("Failed to load agents");
    } finally {
      setLoadingAgents(false);
    }
  }

  async function loadAgentData() {
    if (!agentId) return;
    
    try {
      // Find the current agent
      const currentAgent = agents.find(a => a.id.toString() === agentId);
      if (!currentAgent) {
        setError(`Agent not found with ID: ${agentId}`);
        return;
      }
      
      setSelectedAgent(currentAgent);
      
      // Load agent settings
      const settingsResponse = await fetch(`/api/agent-settings?id=${agentId}`);
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.settings) {
          const agentSettings = { ...defaultSettings };
          settingsData.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
            const key = setting.setting_key as keyof AgentSettings;
            if (key in agentSettings) {
              if (typeof agentSettings[key] === 'number') {
                (agentSettings as any)[key] = Number(setting.setting_value);
              } else {
                (agentSettings as any)[key] = setting.setting_value;
              }
            }
          });
          setSettings(agentSettings);
        }
      }
    } catch (err) {
      console.error("Error loading agent data:", err);
      setError(`Failed to load agent data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function loadChatHistory() {
    // Load chat history from localStorage if available
    const savedHistory = localStorage.getItem(`chat-history-${agentId}`);
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setMessages(history.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        })));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }

  function loadAllAgentChatHistory() {
    // Load chat history for all agents from localStorage
    const allHistory: {[key: string]: Message[]} = {};
    
    // Get all localStorage keys that match our chat history pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat-history-')) {
        const agentIdFromKey = key.replace('chat-history-', '');
        try {
          const history = JSON.parse(localStorage.getItem(key) || '[]');
          if (history.length > 0) {
            allHistory[agentIdFromKey] = history.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }));
          }
        } catch (error) {
          console.error(`Failed to load chat history for agent ${agentIdFromKey}:`, error);
        }
      }
    }
    
    setAgentChatHistory(allHistory);
  }

  function startNewChat() {
    setMessages([]);
    saveChatHistory([]);
  }

  // Filter agents based on search term
  const filteredAgents = agents.filter(agent => 
    (agent.display_name || agent.name).toLowerCase().includes(agentSearchTerm.toLowerCase()) ||
    agent.id.toString().includes(agentSearchTerm)
  );

  function handleAgentSelect(agent: Agent) {
    // Navigate to the specific agent chat page
    window.location.href = `/chat/${agent.id}`;
  }

  function handleAgentCardClick(agent: Agent, event: React.MouseEvent) {
    // Stop propagation to prevent dropdown from closing
    event.stopPropagation();
    // Set the selected agent for detailed view
    setSelectedAgentForDetails(agent);
    setShowAgentDropdown(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.agent-dropdown-container')) {
        setShowAgentDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function saveChatHistory(newMessages: Message[]) {
    try {
      localStorage.setItem(`chat-history-${agentId}`, JSON.stringify(newMessages));
      // Update the agent chat history state
      setAgentChatHistory(prev => ({
        ...prev,
        [agentId]: newMessages
      }));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !selectedAgent || loading) return;
    
    // Prevent focus from moving to send button
    const activeElement = document.activeElement as HTMLElement;
    
    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date()
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Restore focus to the textarea after state updates
    setTimeout(() => {
      const textarea = document.querySelector('.chat-input') as HTMLTextAreaElement;
      if (textarea && activeElement === textarea) {
        textarea.focus();
      }
    }, 0);

    try {
      const payload = {
        messages: newMessages.map(m => ({ 
          role: m.role, 
          content: m.content 
        })),
        // Use agent-specific settings
        temperature: settings.temperature,
        model: settings.model,
        top_p: settings.top_p,
        top_k: settings.top_k,
        max_tokens: settings.max_tokens,
        frequency_penalty: settings.frequency_penalty,
        presence_penalty: settings.presence_penalty,
        stop_sequences: settings.stop_sequences,
        agent_id: agentId,
        agent_name: selectedAgent.name
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Chat API error");
      const data = await res.json();
      
      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.response || "(no response)",
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } catch (err: any) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "[Error: Could not get response from backend]",
        timestamp: new Date()
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  }

  function selectAgent(agent: Agent) {
    router.push(`/chat/${agent.id}`);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  if (error) {
    return (
      <div className="chat-container">
        <ModernNavigation />
        <div style={{ padding: "var(--spacing-xl)", textAlign: "center" }}>
          <h1 style={{ color: "var(--color-error)", marginBottom: "var(--spacing-md)" }}>
            Error
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--spacing-lg)" }}>
            {error}
          </p>
          <Link href="/chat" style={{ 
            color: "var(--color-primary)", 
            textDecoration: "none",
            fontWeight: 600
          }}>
            ← Back to Chat
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ModernNavigation />
      
      <div className="chat-layout">
        {/* Sidebar */}
        <aside className={`chat-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle-btn"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '⮞' : '⮜'}
          </button>

          {/* Header */}
          <div className="chat-sidebar-header">
            <div className="chat-header-content">
              <h1 className="chat-title">
                {selectedAgent ? (selectedAgent.display_name || selectedAgent.name) : 'Loading...'}
              </h1>
            </div>
          </div>
            
          {/* Vertical Navigation */}
          <div className="sidebar-nav">
            {[
              { key: 'agents', label: 'Agents', icon: '◎' },
              { key: 'info', label: 'Info', icon: '◐' },
              { key: 'history', label: 'History', icon: '◒' },
              { key: 'settings', label: 'Settings', icon: '◓' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => {
                  if (selectedSectionCard === item.key) {
                    setSelectedSectionCard(null);
                    setSidebarSection(item.key as any);
                  } else {
                    setSelectedSectionCard(item.key);
                    setSidebarSection(item.key as any);
                  }
                }}
                className={`sidebar-nav-item ${sidebarSection === item.key ? 'active' : ''}`}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sidebar Content - Removed per user request */}
          <div className="sidebar-content">
            {/* Content sections removed - only expandable full-screen views remain */}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className={`chat-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {selectedSectionCard ? (
            /* Section Detail View - Full Screen Card */
            <div className="section-detail-view">
              <div className="section-detail-header-main">
                <button 
                  className="back-btn-main"
                  onClick={() => setSelectedSectionCard(null)}
                >
                  ← Back to Chat
                </button>
                <h2 className="section-detail-title-main">
                  {selectedSectionCard === 'agents' && 'Agent Management'}
                  {selectedSectionCard === 'info' && 'Agent Information'}
                  {selectedSectionCard === 'history' && 'Chat History'}
                  {selectedSectionCard === 'settings' && 'Agent Settings'}
                </h2>
              </div>

              <div className="section-detail-content-main">
                {selectedSectionCard === 'agents' && (
                  <div className="agent-management-view">
                    <div className="current-agent-section">
                      <h3>Current Agent</h3>
                      {selectedAgent && (
                        <div className="agent-card-main">
                          <div className="agent-card-header">
                            <h4>{selectedAgent.display_name || selectedAgent.name}</h4>
                            <span className="agent-id">#{selectedAgent.id}</span>
                          </div>
                          <p className="agent-description">{selectedAgent.description}</p>
                          <div className="agent-specs">
                            <div className="spec-item">
                              <strong>Status:</strong> <span className="status-active">● Active</span>
                            </div>
                            {selectedAgent.rag_architecture && (
                              <div className="spec-item">
                                <strong>Architecture:</strong> {selectedAgent.rag_architecture}
                              </div>
                            )}
                          </div>
                          <div className="agent-actions-main">
                            <button 
                              className="action-btn primary"
                              onClick={() => setSelectedSectionCard(null)}
                            >
                              <span className="action-icon">💬</span>
                              Continue Chat Session
                            </button>
                            <button 
                              className="action-btn secondary"
                              onClick={() => setSelectedSectionCard('info')}
                            >
                              <span className="action-icon">ℹ️</span>
                              View Details
                            </button>
                            <button 
                              className="action-btn secondary"
                              onClick={() => setSelectedSectionCard('settings')}
                            >
                              <span className="action-icon">⚙️</span>
                              Configure Settings
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="available-agents-section">
                      <h3>Switch to Another Agent</h3>
                      <div className="agents-grid">
                        {agents.filter(agent => agent.id !== selectedAgent?.id).map(agent => (
                          <div key={agent.id} className="agent-card-grid">
                            <div className="agent-card-header">
                              <h4>{agent.display_name || agent.name}</h4>
                              <span className="agent-id">#{agent.id}</span>
                            </div>
                            <p className="agent-description-short">
                              {agent.description?.length > 100 
                                ? `${agent.description.substring(0, 100)}...` 
                                : agent.description}
                            </p>
                            <div className="agent-actions-grid">
                              <button 
                                className="action-btn primary small"
                                onClick={() => handleAgentSelect(agent)}
                              >
                                Switch to This Agent
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedSectionCard === 'info' && selectedAgent && (
                  <div className="info-detail-view">
                    <div className="info-card-large">
                      <h3>Agent Details</h3>
                      <div className="info-grid">
                        <div className="info-section">
                          <h4>Basic Information</h4>
                          <div className="info-item">
                            <strong>Name:</strong> {selectedAgent.display_name || selectedAgent.name}
                          </div>
                          <div className="info-item">
                            <strong>Agent ID:</strong> #{selectedAgent.id}
                          </div>
                          <div className="info-item">
                            <strong>Description:</strong> {selectedAgent.description}
                          </div>
                          {selectedAgent.rag_architecture && (
                            <div className="info-item">
                              <strong>Architecture:</strong> {selectedAgent.rag_architecture}
                            </div>
                          )}
                          <div className="info-item">
                            <strong>Status:</strong> <span className="status-active">● Online & Ready</span>
                          </div>
                        </div>

                        <div className="info-section">
                          <h4>Model Configuration</h4>
                          <div className="info-item">
                            <strong>Model:</strong> {settings.model}
                          </div>
                          <div className="info-item">
                            <strong>Temperature:</strong> {settings.temperature}
                          </div>
                          <div className="info-item">
                            <strong>Max Tokens:</strong> {settings.max_tokens}
                          </div>
                          <div className="info-item">
                            <strong>Top P:</strong> {settings.top_p}
                          </div>
                          <div className="info-item">
                            <strong>Top K:</strong> {settings.top_k}
                          </div>
                        </div>

                        <div className="info-section">
                          <h4>Session Statistics</h4>
                          <div className="info-item">
                            <strong>Messages in Current Session:</strong> {messages.length}
                          </div>
                          <div className="info-item">
                            <strong>Session Status:</strong> {messages.length > 0 ? 'Active' : 'Not started'}
                          </div>
                          <div className="info-item">
                            <strong>Last Activity:</strong> {messages.length > 0 ? 'Just now' : 'None'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="info-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => setSelectedSectionCard(null)}
                        >
                          <span className="action-icon">💬</span>
                          Start Chat Session
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => setSelectedSectionCard('settings')}
                        >
                          <span className="action-icon">⚙️</span>
                          Configure Settings
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => setSelectedSectionCard('history')}
                        >
                          <span className="action-icon">📝</span>
                          View Chat History
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSectionCard === 'history' && (
                  <div className="history-detail-view">
                    <div className="history-overview">
                      <h3>Chat History - {selectedAgent?.display_name || selectedAgent?.name}</h3>
                      <div className="history-stats">
                        <div className="stat-card">
                          <div className="stat-number">{messages.length}</div>
                          <div className="stat-label">Messages in Current Session</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">{selectedAgent && agentChatHistory[selectedAgent.id] ? agentChatHistory[selectedAgent.id].length : 0}</div>
                          <div className="stat-label">Messages in Previous Sessions</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">{(selectedAgent && agentChatHistory[selectedAgent.id] ? agentChatHistory[selectedAgent.id].length : 0) + messages.length}</div>
                          <div className="stat-label">Total Messages with Agent</div>
                        </div>
                      </div>
                    </div>

                    <div className="history-sessions-main">
                      <h4>Session History for {selectedAgent?.display_name || selectedAgent?.name}</h4>
                      
                      {/* Current Session */}
                      <div className="session-card current">
                        <div className="session-header">
                          <h5>Current Session</h5>
                          <span className="session-status">Active Now</span>
                        </div>
                        <div className="session-details">
                          <p><strong>Messages:</strong> {messages.length}</p>
                          <p><strong>Status:</strong> {messages.length > 0 ? 'In Progress' : 'Ready to Start'}</p>
                          {messages.length > 0 && (
                            <p><strong>Latest:</strong> "{messages[messages.length - 1].content.substring(0, 100)}..."</p>
                          )}
                        </div>
                        <div className="session-actions">
                          <button 
                            className="action-btn primary small"
                            onClick={() => setSelectedSectionCard(null)}
                          >
                            Continue Session
                          </button>
                          {messages.length > 0 && (
                            <button 
                              className="action-btn secondary small"
                              onClick={() => {
                                setMessages([]);
                                saveChatHistory([]);
                              }}
                            >
                              Clear Session
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Previous Sessions for Selected Agent Only */}
                      {selectedAgent && agentChatHistory[selectedAgent.id] && agentChatHistory[selectedAgent.id].length > 0 ? (
                        <div className="session-card">
                          <div className="session-header">
                            <h5>Previous Session</h5>
                            <span className="session-date">
                              {agentChatHistory[selectedAgent.id][agentChatHistory[selectedAgent.id].length - 1]?.timestamp 
                                ? new Date(agentChatHistory[selectedAgent.id][agentChatHistory[selectedAgent.id].length - 1].timestamp!).toLocaleDateString()
                                : 'Recent'
                              }
                            </span>
                          </div>
                          <div className="session-details">
                            <p><strong>Messages:</strong> {agentChatHistory[selectedAgent.id].length}</p>
                            <p><strong>Latest:</strong> "{agentChatHistory[selectedAgent.id][agentChatHistory[selectedAgent.id].length - 1]?.content.substring(0, 100)}..."</p>
                          </div>
                          <div className="session-actions">
                            <button 
                              className="action-btn secondary small"
                              onClick={() => {
                                // Load previous session
                                setMessages(agentChatHistory[selectedAgent.id]);
                                setSelectedSectionCard(null);
                              }}
                            >
                              Load Previous Session
                            </button>
                            <button 
                              className="action-btn secondary small"
                              onClick={() => {
                                // Clear previous session history
                                const newHistory = { ...agentChatHistory };
                                delete newHistory[selectedAgent.id];
                                setAgentChatHistory(newHistory);
                                localStorage.removeItem(`chat-history-${selectedAgent.id}`);
                              }}
                            >
                              Clear History
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="session-card empty">
                          <div className="session-header">
                            <h5>No Previous Sessions</h5>
                          </div>
                          <div className="session-details">
                            <p>No previous chat history found for {selectedAgent?.display_name || selectedAgent?.name}.</p>
                            <p>Start chatting to create your first session!</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="history-actions">
                      <button 
                        className="action-btn primary"
                        onClick={() => setSelectedSectionCard(null)}
                      >
                        <span className="action-icon">💬</span>
                        Return to Chat
                      </button>
                      <button 
                        className="action-btn secondary"
                        disabled
                      >
                        <span className="action-icon">💾</span>
                        Export All History
                      </button>
                    </div>
                  </div>
                )}

                {selectedSectionCard === 'settings' && selectedAgent && (
                  <div className="settings-detail-view">
                    <div className="settings-card-large">
                      <h3>Agent Configuration</h3>
                      <div className="settings-grid">
                        <div className="settings-section">
                          <h4>Model Parameters</h4>
                          <div className="settings-group">
                            <div className="setting-display">
                              <label>Model</label>
                              <div className="setting-value">{settings.model}</div>
                            </div>
                            <div className="setting-display">
                              <label>Temperature</label>
                              <div className="setting-value">{settings.temperature}</div>
                            </div>
                            <div className="setting-display">
                              <label>Max Tokens</label>
                              <div className="setting-value">{settings.max_tokens}</div>
                            </div>
                          </div>
                        </div>

                        <div className="settings-section">
                          <h4>Advanced Parameters</h4>
                          <div className="settings-group">
                            <div className="setting-display">
                              <label>Top P</label>
                              <div className="setting-value">{settings.top_p}</div>
                            </div>
                            <div className="setting-display">
                              <label>Top K</label>
                              <div className="setting-value">{settings.top_k}</div>
                            </div>
                            <div className="setting-display">
                              <label>Frequency Penalty</label>
                              <div className="setting-value">{settings.frequency_penalty}</div>
                            </div>
                            <div className="setting-display">
                              <label>Presence Penalty</label>
                              <div className="setting-value">{settings.presence_penalty}</div>
                            </div>
                          </div>
                        </div>

                        <div className="settings-section">
                          <h4>Agent Information</h4>
                          <div className="settings-group">
                            <div className="setting-display">
                              <label>Agent Name</label>
                              <div className="setting-value">{selectedAgent.display_name || selectedAgent.name}</div>
                            </div>
                            <div className="setting-display">
                              <label>Agent ID</label>
                              <div className="setting-value">#{selectedAgent.id}</div>
                            </div>
                            {selectedAgent.rag_architecture && (
                              <div className="setting-display">
                                <label>Architecture</label>
                                <div className="setting-value">{selectedAgent.rag_architecture}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="settings-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => setSelectedSectionCard(null)}
                        >
                          <span className="action-icon">💬</span>
                          Return to Chat
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => setSelectedSectionCard('info')}
                        >
                          <span className="action-icon">ℹ️</span>
                          View Agent Info
                        </button>
                        <button 
                          className="action-btn secondary"
                          disabled
                        >
                          <span className="action-icon">📁</span>
                          Manage Files
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="chat-messages">
            {!selectedAgent ? (
              <div className="welcome-panel">
                <div className="welcome-icon">🤖</div>
                <p className="welcome-title">
                  Loading Agent...
                </p>
                <p className="welcome-text">
                  Please wait while we load the agent information.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="start-conversation-panel">
                <div className="start-conversation-icon">💬</div>
                <p className="start-conversation-title">
                  Start a conversation
                </p>
                <p className="start-conversation-text">
                  Type a message below to begin chatting with <strong>{selectedAgent.display_name || selectedAgent.name}</strong>
                  <br />
                  Using {settings.model} with temperature {settings.temperature}
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message-row ${msg.role}`}
                >
                  {msg.role === "assistant" && (
                    <div className="message-avatar bot">
                      🤖
                    </div>
                  )}
                  <div className={`message-bubble ${msg.role}`}>
                    {msg.content}
                    <div className={`message-time ${msg.role}`}>
                      {msg.timestamp ? msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : new Date().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="message-avatar user">
                      👤
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="message-row">
                <div className="message-avatar bot">
                  🤖
                </div>
                <div className="message-bubble bot">
                  <div className="loading-pulse" style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-primary)",
                    display: "inline-block",
                    marginRight: "var(--spacing-sm)"
                  }}></div>
                  Thinking...
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {selectedAgent && (
            <div className="chat-input-area">
              <form onSubmit={handleSend} className="chat-input-form">
                <div className="chat-input-wrapper">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedAgent.display_name || selectedAgent.name}...`}
                    disabled={loading}
                    className="chat-input"
                    rows={1}
                    style={{
                      resize: "none",
                      minHeight: "20px",
                      maxHeight: "100px",
                      overflow: "hidden"
                    }}
                  />
                </div>
                                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="send-btn"
                  tabIndex={-1}
                >
                  {loading ? "..." : "Send"} 
                  {!loading && <span>🚀</span>}
                </button>
              </form>
              <div className="chat-input-hint">
                Press Enter to send • Shift+Enter for new line • {selectedAgent.display_name || selectedAgent.name} using {settings.model}
              </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
