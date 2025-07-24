import React, { useEffect, useState } from 'react';

interface Agent {
  id: string;
  name: string;
}

interface AgentSettings {
  [key: string]: any;
}

const AgentSettingsManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [settings, setSettings] = useState<AgentSettings>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        // Support both array and { agents: [...] }
        if (Array.isArray(data)) {
          setAgents(data);
        } else if (Array.isArray(data.agents)) {
          setAgents(data.agents);
        } else {
          setAgents([]);
        }
      })
      .catch(() => setError('Failed to load agents'));
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      setLoading(true);
      fetch(`/api/agent-settings?id=${selectedAgent.id}`)
        .then(res => res.json())
        .then(data => {
          setSettings(data.settings || {});
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load settings');
          setLoading(false);
        });
    }
  }, [selectedAgent]);

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/agent-settings?id=${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSuccess('Settings saved!');
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-4">Agent-Specific Settings</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Agent:</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedAgent?.id || ''}
          onChange={e => {
            const agent = agents.find(a => a.id === e.target.value) || null;
            setSelectedAgent(agent);
            setSettings({});
            setSuccess(null);
            setError(null);
          }}
        >
          <option value="">-- Select an agent --</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
      </div>
      {loading && <div>Loading settings...</div>}
      {selectedAgent && !loading && (
        <div>
          {/* Example settings fields, replace with your actual settings structure */}
          <div className="mb-2">
            <label className="block mb-1">Temperature</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={settings.temperature || ''}
              onChange={e => handleChange('temperature', parseFloat(e.target.value))}
              step="0.01"
              min="0"
              max="2"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1">Max Tokens</label>
            <input
              type="number"
              className="border p-2 rounded w-full"
              value={settings.max_tokens || ''}
              onChange={e => handleChange('max_tokens', parseInt(e.target.value))}
              min="1"
              max="4096"
            />
          </div>
          {/* Add more fields as needed */}
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentSettingsManager;
