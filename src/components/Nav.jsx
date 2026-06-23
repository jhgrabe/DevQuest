import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)

export default function Nav() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand">
        <span className="nav-brand-icon"><TerminalIcon /></span>
        DEVQUEST
      </Link>

      <div className="nav-actions">
        <Link to="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>
          Quests
        </Link>
        {user && (
          <Link to="/profile" className={`nav-link${pathname === '/profile' ? ' active' : ''}`}>
            Profile
          </Link>
        )}
        <button className="nav-btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  )
}
