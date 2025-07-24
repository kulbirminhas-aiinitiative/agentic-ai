
"use client";
import React, { useState, useEffect } from "react";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface AnalyticsProps {
  selectedAgentId?: number | null;
}

const AnalyticsSection: React.FC<AnalyticsProps> = ({ selectedAgentId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(selectedAgentId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Analytics settings
  const [conversationLogsEnabled, setConversationLogsEnabled] = useState(false);
  const [performanceMetricsEnabled, setPerformanceMetricsEnabled] = useState(false);
  const [userFeedbackEnabled, setUserFeedbackEnabled] = useState(false);
  const [errorReportingEnabled, setErrorReportingEnabled] = useState(false);
  const [costTrackingEnabled, setCostTrackingEnabled] = useState(false);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        if (data.agents) {
          setAgents(data.agents);
          if (!selectedAgent && data.agents.length > 0) {
            setSelectedAgent(data.agents[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);

  // Update selectedAgent when prop changes
  useEffect(() => {
    if (selectedAgentId !== undefined) {
      setSelectedAgent(selectedAgentId);
    }
  }, [selectedAgentId]);

  // Fetch agent-specific analytics settings
  useEffect(() => {
    if (selectedAgent) {
      const fetchAnalyticsSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              switch (setting.setting_key) {
                case 'analytics_conversation_logs':
                  setConversationLogsEnabled(setting.setting_value === 'true');
                  break;
                case 'analytics_performance_metrics':
                  setPerformanceMetricsEnabled(setting.setting_value === 'true');
                  break;
                case 'analytics_user_feedback':
                  setUserFeedbackEnabled(setting.setting_value === 'true');
                  break;
                case 'analytics_error_reporting':
                  setErrorReportingEnabled(setting.setting_value === 'true');
                  break;
                case 'analytics_cost_tracking':
                  setCostTrackingEnabled(setting.setting_value === 'true');
                  break;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching analytics settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAnalyticsSettings();
    }
  }, [selectedAgent]);

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = Number(e.target.value);
    setSelectedAgent(agentId);
  };

  const saveSettings = async () => {
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }

    setSaving(true);
    try {
      const settingsToSave = [
        { agent_id: selectedAgent, setting_key: 'analytics_conversation_logs', setting_value: String(conversationLogsEnabled) },
        { agent_id: selectedAgent, setting_key: 'analytics_performance_metrics', setting_value: String(performanceMetricsEnabled) },
        { agent_id: selectedAgent, setting_key: 'analytics_user_feedback', setting_value: String(userFeedbackEnabled) },
        { agent_id: selectedAgent, setting_key: 'analytics_error_reporting', setting_value: String(errorReportingEnabled) },
        { agent_id: selectedAgent, setting_key: 'analytics_cost_tracking', setting_value: String(costTrackingEnabled) }
      ];

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Analytics settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error saving settings: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={{ padding: 0 }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Analytics & Monitoring</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="analytics-agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="analytics-agent-select"
          value={selectedAgent || ''}
          onChange={handleAgentChange}
          className="form-input"
        >
          <option value="">Choose an agent...</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.display_name || agent.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAgent ? (
        <div>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading analytics settings...
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Conversation Logs</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>View and search conversation logs (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${conversationLogsEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setConversationLogsEnabled(!conversationLogsEnabled)}
                    >
                      {conversationLogsEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Conversation logs UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Performance Metrics</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Monitor agent performance (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${performanceMetricsEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setPerformanceMetricsEnabled(!performanceMetricsEnabled)}
                    >
                      {performanceMetricsEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Performance metrics UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>User Feedback</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Collect and review user feedback (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${userFeedbackEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setUserFeedbackEnabled(!userFeedbackEnabled)}
                    >
                      {userFeedbackEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>User feedback UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Error Reporting</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Track and resolve errors (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${errorReportingEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setErrorReportingEnabled(!errorReportingEnabled)}
                    >
                      {errorReportingEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Error reporting UI coming soon.</div>
                </div>
                
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Cost Tracking</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Monitor usage and costs (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${costTrackingEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setCostTrackingEnabled(!costTrackingEnabled)}
                    >
                      {costTrackingEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Cost tracking UI coming soon.</div>
                </div>
              </div>

              {/* Save Button */}
              <div className="card" style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save Analytics Settings'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its analytics settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Analytics settings are specific to each agent and control monitoring and data collection for that agent.</p>
      </div>
    </section>
  );
};

export default AnalyticsSection;
