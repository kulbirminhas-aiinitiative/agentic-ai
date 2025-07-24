"use client";
import { useState } from "react";
import Navigation from "../components/Navigation";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log("Signup attempt:", { firstName, lastName, email, password });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <div style={{ minHeight: "calc(100vh - 70px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div style={{ 
          background: "#fff", 
          padding: "3rem", 
          borderRadius: "12px", 
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", 
          width: "100%", 
          maxWidth: "450px" 
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🤖</div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#181e2a", marginBottom: "0.5rem" }}>
              Create Account
            </h1>
            <p style={{ color: "#64748b" }}>Start building intelligent AI agents today</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ 
                  display: "block", 
                  fontWeight: 600, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                  placeholder="John"
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  fontWeight: 600, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>

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
                  boxSizing: "border-box"
                }}
                placeholder="john@example.com"
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
                  boxSizing: "border-box"
                }}
                placeholder="Choose a strong password"
              />
            </div>

            <div>
              <label style={{ 
                display: "block", 
                fontWeight: 600, 
                color: "#374151", 
                marginBottom: "0.5rem" 
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }}
                placeholder="Confirm your password"
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <input type="checkbox" required style={{ marginTop: "0.25rem" }} />
              <label style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: 1.5 }}>
                I agree to the{" "}
                <a href="#" style={{ color: "#38bdf8", textDecoration: "none" }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: "#38bdf8", textDecoration: "none" }}>Privacy Policy</a>
              </label>
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
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            >
              Create Account
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "2rem", color: "#64748b" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
              Sign in
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
              <span>🔍</span> Sign up with Google
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
              <span>📧</span> Sign up with Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}