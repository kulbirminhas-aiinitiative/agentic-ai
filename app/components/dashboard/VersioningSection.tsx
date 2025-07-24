
"use client";
import React, { useState, useEffect } from "react";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface VersioningProps {
  selectedAgentId?: number | null;
}

const VersioningSection: React.FC<VersioningProps> = ({ selectedAgentId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(selectedAgentId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Versioning settings
  const [versionManagementEnabled, setVersionManagementEnabled] = useState(false);
  const [rbacEnabled, setRbacEnabled] = useState(false);

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

  // Fetch agent-specific versioning settings
  useEffect(() => {
    if (selectedAgent) {
      const fetchVersioningSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              switch (setting.setting_key) {
                case 'versioning_management_enabled':
                  setVersionManagementEnabled(setting.setting_value === 'true');
                  break;
                case 'versioning_rbac_enabled':
                  setRbacEnabled(setting.setting_value === 'true');
                  break;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching versioning settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchVersioningSettings();
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
        { agent_id: selectedAgent, setting_key: 'versioning_management_enabled', setting_value: String(versionManagementEnabled) },
        { agent_id: selectedAgent, setting_key: 'versioning_rbac_enabled', setting_value: String(rbacEnabled) }
      ];

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Versioning settings saved successfully!');
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
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Versioning & Collaboration</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="versioning-agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="versioning-agent-select"
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
              Loading versioning settings...
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Version Management</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Save, load, and manage agent versions (UI stub)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${versionManagementEnabled ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setVersionManagementEnabled(!versionManagementEnabled)}
                  >
                    {versionManagementEnabled ? 'Enabled' : 'Enable'}
                  </button>
                </div>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Version management UI coming soon.</div>
              </div>
              
              <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-primary)' }}>Role-Based Access Control</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>Manage user roles and permissions (UI stub)</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                  <button
                    type="button"
                    className={`btn ${rbacEnabled ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => setRbacEnabled(!rbacEnabled)}
                  >
                    {rbacEnabled ? 'Enabled' : 'Enable'}
                  </button>
                </div>
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center' }}>RBAC UI coming soon.</div>
              </div>

              {/* Save Button */}
              <div className="card" style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}
                >
                  {saving ? 'Saving...' : 'Save Versioning Settings'}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its versioning settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Versioning settings are specific to each agent and control collaboration and version management for that agent.</p>
      </div>
    </section>
  );
};

export default VersioningSection;
