// Logo component for Agentic AI
import React from "react";
import Image from "next/image";

export default function Logo({ width = 80, height = 80 }) {
  return (
    <div style={{ 
      width, 
      height, 
      background: 'var(--accent1, #ff6a00)', 
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.2rem',
      fontFamily: 'var(--font-headings)'
    }}>
      AI
    </div>
  );
}
