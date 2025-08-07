"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ModernNavigation from "../components/ModernNavigation";
import Footer from "../components/Footer";

interface Agent {
  id: string;
  display_name?: string;
  name: string;
  description: string;
  rag_architecture?: string;
}

export default function ChatV2Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default agent or first available agent
    const redirectToDefaultAgent = async () => {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          const agentsArray = Array.isArray(data) ? data : data.agents || [];
          
          if (agentsArray.length > 0) {
            // Use the first available agent as default
            const defaultAgentId = agentsArray[0].id;
            router.replace(`/chat/${defaultAgentId}`);
          } else {
            // No agents available, redirect to create agent page
            router.replace("/create-agent");
          }
        } else {
          // API error, try with default ID "1"
          router.replace("/chat/1");
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        // Fallback to default agent ID "1"
        router.replace("/chat/1");
      }
    };

    redirectToDefaultAgent();
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="chat-container">
      <ModernNavigation />
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ 
          fontSize: "2rem", 
          marginBottom: "1rem" 
        }}>
          🤖
        </div>
        <h2 style={{ 
          color: "var(--color-text-primary)", 
          marginBottom: "0.5rem" 
        }}>
          Loading Chat...
        </h2>
        <p style={{ 
          color: "var(--color-text-secondary)",
          fontSize: "0.875rem"
        }}>
          Redirecting to your chat session
        </p>
        <div style={{
          width: "24px",
          height: "24px",
          border: "3px solid #f3f3f3",
          borderTop: "3px solid var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
      <Footer />
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
