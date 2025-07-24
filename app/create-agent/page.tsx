"use client";
import React, { useState } from 'react';
import ModernNavigation from '../components/ModernNavigation';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AgentForm>({
    name: '',
    description: '',
    ragArchitecture: 'baseline',
    modelProvider: 'openai',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: ''
  });

  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', icon: '◯' },
    { id: 2, title: 'Architecture', icon: '◎' },
    { id: 3, title: 'Configuration', icon: '◐' },
    { id: 4, title: 'Review', icon: '◑' }
  ];

  const ragArchitectures = [
    {
      id: 'baseline',
      name: 'Baseline RAG',
      icon: '◯',
      description: 'Simple vector search with embeddings',
      features: ['Vector similarity search', 'Basic retrieval', 'Fast setup'],
      recommended: false
    },
    {
      id: 'rerank',
      name: 'Rerank RAG',
      icon: '◎',
      description: 'Enhanced with re-ranking for better relevance',
      features: ['Vector search', 'Result re-ranking', 'Improved accuracy'],
      recommended: true
    },
    {
      id: 'llamaindex-pinecone',
      name: 'LlamaIndex + Pinecone',
      icon: '◐',
      description: 'Advanced with LlamaIndex and Pinecone vector DB',
      features: ['Scalable vector DB', 'Advanced indexing', 'Production ready'],
      recommended: false
    },
    {
      id: 'enhanced',
      name: 'Enhanced RAG',
      icon: '◑',
      description: 'Multiple retrieval strategies with fallbacks',
      features: ['Hybrid search', 'Multiple strategies', 'Auto-fallback'],
      recommended: false
    }
  ];

  const handleInputChange = (field: keyof AgentForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Creating agent:', formData);
      // Redirect to agents page after creation
      window.location.href = '/agents';
    } catch (error) {
      console.error('Error creating agent:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <span className="step-icon">◯</span>
              Basic Information
            </h2>
            <p className="step-description">
              Let's start with the basics. Give your agent a name and description.
            </p>
            
            <div className="form-grid">
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
              
              <div className="form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your agent will do..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <span className="step-icon">◎</span>
              RAG Architecture
            </h2>
            <p className="step-description">
              Choose the retrieval architecture that best fits your needs.
            </p>
            
            <div className="architecture-grid">
              {ragArchitectures.map((arch) => (
                <div
                  key={arch.id}
                  className={`architecture-card ${formData.ragArchitecture === arch.id ? 'selected' : ''} ${arch.recommended ? 'recommended' : ''}`}
                  onClick={() => handleInputChange('ragArchitecture', arch.id)}
                >
                  {arch.recommended && (
                    <div className="recommended-badge">Recommended</div>
                  )}
                  
                  <div className="arch-header">
                    <div className="arch-icon">{arch.icon}</div>
                    <h3 className="arch-name">{arch.name}</h3>
                  </div>
                  
                  <p className="arch-description">{arch.description}</p>
                  
                  <ul className="arch-features">
                    {arch.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-icon">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <span className="step-icon">◐</span>
              Configuration
            </h2>
            <p className="step-description">
              Fine-tune your agent's behavior and model settings.
            </p>
            
            <div className="config-sections">
              <div className="config-section">
                <h3 className="config-title">Model Settings</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Model Provider</label>
                    <select
                      className="form-select"
                      value={formData.modelProvider}
                      onChange={(e) => handleInputChange('modelProvider', e.target.value)}
                    >
                      <option value="openai">OpenAI GPT-4</option>
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
              
              <div className="config-section">
                <h3 className="config-title">System Prompt</h3>
                <div className="form-group">
                  <label className="form-label">Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={formData.systemPrompt}
                    onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                    placeholder="Enter system instructions for your agent..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="step-content">
            <h2 className="step-title">
              <span className="step-icon">◑</span>
              Review & Create
            </h2>
            <p className="step-description">
              Review your agent configuration before creating.
            </p>
            
            <div className="review-sections">
              <div className="review-section">
                <h3 className="review-title">Basic Information</h3>
                <div className="review-item">
                  <span className="review-label">Name:</span>
                  <span className="review-value">{formData.name || 'Unnamed Agent'}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{formData.description || 'No description'}</span>
                </div>
              </div>
              
              <div className="review-section">
                <h3 className="review-title">Architecture</h3>
                <div className="review-item">
                  <span className="review-label">RAG Type:</span>
                  <span className="review-value">
                    {ragArchitectures.find(arch => arch.id === formData.ragArchitecture)?.name}
                  </span>
                </div>
              </div>
              
              <div className="review-section">
                <h3 className="review-title">Configuration</h3>
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
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="create-agent-container">
      <ModernNavigation />
      
      <main className="create-agent-main">
        {/* Header */}
        <div className="create-header">
          <h1 className="page-title">
            <span className="title-icon">◑</span>
            Create New Agent
          </h1>
          <p className="page-subtitle">
            Build an intelligent AI agent tailored to your needs
          </p>
        </div>

        {/* Progress Steps */}
        <div className="progress-container">
          <div className="progress-steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`progress-step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              >
                <div className="step-number">{step.icon}</div>
                <div className="step-title">{step.title}</div>
              </div>
            ))}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="step-container">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="nav-buttons">
          <button
            className="nav-btn secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <span className="btn-icon">◐</span>
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={currentStep === 1 && !formData.name}
            >
              Next
              <span className="btn-icon">◑</span>
            </button>
          ) : (
            <button
              className="nav-btn primary create-btn"
              onClick={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <span className="loading-spinner">◯◎◐◑</span>
                  Creating...
                </>
              ) : (
                <>
                  Create Agent
                  <span className="btn-icon">✨</span>
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateAgentPage;