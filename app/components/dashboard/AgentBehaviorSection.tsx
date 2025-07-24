
"use client";
import React, { useState, useEffect } from "react";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface AgentBehaviorProps {
  selectedAgentId?: number | null;
}

const AgentBehaviorSection: React.FC<AgentBehaviorProps> = ({ selectedAgentId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(selectedAgentId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Behavior settings
  const [intentManagementEnabled, setIntentManagementEnabled] = useState(false);
  const [responsesConfigured, setResponsesConfigured] = useState(false);
  const [actionsEnabled, setActionsEnabled] = useState(false);
  const [contextManagementEnabled, setContextManagementEnabled] = useState(false);

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

  // Fetch agent-specific behavior settings
  useEffect(() => {
    if (selectedAgent) {
      const fetchBehaviorSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              switch (setting.setting_key) {
                case 'behavior_intent_management':
                  setIntentManagementEnabled(setting.setting_value === 'true');
                  break;
                case 'behavior_responses_configured':
                  setResponsesConfigured(setting.setting_value === 'true');
                  break;
                case 'behavior_actions_enabled':
                  setActionsEnabled(setting.setting_value === 'true');
                  break;
                case 'behavior_context_management':
                  setContextManagementEnabled(setting.setting_value === 'true');
                  break;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching behavior settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBehaviorSettings();
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
        { agent_id: selectedAgent, setting_key: 'behavior_intent_management', setting_value: String(intentManagementEnabled) },
        { agent_id: selectedAgent, setting_key: 'behavior_responses_configured', setting_value: String(responsesConfigured) },
        { agent_id: selectedAgent, setting_key: 'behavior_actions_enabled', setting_value: String(actionsEnabled) },
        { agent_id: selectedAgent, setting_key: 'behavior_context_management', setting_value: String(contextManagementEnabled) }
      ];

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Agent behavior settings saved successfully!');
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
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Agent Behavior / Flows</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="behavior-agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="behavior-agent-select"
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
        <form className="card" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading agent behavior settings...
            </div>
          ) : (
            <>
              {/* Intent Management */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <label style={{ flex: '0 0 220px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Intent Management</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${intentManagementEnabled ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setIntentManagementEnabled(!intentManagementEnabled)}
                  >
                    {intentManagementEnabled ? 'Enabled' : 'Enable'}
                  </button>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Define and manage agent intents (UI stub)</span>
                </div>
              </div>
              
              {/* Responses / Outputs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <label style={{ flex: '0 0 220px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Responses / Outputs</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${responsesConfigured ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setResponsesConfigured(!responsesConfigured)}
                  >
                    {responsesConfigured ? 'Configured' : 'Configure'}
                  </button>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Configure agent responses and output templates (UI stub)</span>
                </div>
              </div>
              
              {/* Actions / Tools */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <label style={{ flex: '0 0 220px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Actions / Tools</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${actionsEnabled ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setActionsEnabled(!actionsEnabled)}
                  >
                    {actionsEnabled ? 'Enabled' : 'Enable'}
                  </button>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Manage agent actions and tool integrations (UI stub)</span>
                </div>
              </div>
              
              {/* Context Management / Memory */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <label style={{ flex: '0 0 220px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Context Management / Memory</label>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${contextManagementEnabled ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setContextManagementEnabled(!contextManagementEnabled)}
                  >
                    {contextManagementEnabled ? 'Enabled' : 'Enable'}
                  </button>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Configure agent memory and context settings (UI stub)</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                {saving ? 'Saving...' : 'Save Behavior Settings'}
              </button>
            </>
          )}
        </form>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its behavior settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Behavior settings are specific to each agent and control how the agent processes and responds to user interactions.</p>
      </div>
    </section>
  );
};

export default AgentBehaviorSection;
