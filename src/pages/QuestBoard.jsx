import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { getQuests } from '../state/quests'

const DIFFICULTIES = ['All', 'Novice', 'Apprentice', 'Adept', 'Master']

function questShortId(id) {
  const hex = id.replace(/-/g, '')
  return 'Q-' + ((parseInt(hex.slice(-6), 16) % 900) + 100)
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)

export default function QuestBoard() {
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTopic, setActiveTopic] = useState('All')
  const [activeDifficulty, setActiveDifficulty] = useState('All')

  useEffect(() => {
    getQuests()
      .then(setQuests)
      .catch(() => setError('Failed to load quests. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  const topics = ['All', ...new Set(quests.map(q => q.topic).filter(Boolean))]

  const filtered = quests.filter(q => {
    const topicOk = activeTopic === 'All' || q.topic === activeTopic
    const diffOk = activeDifficulty === 'All' || q.difficulty === activeDifficulty
    return topicOk && diffOk
  })

  return (
    <>
      <Nav />
      <div className="page">
        <div className="board-hero">
          <h1>Quest Board</h1>
          <p>Select a challenge to prove your skills.</p>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <div className="filter-row-label">Topics</div>
            <div className="filter-tabs">
              {topics.map(t => (
                <button
                  key={t}
                  className={`filter-tab${activeTopic === t ? ' active' : ''}`}
                  onClick={() => setActiveTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-row-label">Difficulty</div>
            <div className="filter-tabs">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`filter-tab${activeDifficulty === d ? ' active' : ''} diff-${d.toLowerCase()}`}
                  onClick={() => setActiveDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="loading-state">Loading quests…</div>}

        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FilterIcon />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>No quests match your filters.</p>
            <p>
              <button
                className="btn btn-ghost btn-sm mt-12"
                onClick={() => { setActiveTopic('All'); setActiveDifficulty('All') }}
              >
                Clear filters
              </button>
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="quest-list">
            {filtered.map(q => <QuestCard key={q.id} quest={q} />)}
          </div>
        )}
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

function QuestCard({ quest }) {
  const diff = (quest.difficulty ?? '').toLowerCase()
  const shortId = questShortId(quest.id)

  return (
    <Link to={`/quest/${quest.id}`} className="quest-card">
      <div className="quest-card__head">
        <div className="quest-card__title-row">
          <span className="quest-card__status">
            <span className="quest-card__status-dot" />
          </span>
          <span className="quest-card__title">{quest.title}</span>
        </div>
        <span className="quest-card__qid">{shortId}</span>
      </div>

      <div className="quest-card__desc">{quest.description}</div>

      <div className="quest-card__footer">
        <div className="quest-card__chips">
          {quest.topic && <span className="chip chip-topic">{quest.topic}</span>}
          {quest.difficulty && (
            <span className={`chip chip-${diff}`}>{quest.difficulty}</span>
          )}
        </div>
        <span className="quest-card__xp">+{quest.xp_reward} XP</span>
      </div>
    </Link>
  )
}
