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
      <div>
        <h1>Confirmation failed</h1>
        <p role="alert" style={{ color: 'red' }}>{error}</p>
        <Link to="/register">Back to register</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>Confirming your account…</h1>
      <p>Please wait.</p>
    </div>
  )
}
