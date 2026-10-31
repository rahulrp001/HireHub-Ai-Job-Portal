import { useState, useEffect } from 'react'
import { applicationService, jobService } from '../../services'
import { Users, ChevronDown, CheckCircle, XCircle, Clock, Star, Filter } from 'lucide-react'

const STATUS_OPTIONS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']
const STATUS_COLORS = {
  APPLIED: 'bg-blue-50 text-blue-700', UNDER_REVIEW: 'bg-yellow-50 text-yellow-700',
  SHORTLISTED: 'bg-purple-50 text-purple-700', INTERVIEW: 'bg-cyan-50 text-cyan-700',
  SELECTED: 'bg-green-50 text-green-700', REJECTED: 'bg-red-50 text-red-700',
  WITHDRAWN: 'bg-gray-50 text-gray-600',
}

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [sortBy, setSortBy] = useState('ai_score')

  useEffect(() => {
    Promise.all([
      applicationService.getRecruiterApplications(),
      jobService.getMyJobs(),
    ]).then(([appRes, jobRes]) => {
      setApplications(appRes.data.applications || [])
      setJobs(jobRes.data.jobs || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, newStatus) => {
    setUpdating(id)
    try {
      await applicationService.updateStatus(id, { status: newStatus })
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } catch {}
    setUpdating(null)
  }

  const filtered = applications
    .filter(a => (!selectedJob || a.job === parseInt(selectedJob)) && (!statusFilter || a.status === statusFilter))
    .sort((a, b) => {
      if (sortBy === 'ai_score') return (b.ai_match_score || 0) - (a.ai_match_score || 0)
      if (sortBy === 'date') return new Date(b.applied_at) - new Date(a.applied_at)
      return 0
    })

  const stats = STATUS_OPTIONS.reduce((acc, s) => { acc[s] = applications.filter(a => a.status === s).length; return acc }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-500 mt-1">AI-ranked candidates for your jobs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className="card p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{stats[s] || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="input-field w-auto text-sm" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
            <option value="">All Jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <select className="input-field w-auto text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input-field w-auto text-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="ai_score">Sort: AI Score</option>
          <option value="date">Sort: Latest First</option>
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} candidates</span>
      </div>

      {/* Applications table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Candidate</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Job</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">AI Score</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Applied</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
                          {app.candidate_detail?.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{app.candidate_detail?.full_name}</p>
                          <p className="text-xs text-gray-400">{app.candidate_detail?.email}</p>
                        </div>
                        {idx === 0 && sortBy === 'ai_score' && (
                          <span className="bg-yellow-50 text-yellow-700 text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5" /> Top
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.job_detail?.title}</td>
                    <td className="px-4 py-3">
                      {app.ai_match_score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${app.ai_match_score >= 75 ? 'bg-green-500' : app.ai_match_score >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                              style={{ width: `${app.ai_match_score}%` }} />
                          </div>
                          <span className="font-medium text-gray-900">{Math.round(app.ai_match_score)}%</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(app.applied_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select value={app.status} disabled={updating === app.id || app.status === 'WITHDRAWN'}
                          onChange={e => updateStatus(app.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
