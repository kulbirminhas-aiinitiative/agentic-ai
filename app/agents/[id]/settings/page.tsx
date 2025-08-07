'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ModernNavigation from '../../../components/ModernNavigation';

interface AgentSettings {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  rag_enabled?: boolean;
  similarity_threshold?: number;
  max_docs_to_retrieve?: number;
  chunk_size?: number;
  chunk_overlap?: number;
}

interface Agent {
  id: number;
  name: string;
  description: string;
  rag_architecture: string;
  model: string;
  status: string;
}

export default function AgentSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [settings, setSettings] = useState<AgentSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (agentId) {
      loadAgentAndSettings();
    }
  }, [agentId]);

  const loadAgentAndSettings = async () => {
    try {
      setLoading(true);
      
      // Load agent details
      const agentResponse = await fetch('/api/agents');
      const agents = await agentResponse.json();
      const currentAgent = agents.find((a: Agent) => a.id === parseInt(agentId));
      
      if (!currentAgent) {
        setError('Agent not found');
        return;
      }
      
      setAgent(currentAgent);

      // Load agent settings
      const settingsResponse = await fetch(`/api/agents/${agentId}/settings`);
      if (settingsResponse.ok) {
        const agentSettings = await settingsResponse.json();
        setSettings(agentSettings);
      } else {
        // Set default settings if none exist
        setSettings({
          model: currentAgent.model || 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 2000,
          system_prompt: '',
          rag_enabled: true,
          similarity_threshold: 0.7,
          max_docs_to_retrieve: 5,
          chunk_size: 1000,
          chunk_overlap: 200
        });
      }
    } catch (error) {
      console.error('Error loading agent settings:', error);
      setError('Failed to load agent settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/agents/${agentId}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AgentSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div>
        <ModernNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading agent settings...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ModernNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
              <div className="text-red-400 font-medium">Error</div>
              <div className="text-red-300">{error}</div>
            </div>
            <button
              onClick={() => router.push('/agents')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModernNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/agents')}
              className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
            >
              ← Back to Agents
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Configure Agent: {agent?.name}
            </h1>
            <p className="text-gray-400">{agent?.description}</p>
          </div>

          {/* Settings Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Model Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Model Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model
                  </label>
                  <select
                    value={settings.model || ''}
                    onChange={(e) => updateSetting('model', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="claude-3-opus">Claude 3 Opus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Temperature: {settings.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature || 0.7}
                    onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={settings.max_tokens || 2000}
                    onChange={(e) => updateSetting('max_tokens', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* RAG Settings */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">RAG Settings</h3>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="rag_enabled"
                    checked={settings.rag_enabled || false}
                    onChange={(e) => updateSetting('rag_enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="rag_enabled" className="text-sm font-medium text-gray-300">
                    Enable RAG
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Similarity Threshold: {settings.similarity_threshold}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={settings.similarity_threshold || 0.7}
                    onChange={(e) => updateSetting('similarity_threshold', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Documents to Retrieve
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={settings.max_docs_to_retrieve || 5}
                    onChange={(e) => updateSetting('max_docs_to_retrieve', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chunk Size
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="5000"
                    step="100"
                    value={settings.chunk_size || 1000}
                    onChange={(e) => updateSetting('chunk_size', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chunk Overlap
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="50"
                    value={settings.chunk_overlap || 200}
                    onChange={(e) => updateSetting('chunk_overlap', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                System Prompt
              </label>
              <textarea
                value={settings.system_prompt || ''}
                onChange={(e) => updateSetting('system_prompt', e.target.value)}
                rows={6}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the system prompt that defines the agent's behavior and role..."
              />
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => router.push('/agents')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
