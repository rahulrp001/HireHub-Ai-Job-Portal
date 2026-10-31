import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../../services'
import { Briefcase, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const STATUS_CONFIG = {
  APPLIED:      { color: 'blue',   label: 'Applied',       icon: Briefcase },
  UNDER_REVIEW: { color: 'yellow', label: 'Under Review',  icon: Clock },
  SHORTLISTED:  { color: 'purple', label: 'Shortlisted',   icon: CheckCircle },
  INTERVIEW:    { color: 'cyan',   label: 'Interview',     icon: AlertCircle },
  SELECTED:     { color: 'green',  label: 'Selected 🎉',   icon: CheckCircle },
  REJECTED:     { color: 'red',    label: 'Rejected',      icon: XCircle },
  WITHDRAWN:    { color: 'gray',   label: 'Withdrawn',     icon: XCircle },
}

const TIMELINE_STEPS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.APPLIED
  const colors = {
    blue: 'bg-blue-50 text-blue-700', yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700', cyan: 'bg-cyan-50 text-cyan-700',
    green: 'bg-green-50 text-green-700', red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-50 text-gray-600',
  }
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[cfg.color]}`}>
      {cfg.label}
    </span>
  )
}

function ApplicationTimeline({ status }) {
  if (status === 'WITHDRAWN' || status === 'REJECTED') return null
  const currentIdx = TIMELINE_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1 mt-3">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
              active ? 'bg-blue-600 ring-2 ring-blue-200 scale-125' :
              done ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-0.5 ${done && i < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState(null)
  const [withdrawing, setWithdrawing] = useState(null)

  useEffect(() => {
    applicationService.getMyApplications()
      .then(({ data }) => setApplications(data.applications || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return
    setWithdrawing(id)
    try {
      await applicationService.withdrawApplication(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a))
    } catch {}
    setWithdrawing(null)
  }

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter)
  const counts = applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track all your job applications in real-time</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(filter === key ? 'ALL' : key)}
            className={`card p-3 text-center cursor-pointer transition-all hover:shadow-md ${filter === key ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="text-xl font-bold text-gray-900">{counts[key] || 0}</div>
            <div className="text-xs text-gray-500 mt-0.5">{cfg.label}</div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
          All ({applications.length})
        </button>
        {Object.entries(STATUS_CONFIG).filter(([k]) => counts[k]).map(([key, cfg]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {cfg.label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No applications found</h3>
          <Link to="/jobs" className="btn-primary inline-block mt-4">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div key={app.id} className="card p-0 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link to={`/jobs/${app.job}`} className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-1">
                        {app.job_detail?.title} <ExternalLink className="h-3 w-3" />
                      </Link>
                      <StatusBadge status={app.status} />
                      {app.ai_match_score && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {Math.round(app.ai_match_score)}% AI Match
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {app.job_detail?.company_detail?.name} • {app.job_detail?.location || 'Remote'} • Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <ApplicationTimeline status={app.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {['APPLIED', 'UNDER_REVIEW'].includes(app.status) && (
                      <button onClick={() => handleWithdraw(app.id)} disabled={withdrawing === app.id}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
                        {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                      </button>
                    )}
                    <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="text-gray-400 hover:text-gray-600 p-1">
                      {expanded === app.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === app.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Job Type</p>
                      <p className="font-medium text-gray-700">{app.job_detail?.job_type?.replace('_', ' ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Work Mode</p>
                      <p className="font-medium text-gray-700">{app.job_detail?.work_mode?.replace('_', ' ') || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Salary Range</p>
                      <p className="font-medium text-gray-700">
                        {app.job_detail?.salary_min ? `₹${Number(app.job_detail.salary_min).toLocaleString()} - ₹${Number(app.job_detail.salary_max).toLocaleString()}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Last Updated</p>
                      <p className="font-medium text-gray-700">{new Date(app.updated_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  {app.cover_letter && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Cover Letter</p>
                      <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">{app.cover_letter}</p>
                    </div>
                  )}
                  {app.job_detail?.required_skills?.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Required Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {app.job_detail.required_skills.map(s => (
                          <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
