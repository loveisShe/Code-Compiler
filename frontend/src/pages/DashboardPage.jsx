import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import './DashboardPage.css'

const DEFAULT_DATA = {
  user: { id: 1, name: 'Shally', username: 'loveislearning' },
  stats: { totalSolved: 8, totalSubmissions: 12, acceptanceRate: 67, dailyStreak: 2 },
  difficultyCounts: { Easy: 5, Medium: 3, Hard: 0 },
  difficultyTotals: { Easy: 6, Medium: 4, Hard: 3 },
}

function DifficultyBar({ label, colorClass, solved, total }) {
  const [width, setWidth] = useState(0)
  const percentage = total > 0 ? Math.min(Math.round((solved / total) * 100), 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 60)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="diff-row">
      <div className="diff-header">
        <span className={`diff-label-${label.toLowerCase()}`}>{label}</span>
        <span className="diff-count">{solved} solved</span>
      </div>
      <div
        className="diff-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-label={`${label} difficulty progress: ${solved} of ${total}`}
      >
        <div
          className={`diff-fill diff-fill-${label.toLowerCase()}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user: authUser, token } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      let submissions = []
      let questions = []

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const [subRes, qRes] = await Promise.all([
          fetch('/api/submission/my', { headers }).catch(() => null),
          fetch('/data/questions.json').catch(() => null),
        ])
        if (subRes && subRes.ok) submissions = await subRes.json()
        if (qRes && qRes.ok) questions = await qRes.json()
      } catch (err) {
        console.warn('Using default data:', err)
      }

      // Compute stats from submissions
      const accepted = Array.isArray(submissions)
        ? submissions.filter(s => String(s.status).trim().toLowerCase() === 'accepted')
        : []
      const solvedNames = new Set(accepted.map(s => s.problem))

      const totalSolved = solvedNames.size || DEFAULT_DATA.stats.totalSolved
      const totalSubs = submissions.length || DEFAULT_DATA.stats.totalSubmissions
      const acceptRate = totalSubs > 0
        ? Math.round((accepted.length / totalSubs) * 100)
        : DEFAULT_DATA.stats.acceptanceRate

      // Difficulty totals from questions
      const diffTotal = { Easy: 0, Medium: 0, Hard: 0 }
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach(q => {
          const d = q.difficulty ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1).toLowerCase() : 'Easy'
          if (diffTotal[d] !== undefined) diffTotal[d]++
        })
      } else {
        Object.assign(diffTotal, DEFAULT_DATA.difficultyTotals)
      }

      // Difficulty solved
      const diffSolved = { Easy: 0, Medium: 0, Hard: 0 }
      if (accepted.length > 0) {
        const seen = new Set()
        accepted.forEach(sub => {
          if (!seen.has(sub.problem)) {
            seen.add(sub.problem)
            const d = sub.difficulty
              ? sub.difficulty.charAt(0).toUpperCase() + sub.difficulty.slice(1).toLowerCase()
              : 'Easy'
            if (diffSolved[d] !== undefined) diffSolved[d]++
          }
        })
      } else {
        Object.assign(diffSolved, DEFAULT_DATA.difficultyCounts)
      }

      setData({
        user: DEFAULT_DATA.user,
        totalSolved,
        totalSubs,
        acceptRate,
        streak: DEFAULT_DATA.stats.dailyStreak,
        diffSolved,
        diffTotal,
      })
    }
    load()
  }, [])

  if (!data) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content-area" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-area">
        <main className="dashboard-container">
          {/* Header */}
          <header className="dashboard-page-header">
            <p className="journey-eyebrow">YOUR CODING JOURNEY</p>
            <h1 className="journey-title">Welcome back, {authUser?.name || data.user.name}! 👋</h1>
            <p className="journey-subtitle">Keep solving. Keep growing.</p>
          </header>

          {/* Stats Card */}
          <section className="journey-card" aria-label="User Coding Journey">
            <div className="stats-grid-2x2">
              {/* Problems Solved */}
              <article className="stat-item-box">
                <div className="stat-top-row">
                  <span className="stat-icon-wrapper icon-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  </span>
                  <span className="stat-title">Problems Solved</span>
                </div>
                <span className="stat-number">{data.totalSolved}</span>
              </article>

              {/* Submissions */}
              <article className="stat-item-box">
                <div className="stat-top-row">
                  <span className="stat-icon-wrapper icon-code-tag" aria-hidden="true">&lt;/&gt;</span>
                  <span className="stat-title">Submissions</span>
                </div>
                <span className="stat-number">{data.totalSubs}</span>
              </article>

              {/* Acceptance Rate */}
              <article className="stat-item-box">
                <div className="stat-top-row">
                  <span className="stat-icon-wrapper icon-trend" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </span>
                  <span className="stat-title">Acceptance Rate</span>
                </div>
                <span className="stat-number">{data.acceptRate}%</span>
              </article>

              {/* Streak */}
              <article className="stat-item-box">
                <div className="stat-top-row">
                  <span className="stat-icon-wrapper icon-streak" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 23c-4.97 0-9-3.8-9-8.5 0-3.3 2.1-6.1 3.5-7.5.3-.3.8-.1.8.3.1 1.7 1.1 3.2 2.7 3.7.4.1.8-.2.8-.6 0-2.3 1.3-4.5 3-5.8.3-.2.8 0 .8.4.1 2.3 1.7 4.3 3.9 4.8.4.1.8-.2.8-.6 0-1.1.4-2.1 1-2.9.2-.3.7-.2.8.2 1.1 2.3 1.7 4.9 1.7 6.5 0 4.7-4.03 8.5-9 8.5z" />
                    </svg>
                  </span>
                  <span className="stat-title">Current Streak</span>
                </div>
                <span className="stat-number">{data.streak} days</span>
              </article>
            </div>

            {/* Difficulty Progress */}
            <div className="difficulty-card-box">
              <h2 className="difficulty-card-heading">Difficulty Progress</h2>
              <div className="difficulty-bars-container">
                {['Easy', 'Medium', 'Hard'].map(diff => (
                  <DifficultyBar
                    key={diff}
                    label={diff}
                    solved={data.diffSolved[diff]}
                    total={data.diffTotal[diff]}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-strip" aria-label="Quick Actions">
            <Link to="/problems" className="action-card-btn">
              <span className="action-btn-icon">⚡ Browse All Problems</span>
              <span className="action-arrow">→</span>
            </Link>
            <Link to="/problems" className="action-card-btn">
              <span className="action-btn-icon">💻 Practice Challenges</span>
              <span className="action-arrow">→</span>
            </Link>
            <Link to="/history" className="action-card-btn">
              <span className="action-btn-icon">📊 Detailed Analytics &amp; Charts</span>
              <span className="action-arrow">→</span>
            </Link>
          </section>
        </main>
      </div>
    </div>
  )
}

