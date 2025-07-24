"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ModernNavigation from "../components/ModernNavigation";
import UserProfileButton from '../components/UserProfileButton';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Login attempt:", { email, password });
      // Add your login logic here
      // await signIn('credentials', { email, password });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider);
    } catch (error) {
      console.error(`${provider} login error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ModernNavigation />
      
      <div className="login-main">
        <div className="login-background">
          <div className="bg-pattern">
            <div className="pattern-line">┌─────────────────────────────────────────────────────────────────────────────────┐</div>
            <div className="pattern-line">│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; │</div>
            <div className="pattern-line">│ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; │</div>
            <div className="pattern-line">└─────────────────────────────────────────────────────────────────────────────────┘</div>
          </div>
        </div>

        <div className="login-content">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">&gt;_</div>
              <h1 className="login-title">AUTHENTICATION_PORTAL</h1>
              <p className="login-subtitle">/// ACCESS_CONTROL_SYSTEM</p>
            </div>

            <div className="auth-section">
              <UserProfileButton />
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">
                  &gt; EMAIL_ADDRESS:
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    placeholder="user@domain.com"
                    disabled={isLoading}
                  />
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  &gt; PASSWORD:
                </label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="••••••••••••"
                    disabled={isLoading}
                  />
                  <div className="input-border"></div>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-mark">☐</span>
                  <span className="checkbox-text">REMEMBER_SESSION</span>
                </label>
                <a href="#" className="forgot-link">
                  FORGOT_CREDENTIALS?
                </a>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-icon">→</span>
                <span className="btn-text">
                  {isLoading ? 'AUTHENTICATING...' : 'EXECUTE_LOGIN'}
                </span>
                {isLoading && (
                  <div className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="divider-line">─────────────────────────────────────</div>
              <span className="divider-text">ALTERNATIVE_METHODS</span>
              <div className="divider-line">─────────────────────────────────────</div>
            </div>

            <div className="social-auth">
              <button 
                className="social-btn google-btn"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
              >
                <span className="social-icon">◉</span>
                <span className="social-text">GOOGLE_AUTH_PROTOCOL</span>
              </button>
              
              <button 
                className="social-btn microsoft-btn"
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
              >
                <span className="social-icon">⊞</span>
                <span className="social-text">MICROSOFT_AUTH_PROTOCOL</span>
              </button>
            </div>

            <div className="signup-section">
              <div className="signup-prompt">
                <span className="prompt-text">NEW_USER_DETECTED?</span>
                <a href="/signup" className="signup-link">
                  INITIALIZE_ACCOUNT →
                </a>
              </div>
            </div>

            <div className="terminal-footer">
              <div className="terminal-line">┌── AUTH STATUS ──────────────────────────────┐</div>
              <div className="terminal-line">│ CONNECTION: SECURE_HTTPS                    │</div>
              <div className="terminal-line">│ ENCRYPTION: END_TO_END                      │</div>
              <div className="terminal-line">│ SESSION: PERSISTENT_OPTIONAL                │</div>
              <div className="terminal-line">└─────────────────────────────────────────────┘</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
