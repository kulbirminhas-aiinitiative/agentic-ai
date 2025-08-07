"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ModernNavigation from "../../components/ModernNavigation";
import Footer from "../../components/Footer";

interface Agent {
  id: number;
  name: string;
  display_name?: string;
  description?: string;
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
  model: "gpt-4",
  top_p: 1,
  top_k: 40,
  max_tokens: 2048,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop_sequences: "",
};

export default function AgentChat() {
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [settings, setSettings] = useState<AgentSettings>(defaultSettings);
  const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(true);
  const [error, setError] = useState("");

  // Load agent and settings
  useEffect(() => {
    const loadAgentData = async () => {
      if (!agentId) {
        console.error('Chat: No agentId provided');
        return;
      }
      
      console.log('Chat: Loading agent data for ID:', agentId);
      setAgentLoading(true);
      
      try {
        // Fetch agent details
        console.log('Chat: Fetching agents from /api/agents');
        const agentResponse = await fetch(`/api/agents`);
        console.log('Chat: Agent API response', {
          status: agentResponse.status,
          ok: agentResponse.ok
        });
        
        const agentData = await agentResponse.json();
        console.log('Chat: Agent data received', {
          agentCount: Array.isArray(agentData) ? agentData.length : 0,
          agents: Array.isArray(agentData) ? agentData.map((a: Agent) => ({ id: a.id, name: a.name })) : []
        });
        
        // Handle both formats: direct array or {agents: [...]}
        const agentsArray = Array.isArray(agentData) ? agentData : agentData.agents || [];
        const currentAgent = agentsArray.find((a: Agent) => a.id.toString() === agentId);
        console.log('Chat: Current agent found', {
          found: !!currentAgent,
          agent: currentAgent
        });
        
        if (!currentAgent) {
          setError(`Agent not found with ID: ${agentId}`);
          console.error('Chat: Agent not found', { 
            agentId, 
            availableAgents: agentsArray.map((a: Agent) => a.id) 
          });
          return;
        }
        
        setAgent(currentAgent);
        console.log('Chat: Agent set successfully', currentAgent);
        
        // Fetch agent settings
        console.log('Chat: Fetching agent settings for ID:', agentId);
        const settingsResponse = await fetch(`/api/agent-settings?id=${agentId}`);
        console.log('Chat: Settings API response', {
          status: settingsResponse.status,
          ok: settingsResponse.ok
        });
        
        const settingsData = await settingsResponse.json();
        console.log('Chat: Settings data received', {
          hasSettings: !!settingsData.settings,
          settingsCount: settingsData.settings?.length || 0,
          settings: settingsData.settings
        });
        
        if (settingsData.settings) {
          const agentSettings = { ...defaultSettings };
          console.log('Chat: Processing agent settings', {
            defaultSettings,
            receivedSettings: settingsData.settings
          });
          
          settingsData.settings.forEach((setting: { setting_key: string; setting_value: string }) => {
            const key = setting.setting_key as keyof AgentSettings;
            console.log('Chat: Processing setting', {
              key,
              value: setting.setting_value,
              existsInDefault: key in agentSettings
            });
            
            if (key in agentSettings) {
              if (typeof agentSettings[key] === 'number') {
                (agentSettings as any)[key] = Number(setting.setting_value);
              } else {
                (agentSettings as any)[key] = setting.setting_value;
              }
            }
          });
          
          console.log('Chat: Final processed settings', agentSettings);
          setSettings(agentSettings);
        } else {
          console.log('Chat: No settings found, using defaults', defaultSettings);
        }
      } catch (err) {
        console.error('Chat: Error loading agent data', {
          error: err,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : undefined,
          agentId
        });
        setError(`Failed to load agent data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setAgentLoading(false);
        console.log('Chat: Agent loading completed');
      }
    };
    
    loadAgentData();
  }, [agentId]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !agent) {
      console.log('Chat: Blocked send attempt', { 
        inputEmpty: !input.trim(), 
        isLoading, 
        agentMissing: !agent 
      });
      return;
    }

    const userMessage = { user: "You", text: input };
    console.log('Chat: Sending message', { 
      agentId, 
      agentName: agent.name, 
      message: input,
      currentSettings: settings 
    });
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const payload = {
        messages: [
          ...messages.map(m => ({ role: m.user === "You" ? "user" : "assistant", content: m.text })),
          { role: "user", content: input }
        ],
        // Use agent-specific settings
        temperature: settings.temperature,
        model: settings.model,
        top_p: settings.top_p,
        top_k: settings.top_k,
        max_tokens: settings.max_tokens,
        frequency_penalty: settings.frequency_penalty,
        presence_penalty: settings.presence_penalty,
        stop: settings.stop_sequences ? settings.stop_sequences.split(',').map(s => s.trim()) : undefined,
        agent_id: agentId,
        agent_name: agent.name
      };

      console.log('Chat: Sending payload to /api/chat', {
        payloadSize: JSON.stringify(payload).length,
        agentId: payload.agent_id,
        messageCount: payload.messages.length,
        lastMessage: payload.messages[payload.messages.length - 1],
        settings: {
          model: payload.model,
          temperature: payload.temperature,
          max_tokens: payload.max_tokens
        }
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Chat: API response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();
      console.log('Chat: API response data', {
        hasResponse: !!data.response,
        hasError: !!data.error,
        responseLength: data.response?.length,
        errorMessage: data.error,
        fullData: data
      });
      
      if (data.response) {
        const botMessage = { user: agent.display_name || agent.name, text: data.response };
        setMessages(prev => [...prev, botMessage]);
        console.log('Chat: Bot message added successfully', {
          botName: botMessage.user,
          responseLength: botMessage.text.length
        });
      } else {
        console.error('Chat: No response in API data', data);
        throw new Error(data.error || 'No response received from API');
      }
    } catch (err) {
      console.error('Chat: Error occurred', {
        error: err,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorStack: err instanceof Error ? err.stack : undefined,
        agentId,
        input
      });
      
      // Create detailed error message for user
      let userErrorMessage = `Sorry, I encountered an error: ${err instanceof Error ? err.message : String(err)}`;
      
      // Add debugging info for development
      if (process.env.NODE_ENV === 'development') {
        userErrorMessage += `\n\nDebug Info:\n- Agent ID: ${agentId}\n- Agent: ${agent?.name}\n- Settings: ${JSON.stringify(settings, null, 2)}`;
        if (err instanceof Error && err.stack) {
          userErrorMessage += `\n- Stack: ${err.stack}`;
        }
      }
      
      const errorMessage = { user: "System", text: userErrorMessage };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('Chat: Send operation completed');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (agentLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: 'var(--color-surface)' }}>
        <ModernNavigation />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)' }}>
          <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>Loading agent...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: 'var(--color-surface)' }}>
        <ModernNavigation />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 70px)' }}>
          <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-error)' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: 'var(--color-surface)', display: "flex", flexDirection: "column" }}>
      <ModernNavigation />
      
      {/* Agent Header */}
      <div style={{ backgroundColor: 'var(--color-background)', borderBottom: "1px solid var(--color-border)", padding: 'var(--spacing-md) var(--spacing-lg)' }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', margin: 0 }}>
            Chat with {agent?.display_name || agent?.name}
          </h1>
          {agent?.description && (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: "var(--spacing-xs) 0 0 0" }}>
              {agent.description}
            </p>
          )}
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-muted)', 
            marginTop: 'var(--spacing-xs)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)'
          }}>
            <span>Model: {settings.model}</span>
            <span>•</span>
            <span>Temperature: {settings.temperature}</span>
            <span>•</span>
            <span>Max Tokens: {settings.max_tokens}</span>
            {agent?.rag_architecture && (
              <>
                <span>•</span>
                <span>RAG: {agent.rag_architecture}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container" style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "800px", padding: `0 var(--spacing-lg)` }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: `var(--spacing-lg) 0`, display: "flex", flexDirection: "column", gap: 'var(--spacing-md)' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)', padding: 'var(--spacing-xl)' }}>
              Start a conversation with {agent?.display_name || agent?.name}!
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: message.user === "You" ? "flex-end" : "flex-start",
                marginBottom: 'var(--spacing-xs)'
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  background: message.user === "You" ? 'var(--color-primary)' : 'var(--color-background)',
                  color: message.user === "You" ? '#fff' : 'var(--color-text-primary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: message.user !== "You" ? '1px solid var(--color-border)' : "none"
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)', opacity: 0.8 }}>
                  {message.user}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 'var(--spacing-xs)' }}>
              <div
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--spacing-xs)' }}>
                  {agent?.display_name || agent?.name}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)' }}>Thinking...</div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: "flex", gap: 'var(--spacing-sm)', alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent?.display_name || agent?.name}...`}
              className="form-input"
              style={{
                flex: 1,
                border: "none",
                resize: "none",
                minHeight: '20px',
                maxHeight: '100px',
                padding: 0,
                background: "transparent",
                outline: 'none'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`btn btn-primary ${(isLoading || !input.trim()) ? 'btn-disabled' : ''}`}
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
