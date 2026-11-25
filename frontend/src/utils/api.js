/**
 * Base API URL: uses Vite proxy (/api) during local dev on port 5173,
 * otherwise falls back to direct backend port 8000 (or VITE_API_URL).
 */
export function getApiBase() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return '/api'
  }
  return 'http://localhost:8000/api'
}

/**
 * Fetch authenticated user's submissions from GET /api/submission
 * and enrich them with question metadata (title, topic, difficulty)
 * from questions.json when matching by problemId.
 */
export async function fetchUserSubmissions(token, questions = []) {
  if (!token) {
    return { ok: false, submissions: [] }
  }

  const res = await fetch(`${getApiBase()}/submission`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    return { ok: false, submissions: [] }
  }

  const data = await res.json()
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.submissions)
      ? data.submissions
      : []

  const questionMap = new Map(
    (Array.isArray(questions) ? questions : []).map((q) => [String(q.id), q])
  )

  const normalized = rawList.map((sub) => {
    const matched = sub.problemId != null ? questionMap.get(String(sub.problemId)) : null
    return {
      ...sub,
      id: sub._id || sub.id,
      problem: sub.problem || matched?.title || (sub.problemId ? `Problem #${sub.problemId}` : 'Code Run'),
      topic: sub.topic || matched?.topic || 'General',
      difficulty: sub.difficulty || matched?.difficulty || 'Easy',
      date: sub.date || sub.createdAt || null,
    }
  })

  return { ok: true, submissions: normalized }
}

/**
 * Calculate consecutive daily submission streak ending today/yesterday.
 */
export function calculateCurrentStreak(submissions) {
  const days = Array.from(
    new Set(
      (Array.isArray(submissions) ? submissions : [])
        .map((s) => (s.date || s.createdAt)?.split('T')[0])
        .filter(Boolean)
    )
  ).sort()

  if (days.length === 0) return 0

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const latestDay = days[days.length - 1]
  if (latestDay !== todayStr && latestDay !== yesterdayStr) {
    return 0
  }

  let streak = 1
  for (let i = days.length - 1; i > 0; i--) {
    const curr = new Date(days[i])
    const prev = new Date(days[i - 1])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}
