"use client";
import React, { useState } from 'react';
import ModernNavigation from '../components/ModernNavigation';
import Footer from '../components/Footer';
import './create-agent.css';

interface AgentForm {
  name: string;
  description: string;
  ragArchitecture: string;
  modelProvider: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

const CreateAgentPage = () => {
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<AgentForm>({
    name: '',
    description: '',
    ragArchitecture: 'llamaindex-pinecone',
    systemPrompt: '',
    modelProvider: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 512
  });

  const [isCreating, setIsCreating] = useState(false);

  const sections = [
    { 
      id: 'basic', 
      title: 'Basic Info', 
      icon: '◯',
      description: 'Name and description',
      isComplete: () => formData.name.trim() !== '' && formData.description.trim() !== ''
    },
    { 
      id: 'architecture', 
      title: 'Architecture', 
      icon: '◐',
      description: 'RAG configuration',
      isComplete: () => formData.ragArchitecture !== ''
    },
    { 
      id: 'configuration', 
      title: 'Configuration', 
      icon: '◑',
      description: 'Model settings',
      isComplete: () => formData.modelProvider !== '' && formData.temperature >= 0 && formData.maxTokens > 0
    },
    { 
      id: 'review', 
      title: 'Review', 
      icon: '●',
      description: 'Final check',
      isComplete: () => true
    }
  ];

  const ragArchitectures = [
    {
      id: 'llamaindex-pinecone',
      name: 'LlamaIndex + Pinecone',
      icon: '◐',
      description: 'Advanced with LlamaIndex and Pinecone vector DB',
      features: ['Scalable vector DB', 'Advanced indexing', 'Production ready'],
      recommended: true
    },
    {
      id: 'self-rag',
      name: 'Self-RAG',
      icon: '🧠',
      description: 'Self-evaluating RAG with iterative improvement',
      features: ['Self-evaluation', 'Iterative refinement', 'Quality scoring'],
      recommended: false
    },
    {
      id: 'agentic-rag',
      name: 'Agentic RAG',
      icon: '🤖',
      description: 'Planning-based RAG with tool integration',
      features: ['Multi-step planning', 'Tool integration', 'External data access'],
      recommended: false
    },
    {
      id: 'graph-rag',
      name: 'Graph RAG',
      icon: '🕸️',
      description: 'Knowledge graph-enhanced retrieval',
      features: ['Entity extraction', 'Relationship modeling', 'Graph traversal'],
      recommended: false
    },
    {
      id: 'hyde-rag',
      name: 'HyDE RAG',
      icon: '📝',
      description: 'Hypothetical Document Embedding RAG',
      features: ['Hypothetical generation', 'Ensemble retrieval', 'Semantic enhancement'],
      recommended: false
    },
    {
      id: 'corrective-rag',
      name: 'Corrective RAG',
      icon: '🔍',
      description: 'Error-detecting RAG with automated corrections',
      features: ['Error detection', 'Source validation', 'Iterative correction'],
      recommended: false
    },
    {
      id: 'retrieve-rerank',
      name: 'Retrieve & Rerank',
      icon: '◎',
      description: 'Enhanced with re-ranking for better relevance',
      features: ['Vector search', 'Result re-ranking', 'Improved accuracy'],
      recommended: false
    },
    {
      id: 'baseline',
      name: 'Baseline RAG',
      icon: '◯',
      description: 'Simple vector search with embeddings',
      features: ['Vector similarity search', 'Basic retrieval', 'Fast setup'],
      recommended: false
    }
  ];

  // Update completed sections when form data changes
  React.useEffect(() => {
    const newCompleted = new Set<string>();
    sections.forEach(section => {
      if (section.isComplete()) {
        newCompleted.add(section.id);
      }
    });
    setCompletedSections(newCompleted);
  }, [formData]);

  const handleInputChange = (field: keyof AgentForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getProgressIcon = (sectionId: string, index: number) => {
    const isCompleted = completedSections.has(sectionId);
    const isActive = activeSection === sectionId;
    const total = sections.length;
    const current = index + 1;
    
    if (isCompleted) {
      return '●';
    }
    
    // Show fractional completion based on position
    const fractionIcons = ['◯', '◔', '◑', '◕', '●'];
    const fractionIndex = Math.floor((current / total) * (fractionIcons.length - 1));
    
    if (isActive) {
      return fractionIcons[fractionIndex] || '◯';
    }
    
    return '◯';
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const canSubmit = () => {
    return sections.slice(0, -1).every(section => section.isComplete()) && formData.name.trim() !== '';
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;
    
    setIsCreating(true);
    try {
      // Call the actual backend API
      const response = await fetch('http://localhost:8000/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.toLowerCase().replace(/\s+/g, '-'),
          display_name: formData.name,
          description: formData.description,
          rag_architecture: formData.ragArchitecture
        })
      });

      if (response.ok) {
        const newAgent = await response.json();
        console.log('Agent created successfully:', newAgent);
        
        // Update agent settings if needed
        if (formData.systemPrompt || formData.temperature !== 0.7 || formData.maxTokens !== 1000) {
          const settingsResponse = await fetch(`http://localhost:8000/agents/${newAgent.id}/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: formData.modelProvider === 'openai' ? 'gpt-4o' : 'gpt-4',
              temperature: formData.temperature,
              max_tokens: formData.maxTokens,
              system_prompt: formData.systemPrompt || `You are a helpful AI assistant named ${formData.name}.`
            })
          });
          
          if (settingsResponse.ok) {
            console.log('Agent settings updated successfully');
          }
        }
        
        // Redirect to agents page after creation
        alert(`Agent "${formData.name}" created successfully!`);
        window.location.href = '/agents';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error creating agent: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="section-content">
            <div className="form-grid-compact">
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Customer Support Bot"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea-compact"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your agent will do..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
        
      case 'architecture':
        return (
          <div className="section-content">
            <div className="architecture-grid-compact">
              {ragArchitectures.slice(0, 4).map((arch) => (
                <div
                  key={arch.id}
                  className={`architecture-card-compact ${formData.ragArchitecture === arch.id ? 'selected' : ''} ${arch.recommended ? 'recommended' : ''}`}
                  onClick={() => handleInputChange('ragArchitecture', arch.id)}
                >
                  {arch.recommended && (
                    <div className="recommended-badge-compact">★</div>
                  )}
                  
                  <div className="arch-header-compact">
                    <div className="arch-icon-compact">{arch.icon}</div>
                    <h4 className="arch-name-compact">{arch.name}</h4>
                  </div>
                  
                  <p className="arch-description-compact">{arch.description}</p>
                  
                  <ul className="arch-features-compact">
                    {arch.features.slice(0, 2).map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {ragArchitectures.length > 4 && (
              <details className="more-architectures">
                <summary>View More Architectures ({ragArchitectures.length - 4} more)</summary>
                <div className="architecture-grid-compact">
                  {ragArchitectures.slice(4).map((arch) => (
                    <div
                      key={arch.id}
                      className={`architecture-card-compact ${formData.ragArchitecture === arch.id ? 'selected' : ''}`}
                      onClick={() => handleInputChange('ragArchitecture', arch.id)}
                    >
                      <div className="arch-header-compact">
                        <div className="arch-icon-compact">{arch.icon}</div>
                        <h4 className="arch-name-compact">{arch.name}</h4>
                      </div>
                      
                      <p className="arch-description-compact">{arch.description}</p>
                      
                      <ul className="arch-features-compact">
                        {arch.features.slice(0, 2).map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        );
        
      case 'configuration':
        return (
          <div className="section-content">
            <div className="config-grid-compact">
              <div className="config-group">
                <h4 className="config-title-compact">Model Settings</h4>
                <div className="form-grid-compact">
                  <div className="form-group">
                    <label className="form-label">Provider</label>
                    <select
                      className="form-select"
                      value={formData.modelProvider}
                      onChange={(e) => handleInputChange('modelProvider', e.target.value)}
                    >
                      <option value="gpt-4o">OpenAI GPT-4</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="local">Local Model</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Temperature: {formData.temperature}
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    />
                    <div className="range-labels">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Max Tokens</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.maxTokens}
                      onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="config-group">
                <h4 className="config-title-compact">System Prompt</h4>
                <div className="form-group">
                  <textarea
                    className="form-textarea-compact"
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    placeholder="Enter system instructions for your agent..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div className="section-content">
            <div className="review-grid">
              <div className="review-section-compact">
                <h4 className="review-title-compact">
                  <span className="review-icon">◯</span>
                  Basic Information
                </h4>
                <div className="review-items">
                  <div className="review-item">
                    <span className="review-label">Name:</span>
                    <span className="review-value">{formData.name || 'Unnamed Agent'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Description:</span>
                    <span className="review-value">{formData.description || 'No description'}</span>
                  </div>
                </div>
              </div>
              
              <div className="review-section-compact">
                <h4 className="review-title-compact">
                  <span className="review-icon">◐</span>
                  Architecture
                </h4>
                <div className="review-items">
                  <div className="review-item">
                    <span className="review-label">RAG Type:</span>
                    <span className="review-value">
                      {ragArchitectures.find(arch => arch.id === formData.ragArchitecture)?.name}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="review-section-compact">
                <h4 className="review-title-compact">
                  <span className="review-icon">◑</span>
                  Configuration
                </h4>
                <div className="review-items">
                  <div className="review-item">
                    <span className="review-label">Model:</span>
                    <span className="review-value">{formData.modelProvider}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Temperature:</span>
                    <span className="review-value">{formData.temperature}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Max Tokens:</span>
                    <span className="review-value">{formData.maxTokens}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="create-button-container">
              <button
                className="create-btn-final"
                onClick={handleSubmit}
                disabled={!canSubmit() || isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="loading-spinner">⌛</span>
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <span className="create-icon">✨</span>
                    Create Agent
                  </>
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="create-agent-container-improved">
      <ModernNavigation />
      
      <main className="create-agent-main-improved">
        {/* Header */}
        <div className="create-header-improved">
          <h1 className="page-title-improved">
            <span className="title-icon-improved">🤖</span>
            Create New Agent
          </h1>
          <p className="page-subtitle-improved">
            Build an intelligent AI agent tailored to your needs
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="create-layout">
          {/* Left Sidebar - Progress Navigation */}
          <div className="progress-sidebar">
            <div className="progress-header">
              <h3>Setup Progress</h3>
              <div className="overall-progress">
                <div className="progress-circle">
                  <span className="progress-text">
                    {completedSections.size}/{sections.length}
                  </span>
                </div>
              </div>
            </div>
            
            <nav className="progress-nav">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  className={`progress-nav-item ${activeSection === section.id ? 'active' : ''} ${completedSections.has(section.id) ? 'completed' : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                >
                  <div className="nav-icon">
                    {getProgressIcon(section.id, index)}
                  </div>
                  <div className="nav-content">
                    <div className="nav-title">{section.title}</div>
                    <div className="nav-description">{section.description}</div>
                  </div>
                  {completedSections.has(section.id) && (
                    <div className="nav-check">✓</div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="content-area">
            <div className="section-header">
              <h2 className="section-title">
                <span className="section-icon">
                  {sections.find(s => s.id === activeSection)?.icon}
                </span>
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <div className="section-progress">
                Step {sections.findIndex(s => s.id === activeSection) + 1} of {sections.length}
              </div>
            </div>
            
            {renderSectionContent()}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateAgentPage;