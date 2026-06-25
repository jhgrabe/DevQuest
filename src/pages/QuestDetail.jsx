import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import Nav from '../components/Nav'
import { getQuest } from '../state/quests'
import {
  createSubmission,
  getSubmissions,
  updateSubmission,
  deleteSubmission,
  executeSubmission,
  getHint,
} from '../state/submissions'

const LANG_LABEL = { 71: 'Python', 63: 'JavaScript' }

function questShortId(id) {
  const hex = id.replace(/-/g, '')
  return 'Q-' + ((parseInt(hex.slice(-6), 16) % 900) + 100)
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// Icons
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)
const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
)
const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const CheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const XCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)
const CheckSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)
const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.45" />
  </svg>
)
const ObjectiveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)

export default function QuestDetail() {
  const { id: questId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quest, setQuest] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [code, setCode] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [result, setResult] = useState(null)
  const [hint, setHint] = useState(null)
  const [hintError, setHintError] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [lastHintContext, setLastHintContext] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [q, subs] = await Promise.all([getQuest(questId), getSubmissions(questId)])
        if (!q) { setLoadError('Quest not found.'); return }
        setQuest(q)
        setCode(q.starter_code ?? '')
        setSubmissions(subs)
      } catch (e) {
        if (e.response?.status === 401) {
          navigate('/login', { replace: true })
          return
        }
        setLoadError('Failed to load quest.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [questId])

  // Combine preamble + user code before sending to the judge
  function fullCode() {
    return quest.preamble ? `${quest.preamble}\n${code}` : code
  }

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  async function fetchHint({ subId, questId: qId, sourceCode, stderr }) {
    setHintLoading(true)
    setHintError(false)
    setHint(null)
    try {
      const h = await getHint(subId, qId, sourceCode, stderr)
      setHint(h)
    } catch {
      setHintError(true)
    } finally {
      setHintLoading(false)
    }
  }

  async function handleSubmit(refine = false) {
    setSubmitting(true)
    setSubmitError(null)
    setResult(null)
    setHint(null)
    setHintError(false)
    setLastHintContext(null)
    try {
      let subId
      if (editingId) {
        await updateSubmission(editingId, { sourceCode: code })
        subId = editingId
      } else {
        const sub = await createSubmission({
          userId: user.id,
          questId,
          sourceCode: code,
          languageId: quest.language_id,
        })
        subId = sub.id
      }

      const res = await executeSubmission(questId, subId, fullCode(), refine)
      setResult(res)
      setEditingId(null)

      if (res.passed) {
        showToast(res.xp_awarded > 0
          ? { title: 'Quest Complete!', sub: `+${res.xp_awarded} XP awarded` }
          : { title: 'Quest Passed!', sub: 'Skills refined' }
        )
      }

      const subs = await getSubmissions(questId)
      setSubmissions(subs)

      if (!res.passed) {
        const firstFailed = res.results?.find(r => !r.passed)
        const ctx = { subId, questId, sourceCode: fullCode(), stderr: firstFailed?.stderr ?? '' }
        setLastHintContext(ctx)
        await fetchHint(ctx)
      }
    } catch (e) {
      if (e.response?.status === 401) {
        navigate('/login', { replace: true })
        return
      } else if (e.response?.status === 502) {
        setSubmitError('Judge is busy — please retry.')
      } else if (e.response?.status === 422) {
        setSubmitError('Compile error — check the output below.')
      } else {
        setSubmitError('Submission failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditSub(sub) {
    setCode(sub.source_code)
    setEditingId(sub.id)
    setResult(null)
    setHint(null)
    setHintError(false)
    setLastHintContext(null)
    setSubmitError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleNewAttempt() {
    setCode(quest?.starter_code ?? '')
    setEditingId(null)
    setResult(null)
    setHint(null)
    setHintError(false)
    setLastHintContext(null)
    setSubmitError(null)
  }

  async function handleDelete(id) {
    try {
      await deleteSubmission(id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (editingId === id) handleNewAttempt()
    } catch {
      setSubmitError('Delete failed.')
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page"><div className="loading-state">Loading quest…</div></div>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        <Nav />
        <div className="page">
          <div className="alert alert-error"><AlertIcon />{loadError}</div>
        </div>
      </>
    )
  }

  const diff = (quest.difficulty ?? '').toLowerCase()
  const shortId = questShortId(quest.id)
  const hasCompleted = submissions.some(s => s.status === 'passed')
  const editingAttemptNum = editingId
    ? submissions.length - submissions.findIndex(s => s.id === editingId)
    : null

  return (
    <>
      <Nav />
      <div className="page" style={{ maxWidth: 720 }}>
        <Link to="/" className="quest-back">
          <ArrowLeft /> Back to quests
        </Link>

        {/* Hero */}
        <div className="quest-hero">
          <div className="quest-hero__top">
            <h1 className="quest-hero__title">{quest.title}</h1>
            <span className="quest-hero__qid">{shortId}</span>
          </div>
          <div className="quest-hero__meta">
            {quest.difficulty && <span className={`chip chip-${diff}`}>{quest.difficulty}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)' }}>
              +{quest.xp_reward} XP
            </span>
            {quest.estimated_minutes && (
              <span className="quest-hero__time">
                <ClockIcon /> ~{quest.estimated_minutes}m
              </span>
            )}
            {hasCompleted && (
              <span className="quest-hero__completed">
                <CheckSmall /> Completed
              </span>
            )}
          </div>
        </div>

        {/* Objective */}
        <div className="section-card">
          <div className="section-card__header">
            <span className="section-card__title"><ObjectiveIcon />Objective</span>
          </div>
          <div className="section-card__body">
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.7 }}>
              {quest.description}
            </p>
          </div>
        </div>

        {/* Editor */}
        <div className="section-card">
          {editingId && (
            <div className="editor-editing-banner">
              <span>Editing Attempt #{editingAttemptNum}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleNewAttempt}>New attempt</button>
            </div>
          )}
          <div className="editor-header">
            <span className="editor-lang-badge">{LANG_LABEL[quest.language_id] ?? quest.language_id}</span>
            <div className="editor-toolbar">
              <button className="editor-toolbar-btn" title="Reset to starter code" onClick={handleNewAttempt}>
                <RefreshIcon />
              </button>
            </div>
          </div>
          {quest.preamble && (
            <div className="editor-preamble">
              <pre>{quest.preamble.trimEnd()}</pre>
            </div>
          )}
          <textarea
            className="editor-textarea"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const start = e.target.selectionStart
                const end = e.target.selectionEnd
                const spaces = '    '
                const next = code.slice(0, start) + spaces + code.slice(end)
                setCode(next)
                requestAnimationFrame(() => {
                  e.target.selectionStart = e.target.selectionEnd = start + spaces.length
                })
              }
            }}
            rows={14}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <div className="editor-submit">
            {submitError && (
              <div className="alert alert-error mb-16">
                <AlertIcon />
                <span>
                  {submitError}
                  {submitError.includes('busy') && (
                    <> — <button
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                      onClick={handleSubmit}
                    >retry</button></>
                  )}
                </span>
              </div>
            )}
            {hasCompleted && !editingId ? (
              <button
                className="btn btn-refine btn-full"
                onClick={() => handleSubmit(true)}
                disabled={submitting || !code.trim()}
              >
                <RefreshIcon />
                {submitting ? 'Running…' : `Refine your skills (+${Math.floor(quest.xp_reward * 0.25)} XP)`}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-full"
                onClick={() => handleSubmit(false)}
                disabled={submitting || !code.trim()}
              >
                <PlayIcon />
                {submitting ? 'Running…' : editingId ? 'Update & Run' : 'Submit Code'}
              </button>
            )}
          </div>
        </div>

        {/* Execution Output */}
        <div className="section-card">
          <div className="section-card__header">
            <span className="section-card__title"><TerminalIcon />Execution Output</span>
          </div>

          {!result && !submitting && (
            <div className="exec-idle">
              <div className="exec-idle-icon"><CodeIcon /></div>
              <p>Submit your code to see results.</p>
              <p className="exec-waiting">Waiting for execution…</p>
            </div>
          )}

          {submitting && !result && (
            <div className="exec-idle">
              <div className="exec-idle-icon" style={{ borderColor: 'rgba(34,211,238,0.3)' }}>
                <TerminalIcon />
              </div>
              <p style={{ color: 'var(--primary)' }}>Running against test cases…</p>
            </div>
          )}

          {result && (
            <>
              {result.passed ? (
                <div className="exec-pass-banner">
                  <CheckCircle />
                  <div>
                    <strong>Quest Passed!</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                      All test cases passed
                    </div>
                  </div>
                  {result.xp_awarded > 0 && (
                    <span className="xp-pill">+{result.xp_awarded} XP</span>
                  )}
                </div>
              ) : (
                <div className="exec-fail-banner">
                  <XCircle />
                  <strong>Execution Failed</strong>
                </div>
              )}

              <div className="test-results">
                {result.results?.map((r, i) => (
                  <div key={i} className={`test-item test-item--${r.passed ? 'pass' : 'fail'}`}>
                    <div className="test-item__icon">
                      {r.passed ? <CheckSmall /> : <XCircle />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="test-item__label">Test {i + 1}</div>
                      {!r.passed && (
                        <pre>{`expected: ${r.expected?.trim() || '(empty)'}\ngot:      ${r.stdout?.trim() || '(no output)'}${r.stderr ? `\nstderr:   ${r.stderr.trim()}` : ''}`}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* AI Hint */}
        {(result && !result.passed) && (
          <div className="section-card">
            <div className="section-card__header">
              <span className="section-card__title"><SparkleIcon />AI Analysis</span>
            </div>
            {hintLoading ? (
              <div className="hint-body">
                <div className="hint-ai-icon"><SparkleIcon /></div>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Analysing your code…</span>
              </div>
            ) : hint ? (
              <div className="hint-body">
                <div className="hint-ai-icon"><SparkleIcon /></div>
                <p className="hint-text">{hint}</p>
              </div>
            ) : hintError ? (
              <div className="hint-body">
                <div className="hint-ai-icon"><SparkleIcon /></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10 }}>Hint service unavailable — Gemini may be busy.</p>
                {lastHintContext && (
                  <button
                    onClick={() => fetchHint(lastHintContext)}
                    style={{
                      background: 'none', border: '1px solid var(--border)',
                      borderRadius: 'var(--r)', padding: '4px 10px',
                      color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <RefreshIcon style={{ width: 12, height: 12 }} /> Retry hint
                  </button>
                )}
              </div>
            ) : (
              <div className="hint-body">
                <div className="hint-ai-icon"><SparkleIcon /></div>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Submit your code to get an AI hint on failure.</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="section-card">
          <div className="section-card__header">
            <span className="section-card__title"><HistoryIcon />History</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              {submissions.length} attempt{submissions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="exec-idle" style={{ padding: '32px 24px' }}>
              <p>No previous submissions.</p>
            </div>
          ) : (
            <div className="history-list">
              {submissions.map((sub, i) => (
                <div key={sub.id} className="history-item">
                  <div className="history-item__left">
                    <span className="history-item__attempt">
                      Attempt #{submissions.length - i}
                    </span>
                    <span className={`status-dot status-dot-${sub.status}`}>{sub.status}</span>
                    <span className="history-item__time">{timeAgo(sub.created_at)}</span>
                  </div>
                  <div className="history-item__actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEditSub(sub)}
                    >
                      Resubmit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(sub.id)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="site-footer">
        © 2026 DEVQUEST_OS // ROOT_ACCESS_GRANTED
        <div className="site-footer__links">
          <a href="#">Documentation</a>
          <a href="#">System Status</a>
          <a href="#">API</a>
        </div>
      </footer>

      {toast && (
        <div className="toast">
          <CheckCircle />
          <div>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-sub">{toast.sub}</div>
          </div>
        </div>
      )}
    </>
  )
}
