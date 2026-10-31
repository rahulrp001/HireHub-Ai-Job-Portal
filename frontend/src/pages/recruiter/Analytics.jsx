import { useState, useEffect } from 'react'
import { jobService, applicationService } from '../../services'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { TrendingUp, Users, Briefcase, CheckCircle } from 'lucide-react'

const STATUS_COLORS = {
  APPLIED: '#3b82f6', UNDER_REVIEW: '#f59e0b', SHORTLISTED: '#8b5cf6',
  INTERVIEW: '#06b6d4', SELECTED: '#10b981', REJECTED: '#ef4444', WITHDRAWN: '#6b7280',
}

export default function RecruiterAnalytics() {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([jobService.getMyJobs(), applicationService.getRecruiterApplications()])
      .then(([jobRes, appRes]) => {
        setJobs(jobRes.data.jobs || [])
        setApplications(appRes.data.applications || [])
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  // Applications per job
  const appPerJob = jobs.slice(0, 8).map(j => ({
    name: j.title.length > 18 ? j.title.slice(0, 18) + '…' : j.title,
    applications: applications.filter(a => a.job === j.id).length,
  })).filter(d => d.applications > 0)

  // Status distribution
  const statusDist = Object.entries(
    applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  // AI score distribution
  const scored = applications.filter(a => a.ai_match_score)
  const scoreRanges = [
    { range: '0-25%', count: scored.filter(a => a.ai_match_score < 25).length },
    { range: '25-50%', count: scored.filter(a => a.ai_match_score >= 25 && a.ai_match_score < 50).length },
    { range: '50-75%', count: scored.filter(a => a.ai_match_score >= 50 && a.ai_match_score < 75).length },
    { range: '75-100%', count: scored.filter(a => a.ai_match_score >= 75).length },
  ]

  // Applications over time (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const count = applications.filter(a => {
      const appDate = new Date(a.applied_at)
      return appDate.toDateString() === d.toDateString()
    }).length
    return { date: dateStr, applications: count }
  })

  // Funnel
  const funnel = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'].map(s => ({
    stage: s.replace('_', ' '),
    count: applications.filter(a => a.status === s).length,
  }))

  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((a, b) => a + b.ai_match_score, 0) / scored.length)
    : 0

  const conversionRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'SELECTED').length / applications.length) * 100)
    : 0

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: 'blue' },
    { label: 'Total Applications', value: applications.length, icon: Users, color: 'purple' },
    { label: 'Avg AI Score', value: `${avgScore}%`, icon: TrendingUp, color: 'yellow' },
    { label: 'Conversion Rate', value: `${conversionRate}%`, icon: CheckCircle, color: 'green' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recruitment Analytics</h1>
        <p className="text-gray-500 mt-1">Insights into your hiring pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <div className={`bg-${color}-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications over time */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Applications (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Application Status Distribution</h2>
          {statusDist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {statusDist.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name.replace(' ', '_')] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Applications per job */}
        {appPerJob.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Applications per Job</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appPerJob} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="applications" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Score distribution */}
        {scored.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">AI Match Score Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreRanges}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Candidates" radius={[4, 4, 0, 0]}>
                  {scoreRanges.map((_, i) => (
                    <Cell key={i} fill={['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Hiring funnel */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Hiring Funnel</h2>
        <div className="flex items-end gap-2 justify-center">
          {funnel.map((stage, i) => {
            const maxCount = Math.max(...funnel.map(s => s.count), 1)
            const heightPct = Math.max((stage.count / maxCount) * 100, 8)
            const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500', 'bg-green-500']
            return (
              <div key={stage.stage} className="flex flex-col items-center flex-1">
                <span className="text-sm font-bold text-gray-900 mb-1">{stage.count}</span>
                <div className={`w-full ${colors[i]} rounded-t-lg transition-all`} style={{ height: `${heightPct * 1.5}px` }} />
                <span className="text-xs text-gray-500 mt-2 text-center">{stage.stage}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
