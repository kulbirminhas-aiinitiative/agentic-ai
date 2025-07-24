"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Navigation() {
  const pathname = usePathname();

  const navStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    backgroundColor: "var(--color-surface-elevated)",
    borderBottom: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-sm)",
    position: "sticky" as const,
    top: 0,
    zIndex: 50
  };

  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1.5rem",
    fontWeight: 800,
    textDecoration: "none",
    color: "var(--color-text-primary)",
    transition: "color 0.2s ease"
  };

  const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "2rem"
  };

  const linkStyle = {
    color: "var(--color-text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    transition: "color 0.2s ease",
    cursor: "pointer",
    padding: "0.5rem 0"
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "var(--color-primary)",
    fontWeight: 600
  };

  const buttonStyle = {
    backgroundColor: "var(--color-primary)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "var(--radius-md)",
    border: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
    display: "inline-flex" as const,
    alignItems: "center"
  };

  return (
    <nav style={navStyle}>
      <Link href="/" style={logoStyle}>
        <span style={{ fontSize: "2rem" }}>🤖</span>
        <span>Agentic AI</span>
      </Link>
      
      <div style={navLinksStyle}>
        <Link href="/" style={pathname === "/" ? activeLinkStyle : linkStyle}>
          Home
        </Link>
        <Link href="/agents" style={pathname === "/agents" ? activeLinkStyle : linkStyle}>
          Agents
        </Link>
        <Link href="/about" style={pathname === "/about" ? activeLinkStyle : linkStyle}>
          About
        </Link>
        <Link 
          href="/login" 
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Login
        </Link>
      </div>
    </nav>
  );
}