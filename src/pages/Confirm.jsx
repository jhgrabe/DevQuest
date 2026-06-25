import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Confirm() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    // supabase-js detects the #access_token hash fragment automatically and fires
    // onAuthStateChange, which updates user in AuthContext. We just wait for it.
    if (!loading) {
      if (user) {
        navigate('/', { replace: true })
      } else {
        setError('Confirmation failed or link has expired. Please register again.')
      }
    }
  }, [user, loading, navigate])

  if (error) {
    return (
      <div className="auth-bg">
        <div className="auth-wordmark">DEVQUEST</div>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1 className="auth-title" style={{ color: 'var(--error)' }}>Confirmation Failed</h1>
          <p className="auth-subtitle" style={{ color: 'var(--text-dim)', marginBottom: 24 }}>{error}</p>
          <Link to="/register" className="btn btn-ghost btn-full">Back to Register</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-wordmark">DEVQUEST</div>
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1 className="auth-title">Confirming…</h1>
        <p className="auth-subtitle">Verifying your account link</p>
      </div>
    </div>
  )
}
