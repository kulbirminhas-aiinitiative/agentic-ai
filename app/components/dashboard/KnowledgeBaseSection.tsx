
"use client";
import React, { useState, useEffect } from "react";
import AgentFileManager from "../AgentFileManager";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
}

interface KnowledgeBaseProps {
  selectedAgentId?: number | null;
}

const KnowledgeBaseSection: React.FC<KnowledgeBaseProps> = ({ selectedAgentId }) => {
  const [dbConnected, setDbConnected] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [webScrapingEnabled, setWebScrapingEnabled] = useState(false);
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

  // Update selectedAgent when prop changes
  useEffect(() => {
    if (selectedAgentId !== undefined) {
      setSelectedAgent(selectedAgentId);
    }
  }, [selectedAgentId]);

  // Fetch agent-specific knowledge base settings
  useEffect(() => {
    if (selectedAgent) {
      const fetchKnowledgeSettings = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/agent-settings?id=${selectedAgent}`);
          const data = await response.json();
          if (data.settings) {
            data.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
              switch (setting.setting_key) {
                case 'kb_db_connected':
                  setDbConnected(setting.setting_value === 'true');
                  break;
                case 'kb_api_connected':
                  setApiConnected(setting.setting_value === 'true');
                  break;
                case 'kb_web_scraping_enabled':
                  setWebScrapingEnabled(setting.setting_value === 'true');
                  break;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching knowledge settings:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchKnowledgeSettings();
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
        { agent_id: selectedAgent, setting_key: 'kb_db_connected', setting_value: String(dbConnected) },
        { agent_id: selectedAgent, setting_key: 'kb_api_connected', setting_value: String(apiConnected) },
        { agent_id: selectedAgent, setting_key: 'kb_web_scraping_enabled', setting_value: String(webScrapingEnabled) }
      ];

      const response = await fetch('/api/agent-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        alert('Knowledge base settings saved successfully!');
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
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-primary)' }}>Knowledge Base / Data Sources</h2>
      
      {/* Agent Selection */}
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <label htmlFor="kb-agent-select" style={{ display: 'block', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-primary)' }}>
          Select Agent
        </label>
        <select
          id="kb-agent-select"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
              Loading knowledge base settings...
            </div>
          ) : (
            <>
              {/* Agent File Manager */}
              <AgentFileManager agentId={selectedAgent?.toString() || null} />
              
              {/* Other Knowledge Base Settings */}
              <form className="card" style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {/* Connect Database */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <label style={{ flex: '0 0 180px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Connect Database</label>
                  <button
                    type="button"
                    className={`btn ${dbConnected ? 'btn-success' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setDbConnected((v) => !v)}
                  >
                    {dbConnected ? 'Connected' : 'Connect'}
                  </button>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-xs)' }}>(UI stub)</span>
                </div>
                
                {/* Integrate API */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <label style={{ flex: '0 0 180px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Integrate API</label>
                  <button
                    type="button"
                    className={`btn ${apiConnected ? 'btn-success' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setApiConnected((v) => !v)}
                  >
                    {apiConnected ? 'Connected' : 'Connect'}
                  </button>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-xs)' }}>(UI stub)</span>
                </div>
                
                {/* Web Scraping / Crawler */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <label style={{ flex: '0 0 180px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Web Scraping / Crawler</label>
                  <button
                    type="button"
                    className={`btn ${webScrapingEnabled ? 'btn-success' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                    onClick={() => setWebScrapingEnabled((v) => !v)}
                  >
                    {webScrapingEnabled ? 'Enabled' : 'Enable'}
                  </button>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-xs)' }}>(UI stub)</span>
                </div>
                
                {/* Data Preprocessing / Chunking Settings */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <label style={{ flex: '0 0 180px', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>Data Preprocessing / Chunking</label>
                  <span style={{ flex: 1, color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Settings for chunk size, overlap, etc. (UI stub)</span>
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving}
                  className={`btn btn-primary ${saving ? 'btn-disabled' : ''}`}
                  style={{ marginTop: 'var(--spacing-md)' }}
                >
                  {saving ? 'Saving...' : 'Save Knowledge Base Settings'}
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
          Please select an agent to configure its knowledge base settings.
        </div>
      )}
      
      <div style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
        <p>Knowledge base settings are specific to each agent and will be used for that agent's data processing.</p>
      </div>
    </section>
  );
};

export default KnowledgeBaseSection;
