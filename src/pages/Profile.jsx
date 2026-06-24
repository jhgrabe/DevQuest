import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { useAuth } from '../state/AuthContext'
import { getProfile, getAllSubmissions } from '../state/profile'
import { RANKS, getRank } from '../data/ranks'
import { createDonationSession } from '../state/donate'

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function questShortId(id) {
  const hex = id.replace(/-/g, '')
  return 'Q-' + ((parseInt(hex.slice(-6), 16) % 900) + 100)
}

const RANK_ICONS = { Novice: '⭐', Apprentice: '🔷', Adept: '🔶', Master: '💎' }

// Icons
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 21 12 17 16 21" /><path d="M5 3H19" /><path d="M5 3C5 3 5 9 12 12C19 9 19 3 19 3" /><line x1="12" y1="17" x2="12" y2="12" />
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.45" />
  </svg>
)

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [donateAmount, setDonateAmount] = useState('5')
  const [donateLoading, setDonateLoading] = useState(false)
  const [donateError, setDonateError] = useState(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [p, subs] = await Promise.all([
          getProfile(user.id),
          getAllSubmissions(user.id),
        ])
        setProfile(p)
        setSubmissions(subs)
      } catch (e) {
        if (e.response?.status === 401) {
          setError('Session expired — please log in again.')
        } else {
          setError('Failed to load profile.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page"><div className="loading-state">Loading profile…</div></div>
      </>
    )
  }

  if (error || !profile) {
    return (
      <>
        <Nav />
        <div className="page">
          <div className="alert alert-error"><AlertIcon />{error ?? 'Profile not found.'}</div>
        </div>
      </>
    )
  }

  const xp = profile.xp ?? 0
  const rank = getRank(xp)
  const rankIdx = RANKS.findIndex(r => r.name === rank.name)
  const nextRank = RANKS[rankIdx + 1] ?? null
  const progressPct = nextRank
    ? Math.min(100, Math.round(((xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100))
    : 100

  async function handleDonate(e) {
    e.preventDefault()
    const cents = Math.round(parseFloat(donateAmount) * 100)
    if (!cents || cents < 100) {
      setDonateError('Minimum donation is $1.00')
      return
    }
    setDonateLoading(true)
    setDonateError(null)
    try {
      const url = await createDonationSession(cents)
      window.location.href = url
    } catch (err) {
      if (err.response?.status === 401) {
        setDonateError('Session expired — please log in again.')
      } else {
        setDonateError('Payment service unavailable — try again shortly.')
      }
      setDonateLoading(false)
    }
  }

  const attempted = new Set(submissions.map(s => s.quest_id)).size
  const passed = new Set(submissions.filter(s => s.status === 'passed').map(s => s.quest_id)).size

  return (
    <>
      <Nav />
      <div className="page" style={{ maxWidth: 560 }}>

        {/* Profile header */}
        <div className="section-card mb-16">
          <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
            <div className="profile-avatar" style={{ margin: '0 auto 16px' }}>
              <span style={{ fontSize: 32 }}>💻</span>
            </div>
            <div className="profile-username">
              @{profile.username}
            </div>
            <div style={{ marginTop: 6, marginBottom: 16 }}>
              <span className={`chip chip-${rank.name.toLowerCase()}`}>
                {RANK_ICONS[rank.name]} {rank.name}
              </span>
            </div>

            {/* XP bar */}
            <div className="xp-bar-row">
              <span className="xp-bar-label">{xp.toLocaleString()} XP</span>
              {nextRank && (
                <span className="xp-bar-label">{nextRank.minXP.toLocaleString()} XP ({nextRank.name})</span>
              )}
            </div>
            <div className="xp-track">
              <div className="xp-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid mb-16">
          <div className="stat-card">
            <CodeIcon />
            <div className="stat-value">{attempted}</div>
            <div className="stat-label">Quests Attempted</div>
          </div>
          <div className="stat-card">
            <CheckIcon />
            <div className="stat-value">{passed}</div>
            <div className="stat-label">Passed</div>
          </div>
        </div>

        {/* Rank Ladder */}
        <div className="section-card mb-16">
          <div className="section-card__header">
            <span className="section-card__title"><TrophyIcon />Rank Ladder</span>
          </div>
          <div style={{ padding: '16px' }}>
            <div className="rank-ladder">
              {RANKS.map((r, i) => {
                const isCurrent = r.name === rank.name
                const isUnlocked = xp >= r.minXP
                return (
                  <div
                    key={r.name}
                    className={`rank-row${isCurrent ? ' rank-row--current' : ''}${!isUnlocked ? ' rank-row--locked' : ''}`}
                  >
                    <span className="rank-row__icon">{RANK_ICONS[r.name]}</span>
                    <span className="rank-row__name">{r.name}</span>
                    {isCurrent ? (
                      <span className="rank-row__badge">Current</span>
                    ) : isUnlocked ? (
                      <span className="rank-row__xp mono" style={{ color: 'var(--success)', fontSize: 11 }}>✓</span>
                    ) : (
                      <span className="rank-row__lock"><LockIcon /></span>
                    )}
                    <span className="rank-row__xp">{r.minXP.toLocaleString()} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="section-card">
          <div className="section-card__header">
            <span className="section-card__title"><HistoryIcon />Recent Submissions</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              {submissions.length}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No submissions yet. <Link to="/">Start a quest!</Link>
            </div>
          ) : (
            <div style={{ padding: '0 20px' }}>
              {submissions.map(sub => (
                <div key={sub.id} className="sub-table-row">
                  <div className="sub-table-quest">
                    <div className="sub-table-quest-id">{questShortId(sub.quest_id)}</div>
                    <div className="sub-table-quest-title">
                      {sub.quests?.title ?? 'Unknown Quest'}
                    </div>
                  </div>
                  <div className="sub-table-status">
                    <span className={`status-dot status-dot-${sub.status}`}>{sub.status}</span>
                  </div>
                  <div className="sub-table-time">{timeAgo(sub.created_at)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Support card */}
        <div className="section-card mt-16" style={{ marginTop: 16 }}>
          <div className="section-card__header">
            <span className="section-card__title">♥ Support DevQuest</span>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
              DevQuest is free to play. If you've found it useful, consider buying us a coffee to help keep the servers running and fund new quests.
            </p>
            <form onSubmit={handleDonate} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: '0 0 auto' }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-dim)', fontSize: 14, pointerEvents: 'none',
                }}>$</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={donateAmount}
                  onChange={e => { setDonateAmount(e.target.value); setDonateError(null) }}
                  style={{
                    width: 80, paddingLeft: 22, paddingRight: 8, paddingTop: 8, paddingBottom: 8,
                    background: 'var(--surface-high)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r)', color: 'var(--text)', fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={donateLoading}
                style={{
                  background: 'var(--primary)', color: '#0f1117',
                  border: 'none', borderRadius: 'var(--r)',
                  padding: '8px 16px', fontWeight: 700, fontSize: 13,
                  cursor: donateLoading ? 'not-allowed' : 'pointer',
                  opacity: donateLoading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {donateLoading ? 'Redirecting…' : 'Donate via Stripe'}
              </button>
            </form>
            {donateError && (
              <p style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>{donateError}</p>
            )}
          </div>
        </div>

      </div>

      <footer className="site-footer">
        © 2024 DEVQUEST_OS // ROOT_ACCESS_GRANTED
        <div className="site-footer__links">
          <a href="#">Documentation</a>
          <a href="#">System Status</a>
          <a href="#">API</a>
        </div>
      </footer>
    </>
  )
}
