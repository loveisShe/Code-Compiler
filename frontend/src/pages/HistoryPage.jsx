import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import './HistoryPage.css'

function formatDate(dateStr) {
  if (!dateStr) return 'Recent'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Generate a simple heatmap grid for the past 52 weeks
function buildHeatmapData(submissions) {
  const activityMap = {}
  if (Array.isArray(submissions)) {
    submissions.forEach(sub => {
      if (sub.date) {
        const day = sub.date.split('T')[0]
        activityMap[day] = (activityMap[day] || 0) + 1
      }
    })
  }

  const today = new Date()
  const weeks = []
  // Start from 52 weeks ago, beginning of week (Sunday)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 364)
  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay())

  let d = new Date(startDate)
  while (d <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const iso = d.toISOString().split('T')[0]
      week.push({ date: iso, count: activityMap[iso] || 0, inFuture: d > today })
      d.setDate(d.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function HeatmapCell({ day }) {
  const getColor = (count) => {
    if (count === 0) return '#1a1a2e'
    if (count === 1) return '#1a4731'
    if (count === 2) return '#196e39'
    if (count <= 4) return '#26a641'
    return '#39d353'
  }

  if (day.inFuture) {
    return <div className="heatmap-cell" style={{ background: 'transparent' }} />
  }

  return (
    <div
      className="heatmap-cell"
      style={{ background: getColor(day.count) }}
      title={`${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
    />
  )
}

export default function HistoryPage() {
  const { token } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch('/api/submission/my', { headers })
        if (res && res.ok) {
          const data = await res.json()
          setSubmissions(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.warn('Could not load submissions:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const heatmap = useMemo(() => buildHeatmapData(submissions), [submissions])

  const totalCount = submissions.length
  const activeDays = useMemo(() => {
    const days = new Set(submissions.map(s => s.date?.split('T')[0]).filter(Boolean))
    return days.size
  }, [submissions])

  // Max streak calculation
  const maxStreak = useMemo(() => {
    const days = Array.from(
      new Set(submissions.map(s => s.date?.split('T')[0]).filter(Boolean))
    ).sort()
    let max = 0, cur = 0
    for (let i = 0; i < days.length; i++) {
      if (i === 0) { cur = 1; continue }
      const prev = new Date(days[i - 1])
      const curr = new Date(days[i])
      const diff = (curr - prev) / (1000 * 60 * 60 * 24)
      if (diff === 1) { cur++ } else { cur = 1 }
      max = Math.max(max, cur)
    }
    return max || (days.length > 0 ? 1 : 0)
  }, [submissions])

  const filtered = useMemo(() => {
    return submissions.filter(sub => {
      const matchSearch =
        (sub.problem || '').toLowerCase().includes(search.toLowerCase()) ||
        (sub.topic || '').toLowerCase().includes(search.toLowerCase())
      const matchDiff = diffFilter === 'all' || sub.difficulty === diffFilter
      const matchStatus = statusFilter === 'all' || sub.status === statusFilter
      return matchSearch && matchDiff && matchStatus
    })
  }, [submissions, search, diffFilter, statusFilter])

  const isAccepted = (sub) => String(sub.status).trim().toLowerCase() === 'accepted'

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="analytics-container">

        {/* Page Heading */}
        <section className="history-page-heading">
          <div>
            <p className="eyebrow">YOUR CODING JOURNEY</p>
            <h2>Progress &amp; Activity</h2>
            <p className="page-description">
              Review your daily coding consistency, active streak, and complete problem submission history.
            </p>
          </div>
          <div className="demo-badge">
            <span className="status-dot"></span>
            Active Tracker
          </div>
        </section>

        {/* Heatmap */}
        <section className="activity-section">
          <div className="leetcode-heatmap-card">
            <div className="lc-top-bar">
              <div className="lc-top-left">
                <span className="lc-bold-num">{loading ? '--' : totalCount}</span>
                <span>submissions in the past one year</span>
                <span className="lc-info-circle" title="All recorded problem-solving attempts in the past 12 months">ⓘ</span>
              </div>
              <div className="lc-top-right">
                <span>Total active days: <strong className="lc-bold-num">{loading ? '--' : activeDays}</strong></span>
                <span className="lc-sep">•</span>
                <span>Max streak: <strong className="lc-bold-num">{loading ? '--' : maxStreak}</strong></span>
              </div>
            </div>

            <div className="lc-heatmap-scroll">
              {loading ? (
                <p className="loading-message">Loading activity...</p>
              ) : (
                <div className="heatmap-grid">
                  {heatmap.map((week, wi) => (
                    <div className="heatmap-week" key={wi}>
                      {week.map((day, di) => (
                        <HeatmapCell key={di} day={day} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Submission History */}
        <section className="analytics-card section-card history-section">
          <div className="section-heading history-heading">
            <div>
              <p className="eyebrow">YOUR RECORDS</p>
              <h2>Submission History</h2>
            </div>
            <span className="record-count">{filtered.length} records</span>
          </div>

          <div className="table-controls">
            <input
              type="search"
              placeholder="Search problems or topics..."
              aria-label="Search submissions"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
              aria-label="Filter by difficulty"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Results</option>
              <option value="Accepted">Accepted</option>
              <option value="Wrong Answer">Wrong Answer</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="submission-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Language</th>
                  <th>Result</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading-message">Loading submissions...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="loading-message">
                      {submissions.length === 0
                        ? 'No submissions yet. Start solving problems!'
                        : 'No submissions match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub, i) => {
                    const diff = sub.difficulty?.toLowerCase() || 'easy'
                    const accepted = isAccepted(sub)
                    return (
                      <tr key={sub.id || i}>
                        <td>
                          <Link
                            to={`/problems/${sub.problemId || 1}`}
                            className="problem-link-h"
                          >
                            {sub.problem || 'DSA Problem'}
                          </Link>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '13px' }}>{sub.topic || 'General'}</td>
                        <td>
                          <span className={`badge-diff badge-${diff}`}>
                            {sub.difficulty || 'Easy'}
                          </span>
                        </td>
                        <td><span className="lang-tag">{sub.language || 'Java'}</span></td>
                        <td>
                          {accepted
                            ? <span className="badge-status status-accepted">✓ Accepted</span>
                            : <span className="badge-status status-wrong">✕ Wrong Answer</span>}
                        </td>
                        <td style={{ color: '#64748b', fontSize: '12.5px' }}>{formatDate(sub.date)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="history-page-footer">
          <p>CodeTrack &copy; 2026 | Progress &amp; Analytics</p>
          <Link to="/">Back to Home ↑</Link>
        </footer>
      </main>
    </div>
  )
}

