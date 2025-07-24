"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserProfileButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button style={{ background: '#fff', color: '#181e2a', border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem', fontWeight: 600, fontSize: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', cursor: 'pointer' }}>Loading...</button>;
  }

  if (session && session.user) {
    return (
      <button
        onClick={() => signOut()}
        style={{
          width: '100%',
          background: '#fff',
          color: '#181e2a',
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: '0.75rem',
          fontWeight: 600,
          fontSize: 16,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          cursor: 'pointer',
        }}
      >
        {session.user.image && (
          <img src={session.user.image} alt="Profile" width={24} height={24} style={{ borderRadius: '50%', marginRight: 8 }} />
        )}
        {session.user.name || session.user.email}
        <span style={{ marginLeft: 8, color: '#38bdf8', fontWeight: 400, fontSize: 14 }}>(Sign out)</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('google')}
      style={{
        width: '100%',
        background: '#fff',
        color: '#181e2a',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: '0.75rem',
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        cursor: 'pointer',
      }}
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={24} height={24} style={{ marginRight: 8 }} />
      Sign in with Google
    </button>
  );
}
