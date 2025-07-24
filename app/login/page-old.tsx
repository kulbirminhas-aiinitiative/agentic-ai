"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Navigation from "../components/Navigation";
import UserProfileButton from '../components/UserProfileButton';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <div style={{ minHeight: "calc(100vh - 70px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ 
          background: "#fff", 
          padding: "3rem", 
          borderRadius: "12px", 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", 
          width: "100%", 
          maxWidth: "400px" 
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤖</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#181e2a", marginBottom: "0.5rem" }}>
              Welcome Back
            </h1>
            <p style={{ color: "#64748b" }}>Sign in to your Agentic AI account</p>
          </div>

          <UserProfileButton />

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ 
                display: "block", 
                fontWeight: 600, 
                color: "#374151", 
                marginBottom: "0.5rem" 
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                fontWeight: 600, 
                color: "#374151", 
                marginBottom: "0.5rem" 
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                placeholder="Enter your password"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" style={{ color: "#38bdf8", textDecoration: "none", fontSize: "0.875rem" }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              style={{
                background: "#38bdf8",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.2s"
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem", color: "#64748b" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
              Sign up
            </a>
          </div>

          <div style={{ margin: "2rem 0", textAlign: "center", color: "#9ca3af" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
              <span style={{ padding: "0 1rem", background: "#fff" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }}></div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button style={{
              background: "#fff",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 600
            }}>
              <span>🔍</span> Continue with Google
            </button>
            <button style={{
              background: "#fff",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontWeight: 600
            }}>
              <span>📧</span> Continue with Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}