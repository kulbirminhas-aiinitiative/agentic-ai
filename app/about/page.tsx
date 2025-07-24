"use client";
import ModernNavigation from "../components/ModernNavigation";
import Link from "next/link";
import './about.css';

export default function About() {
  return (
    <div className="about-container">
      <ModernNavigation />
      
      <div className="about-main">
        <div className="about-background">
          <div className="bg-particles">
            {Array.from({ length: 50 }, (_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              >
                {['○', '◯', '◎', '●'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>
        </div>

        <div className="about-content">
          {/* Hero Section */}
          <section className="about-hero">
            <div className="hero-icon">🤖</div>
            <h1 className="hero-title">ABOUT_AGENTIC_AI</h1>
            <p className="hero-subtitle">/// INTELLIGENT_AUTOMATION_PLATFORM</p>
            <div className="hero-terminal">
              <div className="terminal-text">
                &gt; INITIALIZING_AI_SYSTEMS...<br/>
                &gt; LOADING_INTELLIGENCE_MODULES...<br/>
                &gt; STATUS: READY_FOR_DEPLOYMENT
              </div>
            </div>
            <p className="hero-description">
              Empowering businesses to build, manage, and deploy intelligent AI agents 
              with unprecedented ease and sophistication.
            </p>
          </section>

          {/* Mission, Vision, Values */}
          <section className="about-pillars">
            <div className="pillar-card">
              <div className="pillar-header">
                <div className="pillar-icon">🎯</div>
                <h3 className="pillar-title">MISSION_PROTOCOL</h3>
              </div>
              <div className="pillar-content">
                <p>
                  To democratize AI technology by making it accessible for businesses 
                  of all sizes to create intelligent, conversational agents that enhance 
                  customer experiences and streamline operations.
                </p>
                <div className="pillar-stats">
                  <div className="stat-item">
                    <span className="stat-value">1000+</span>
                    <span className="stat-label">Businesses_Served</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">99.9%</span>
                    <span className="stat-label">Uptime_Guaranteed</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pillar-card">
              <div className="pillar-header">
                <div className="pillar-icon">🚀</div>
                <h3 className="pillar-title">VISION_SYSTEM</h3>
              </div>
              <div className="pillar-content">
                <p>
                  A world where every business can leverage the power of AI agents 
                  to provide exceptional customer service, automate workflows, 
                  and drive innovation across multiple channels.
                </p>
                <div className="pillar-stats">
                  <div className="stat-item">
                    <span className="stat-value">50M+</span>
                    <span className="stat-label">Messages_Processed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">AI_Availability</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pillar-card">
              <div className="pillar-header">
                <div className="pillar-icon">⚡</div>
                <h3 className="pillar-title">EXECUTION_ENGINE</h3>
              </div>
              <div className="pillar-content">
                <p>
                  We provide a comprehensive platform for building, training, and 
                  deploying AI agents across multiple channels including email, 
                  chat, social media, and custom integrations.
                </p>
                <div className="pillar-stats">
                  <div className="stat-item">
                    <span className="stat-value">15+</span>
                    <span className="stat-label">Integration_Channels</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">AI</span>
                    <span className="stat-label">Powered_Intelligence</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="features-header">
              <h2 className="features-title">CORE_CAPABILITIES</h2>
              <p className="features-subtitle">/// ADVANCED_AI_FEATURE_SET</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h4 className="feature-title">INTELLIGENT_AGENTS</h4>
                <p className="feature-description">
                  Create sophisticated AI agents powered by advanced language models
                  with deep learning capabilities and contextual understanding.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">GPT-4</span>
                  <span className="tech-tag">Claude</span>
                  <span className="tech-tag">Custom_Models</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h4 className="feature-title">KNOWLEDGE_BASE</h4>
                <p className="feature-description">
                  Upload documents, connect databases, and integrate APIs for rich 
                  contextual information and dynamic responses.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">RAG</span>
                  <span className="tech-tag">Vector_DB</span>
                  <span className="tech-tag">API_Integration</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔗</div>
                <h4 className="feature-title">MULTI_CHANNEL</h4>
                <p className="feature-description">
                  Deploy across email, chat, social media, and custom platforms 
                  with seamless integration and unified management.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">Slack</span>
                  <span className="tech-tag">Discord</span>
                  <span className="tech-tag">Email</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h4 className="feature-title">ANALYTICS_DASHBOARD</h4>
                <p className="feature-description">
                  Monitor performance, track costs, and analyze user interactions 
                  with comprehensive reporting and insights.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">Real_Time</span>
                  <span className="tech-tag">Metrics</span>
                  <span className="tech-tag">Export</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h4 className="feature-title">SECURITY_PROTOCOL</h4>
                <p className="feature-description">
                  Enterprise-grade security with encryption, access controls, 
                  and compliance with industry standards.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">SOC2</span>
                  <span className="tech-tag">GDPR</span>
                  <span className="tech-tag">SSL</span>
                </div>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚙️</div>
                <h4 className="feature-title">CUSTOM_WORKFLOWS</h4>
                <p className="feature-description">
                  Build complex workflows with conditional logic, integrations, 
                  and automated processes tailored to your business needs.
                </p>
                <div className="feature-tech">
                  <span className="tech-tag">Logic_Engine</span>
                  <span className="tech-tag">Webhooks</span>
                  <span className="tech-tag">Automation</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <div className="cta-content">
              <h2 className="cta-title">READY_FOR_DEPLOYMENT?</h2>
              <p className="cta-subtitle">
                Join thousands of businesses already using Agentic AI to transform 
                their customer interactions and automate their workflows.
              </p>
              
              <div className="cta-stats">
                <div className="cta-stat">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-description">Active_Agents</div>
                </div>
                <div className="cta-stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-description">Customer_Satisfaction</div>
                </div>
                <div className="cta-stat">
                  <div className="stat-number">24/7</div>
                  <div className="stat-description">Support_Available</div>
                </div>
              </div>

              <div className="cta-actions">
                <Link href="/create-agent" className="primary-btn">
                  <span className="btn-icon">🚀</span>
                  <span className="btn-text">START_FREE_TRIAL</span>
                </Link>
                <Link href="/contact" className="secondary-btn">
                  <span className="btn-icon">💬</span>
                  <span className="btn-text">CONTACT_SALES</span>
                </Link>
              </div>

              <div className="cta-terminal">
                <div className="terminal-line">┌── DEPLOYMENT STATUS ───────────────────────┐</div>
                <div className="terminal-line">│ SYSTEM: READY_FOR_NEW_AGENTS               │</div>
                <div className="terminal-line">│ CAPACITY: UNLIMITED_SCALING                 │</div>
                <div className="terminal-line">│ TRIAL: 14_DAYS_FULL_ACCESS                  │</div>
                <div className="terminal-line">│ SETUP_TIME: &lt; 5_MINUTES                     │</div>
                <div className="terminal-line">└─────────────────────────────────────────────┘</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
