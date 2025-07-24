"use client";
import { useState } from "react";
import ModernNavigation from "../components/ModernNavigation";
import './contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    contactType: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Contact form submitted:", formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Contact form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="contact-container">
        <ModernNavigation />
        <div className="contact-main">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h1 className="success-title">MESSAGE_TRANSMITTED</h1>
            <p className="success-text">
              Your message has been successfully transmitted to our AI systems.<br/>
              Response protocol initiated. Expected response: 24-48 hours.
            </p>
            <div className="success-terminal">
              <div className="terminal-line">┌── TRANSMISSION STATUS ─────────────────────┐</div>
              <div className="terminal-line">│ STATUS: DELIVERED                          │</div>
              <div className="terminal-line">│ PRIORITY: {formData.contactType.toUpperCase().padEnd(32)} │</div>
              <div className="terminal-line">│ QUEUE_ID: MSG_{Date.now().toString().slice(-8)} │</div>
              <div className="terminal-line">└────────────────────────────────────────────┘</div>
            </div>
            <button 
              className="return-btn"
              onClick={() => setIsSubmitted(false)}
            >
              ← SEND_ANOTHER_MESSAGE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-container">
      <ModernNavigation />
      
      <div className="contact-main">
        <div className="contact-background">
          <div className="bg-grid">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="grid-line" style={{ animationDelay: `${i * 0.1}s` }}>
                {'─'.repeat(80)}
              </div>
            ))}
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-header">
            <div className="header-icon">📡</div>
            <h1 className="contact-title">COMMUNICATION_PROTOCOL</h1>
            <p className="contact-subtitle">/// INITIATE_CONTACT_SEQUENCE</p>
            <div className="header-terminal">
              <div className="terminal-text">
                &gt; ESTABLISHING_CONNECTION...<br/>
                &gt; AI_RESPONSE_SYSTEM: ONLINE<br/>
                &gt; READY_FOR_INPUT
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    &gt; CONTACT_TYPE:
                  </label>
                  <select
                    name="contactType"
                    value={formData.contactType}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="general">GENERAL_INQUIRY</option>
                    <option value="support">TECHNICAL_SUPPORT</option>
                    <option value="sales">SALES_CONSULTATION</option>
                    <option value="partnership">PARTNERSHIP_REQUEST</option>
                    <option value="feedback">FEEDBACK_PROTOCOL</option>
                    <option value="demo">DEMO_REQUEST</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    &gt; USER_IDENTIFIER:
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="John_Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    &gt; EMAIL_ADDRESS:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="user@domain.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    &gt; ORGANIZATION:
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Company_Inc"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    &gt; MESSAGE_SUBJECT:
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Brief_description"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    &gt; MESSAGE_PAYLOAD:
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Enter your detailed message here..."
                    rows={6}
                    required
                  />
                  <div className="char-counter">
                    {formData.message.length}/2000 CHARACTERS
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  <span className="btn-icon">📤</span>
                  <span className="btn-text">
                    {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT_MESSAGE'}
                  </span>
                  {isSubmitting && (
                    <div className="loading-animation">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="contact-info">
            <div className="info-section">
              <h3 className="info-title">DIRECT_ACCESS_CHANNELS</h3>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">📧</div>
                  <div className="info-content">
                    <div className="info-label">EMAIL_PROTOCOL:</div>
                    <div className="info-value">support@agentic-ai.com</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">💬</div>
                  <div className="info-content">
                    <div className="info-label">LIVE_CHAT:</div>
                    <div className="info-value">Available 24/7</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">⏱️</div>
                  <div className="info-content">
                    <div className="info-label">RESPONSE_TIME:</div>
                    <div className="info-value">24-48 Hours</div>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">🌐</div>
                  <div className="info-content">
                    <div className="info-label">TIMEZONE:</div>
                    <div className="info-value">UTC-5 (EST)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="terminal-footer">
              <div className="terminal-line">┌── SYSTEM STATUS ────────────────────────────┐</div>
              <div className="terminal-line">│ AI_SUPPORT: ACTIVE                          │</div>
              <div className="terminal-line">│ QUEUE_STATUS: PROCESSING                    │</div>
              <div className="terminal-line">│ ENCRYPTION: SSL_ENABLED                     │</div>
              <div className="terminal-line">│ UPTIME: 99.97%                              │</div>
              <div className="terminal-line">└─────────────────────────────────────────────┘</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
