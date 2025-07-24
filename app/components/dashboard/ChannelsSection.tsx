
"use client";
import React, { useState, useEffect } from "react";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface ChannelsProps {
  selectedAgentId?: number | null;
}

const ChannelsSection: React.FC<ChannelsProps> = ({ selectedAgentId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(selectedAgentId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Channel settings
  const [integrationsEnabled, setIntegrationsEnabled] = useState(false);
  const [webhooksConfigured, setWebhooksConfigured] = useState(false);
  const [testingEnvironmentReady, setTestingEnvironmentReady] = useState(false);
  const [deploymentActive, setDeploymentActive] = useState(false);

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

  // Fetch agent-specific channel settings
  useEffect(() => {
    if (selectedAgent) {
      const fetchChannelSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              switch (setting.setting_key) {
                case 'channels_integrations_enabled':
                  setIntegrationsEnabled(setting.setting_value === 'true');
                  break;
                case 'channels_webhooks_configured':
                  setWebhooksConfigured(setting.setting_value === 'true');
                  break;
                case 'channels_testing_ready':
                  setTestingEnvironmentReady(setting.setting_value === 'true');
                  break;
                case 'channels_deployment_active':
                  setDeploymentActive(setting.setting_value === 'true');
                  break;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching channel settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchChannelSettings();
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
        { agent_id: selectedAgent, setting_key: 'channels_integrations_enabled', setting_value: String(integrationsEnabled) },
        { agent_id: selectedAgent, setting_key: 'channels_webhooks_configured', setting_value: String(webhooksConfigured) },
        { agent_id: selectedAgent, setting_key: 'channels_testing_ready', setting_value: String(testingEnvironmentReady) },
        { agent_id: selectedAgent, setting_key: 'channels_deployment_active', setting_value: String(deploymentActive) }
      ];

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Channel settings saved successfully!');
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
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Channels & Deployment</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="channels-agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="channels-agent-select"
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
              Loading channel settings...
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Integration Options</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Embed, WhatsApp, Slack, etc. (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${integrationsEnabled ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setIntegrationsEnabled(!integrationsEnabled)}
                    >
                      {integrationsEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Integration UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Webhooks</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Manage webhooks for events (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${webhooksConfigured ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setWebhooksConfigured(!webhooksConfigured)}
                    >
                      {webhooksConfigured ? 'Configured' : 'Configure'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Webhooks UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Testing Environment</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Test agent integrations (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${testingEnvironmentReady ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setTestingEnvironmentReady(!testingEnvironmentReady)}
                    >
                      {testingEnvironmentReady ? 'Ready' : 'Setup'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Testing UI coming soon.</div>
                </div>
                
                <div className="card">
                  <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Deployment Status</h3>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>View deployment status (UI stub)</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                    <button
                      type="button"
                      className={`btn ${deploymentActive ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => setDeploymentActive(!deploymentActive)}
                    >
                      {deploymentActive ? 'Active' : 'Deploy'}
                    </button>
                  </div>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Deployment status UI coming soon.</div>
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
                  {saving ? 'Saving...' : 'Save Channel Settings'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its channel settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Channel settings are specific to each agent and control how the agent is deployed and integrated.</p>
      </div>
    </section>
  );
};

export default ChannelsSection;
