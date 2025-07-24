
"use client";
import React, { useState, useEffect } from "react";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface GeneralSettingsProps {
  onConfigChange?: (config: Record<string, any>) => void;
  initialConfig?: Record<string, any>;
  selectedAgentId?: number | null;
}

const defaultConfig = {
  temperature: 0.7,
  model: "gpt-4",
  top_p: 1,
  top_k: 40,
  max_tokens: 2048,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop_sequences: "",
};

const modelOptions = [
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "Llama-2 70B", value: "llama-2-70b" },
  { label: "Custom", value: "custom" },
];

type ConfigKey = keyof typeof defaultConfig;
type FieldDef = {
  label: string;
  name: ConfigKey;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
};

const fields: FieldDef[] = [
  { label: 'Model', name: 'model', type: 'select', options: modelOptions },
  { label: 'Temperature', name: 'temperature', type: 'number', min: 0, max: 1, step: 0.01 },
  { label: 'Top-p', name: 'top_p', type: 'number', min: 0, max: 1, step: 0.01 },
  { label: 'Top-k', name: 'top_k', type: 'number', min: 1, max: 100, step: 1 },
  { label: 'Max Tokens', name: 'max_tokens', type: 'number', min: 1, max: 8192, step: 1 },
  { label: 'Frequency Penalty', name: 'frequency_penalty', type: 'number', min: -2, max: 2, step: 0.01 },
  { label: 'Presence Penalty', name: 'presence_penalty', type: 'number', min: -2, max: 2, step: 0.01 },
  { label: 'Stop Sequences (comma separated)', name: 'stop_sequences', type: 'text' },
];

const GeneralSettingsSection: React.FC<GeneralSettingsProps> = ({ onConfigChange, initialConfig, selectedAgentId }) => {
  const [config, setConfig] = useState({ ...defaultConfig, ...initialConfig });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(selectedAgentId || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        if (data.agents) {
          setAgents(data.agents);
          // If no agent selected and agents available, select the first one
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

  // Fetch agent-specific settings when agent is selected
  useEffect(() => {
    if (selectedAgent) {
      const fetchAgentSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            // Convert settings array to config object
            const agentConfig = { ...defaultConfig };
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              const key = setting.setting_key;
              const value = setting.setting_value;
              // Parse numeric values
              if (key in agentConfig) {
                if (typeof (agentConfig as any)[key] === 'number') {
                  (agentConfig as any)[key] = Number(value);
                } else {
                  (agentConfig as any)[key] = value;
                }
              }
            });
            setConfig(agentConfig);
          }
        } catch (error) {
          console.error('Error fetching agent settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAgentSettings();
    }
  }, [selectedAgent]);

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = Number(e.target.value);
    setSelectedAgent(agentId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? Number(value) : value;
    setConfig(prev => {
      const newConfig = { ...prev, [name]: val };
      onConfigChange?.(newConfig);
      return newConfig;
    });
  };

  const saveSettings = async () => {
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }

    setSaving(true);
    try {
      // Save each config setting to the agent_settings table
      const settingsToSave = Object.entries(config).map(([key, value]) => ({
        agent_id: selectedAgent,
        setting_key: key,
        setting_value: String(value)
      }));

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
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
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>General Settings</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="agent-select"
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
        <form className="card" style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading agent settings...
            </div>
          ) : (
            <>
              {fields.map((field) => (
          <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <label htmlFor={field.name} style={{ flex: '0 0 180px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={config[field.name]}
                onChange={handleChange}
                className="form-input"
                style={{ flex: 1 }}
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                min={field.min}
                max={field.max}
                step={field.step}
                value={config[field.name]}
                onChange={handleChange}
                className="form-input"
                style={{ flex: 1 }}
              />
            )}
          </div>
        ))}
        
        {/* Save Button */}
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving}
          className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}
          style={{ marginTop: 'var(--spacing-md)' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        </>
        )}
      </form>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Settings are specific to each agent and will be used for that agent's chat requests.</p>
      </div>
    </section>
  );
};

export default GeneralSettingsSection;
