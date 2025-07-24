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
    background: "#181e2a",
    color: "#fff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  const logoStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "1.5rem",
    fontWeight: 800,
    textDecoration: "none",
    color: "#fff"
  };

  const navLinksStyle = {
    display: "flex",
    alignItems: "center",
    gap: "2rem"
  };

  const linkStyle = {
    color: "#d1d5db",
    textDecoration: "none",
    fontWeight: 500,
    transition: "color 0.2s",
    cursor: "pointer"
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: "#38bdf8"
  };

  const buttonStyle = {
    background: "#38bdf8",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "background-color 0.2s"
  };

  return (
    <nav style={navStyle}>
      <Link href="/" style={logoStyle}>
        <span style={{ fontSize: "2rem" }}>🤖</span>
        Agentic AI
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
        <Link href="/login" style={buttonStyle}>
          Login
        </Link>
      </div>
    </nav>
  );
}