import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
)
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const MailSentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /><line x1="16" y1="2" x2="22" y2="8" />
  </svg>
)

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const result = await register(form.email, form.password, form.username)
    setLoading(false)
    if (result.error) {
      setError(result.error.message || result.error.error_description || 'Registration failed')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-wordmark">DEVQUEST</div>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo-wrap">
            <div className="auth-logo-icon" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
              <MailSentIcon />
            </div>
          </div>
          <h1 className="auth-title" style={{ color: 'var(--success)' }}>Check Your Email</h1>
          <p className="auth-subtitle">Confirmation link dispatched</p>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 24 }}>
            We sent a confirmation link to{' '}
            <strong style={{ color: 'var(--text)' }}>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn btn-ghost btn-full">Back to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-wordmark">DEVQUEST</div>

      <div className="auth-card">
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon"><TerminalIcon /></div>
        </div>

        <h1 className="auth-title">Init Profile</h1>
        <p className="auth-subtitle">DEVQUEST_OS_V2</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <UserIcon />USER_ID
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="syntax_terror"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <MailIcon />SYS_COMMS_LINK
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="dev@localhost.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <KeyIcon />AUTH_KEY
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="alert alert-error mb-16">
              <AlertIcon />{error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            <ArrowRight />
            {loading ? 'Creating account…' : 'Create_Account'}
          </button>
        </form>

        <div className="auth-divider" style={{ marginTop: 20 }} />

        <p className="auth-footer">
          <span className="auth-footer-label">ALREADY_HAVE_ROOT_ACCESS?</span>
          <Link to="/login" className="auth-footer-link">Initiate_Login</Link>
        </p>
      </div>
    </div>
  )
}
