import { Link } from 'react-router-dom'

export default function ThankYou() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>♥</div>
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--primary)',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: '0.04em',
        marginBottom: 12,
      }}>
        DONATION_RECEIVED
      </h1>
      <p style={{
        color: 'var(--text-dim)',
        fontSize: 15,
        maxWidth: 380,
        lineHeight: 1.7,
        marginBottom: 32,
      }}>
        Thank you for supporting DevQuest. Your contribution helps keep the servers running and funds new quests for the community.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          background: 'var(--primary)',
          color: '#0f1117',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          padding: '10px 24px',
          borderRadius: 'var(--r)',
          textDecoration: 'none',
          letterSpacing: '0.04em',
        }}
      >
        RETURN_TO_QUESTS
      </Link>
    </div>
  )
}
