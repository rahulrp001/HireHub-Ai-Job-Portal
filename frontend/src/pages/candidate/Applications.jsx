import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { applicationService } from '../../services'
import {
  Briefcase, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Sparkles, MapPin,
  Calendar, Building2, TrendingUp, FileText, RotateCcw,
  Video, Mail
} from 'lucide-react'

const STATUS_CONFIG = {
  APPLIED:      { label: 'Applied',       bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  UNDER_REVIEW: { label: 'Under Review',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500'  },
  SHORTLISTED:  { label: 'Shortlisted',   bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  INTERVIEW:    { label: 'Interview',     bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-200',   dot: 'bg-cyan-500'   },
  SELECTED:     { label: 'Selected 🎉',   bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500'},
  REJECTED:     { label: 'Rejected',      bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-400'    },
  WITHDRAWN:    { label: 'Withdrawn',     bg: 'bg-slate-50',  text: 'text-slate-500',  border: 'border-slate-200',  dot: 'bg-slate-400'  },
}

const TIMELINE = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED']

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.APPLIED
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function Timeline({ status }) {
  if (status === 'WITHDRAWN' || status === 'REJECTED') return null
  const cur = TIMELINE.indexOf(status)
  return (
    <div className="flex items-center gap-0 mt-3">
      {TIMELINE.map((step, i) => {
        const done = i <= cur
        const active = i === cur
        const label = step.replace('_', ' ')
        return (
          <div key={step} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                active ? 'border-[#275df5] bg-[#275df5] scale-125 shadow-md shadow-blue-200' :
                done   ? 'border-[#275df5] bg-[#275df5]' :
                         'border-slate-300 bg-white'
              }`} />
              <span className={`text-[9px] mt-1 font-medium whitespace-nowrap hidden sm:block ${
                active ? 'text-[#275df5]' : done ? 'text-slate-500' : 'text-slate-300'
              }`}>{label}</span>
            </div>
            {i < TIMELINE.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-3 sm:mb-4 ${i < cur ? 'bg-[#275df5]' : 'bg-slate-200'}`} />
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
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState(null)
  const [withdrawing, setWithdrawing] = useState(null)
  const pollRef = useRef(null)

  const load = () => {
    setError('')
    applicationService.getMyApplications()
      .then(({ data }) => {
        const list = data.applications || data.results || data || []
        setApplications(Array.isArray(list) ? list : [])
      })
      .catch((err) => {
        console.error('Applications fetch error:', err?.response?.data || err.message)
        setError('Failed to load applications. Please try again.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return
    setWithdrawing(id)
    try {
      await applicationService.withdrawApplication(id)
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'WITHDRAWN' } : a))
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not withdraw. Please try again.')
    }
    setWithdrawing(null)
  }

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})

  const filtered = filter === 'ALL' ? applications : applications.filter(a => a.status === filter)

  const statCards = [
    { key: 'ALL',         label: 'Total',       value: applications.length,          color: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200'   },
    { key: 'APPLIED',     label: 'Applied',      value: counts.APPLIED || 0,          color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-100'     },
    { key: 'UNDER_REVIEW',label: 'In Review',    value: counts.UNDER_REVIEW || 0,     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100'   },
    { key: 'SHORTLISTED', label: 'Shortlisted',  value: counts.SHORTLISTED || 0,      color: 'text-purple-600',  bg: 'bg-purple-50 border-purple-100' },
    { key: 'INTERVIEW',   label: 'Interview',    value: counts.INTERVIEW || 0,        color: 'text-cyan-600',    bg: 'bg-cyan-50 border-cyan-100'     },
    { key: 'SELECTED',    label: 'Selected',     value: counts.SELECTED || 0,         color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100'},
  ]

  // Loading
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#275df5] border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#275df5] rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Real-time Tracking
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">My Applications</h1>
              <p className="text-blue-100/80 text-xs md:text-sm mt-0.5">
                Track all your job applications in one place
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-[#275df5] rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{applications.length}</p>
              <p className="text-xs text-blue-200">Total Applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {statCards.map(({ key, label, value, color, bg }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`bg-white rounded-2xl border p-4 text-center transition-all hover:shadow-md ${bg} ${
              filter === key ? 'ring-2 ring-[#275df5] shadow-md' : ''
            }`}>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-800">
            <RotateCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              filter === 'ALL' ? 'bg-[#275df5] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            All ({applications.length})
          </button>
          {Object.entries(STATUS_CONFIG).filter(([k]) => counts[k]).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === key ? 'bg-[#275df5] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {cfg.label} ({counts[key]})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-[#275df5]" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            {filter === 'ALL' ? 'No applications yet' : `No ${STATUS_CONFIG[filter]?.label} applications`}
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'ALL' ? 'Start applying to jobs to track them here' : 'Try a different filter'}
          </p>
          {filter === 'ALL' && (
            <Link to="/jobs"
              className="mt-5 inline-flex items-center gap-2 bg-[#275df5] hover:bg-[#1a4fd8] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
              Browse Jobs <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {/* Applications List */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((app) => {
            const job = app.job_detail || {}
            const company = job.company_detail || {}
            const isExpanded = expanded === app.id
            const canWithdraw = ['APPLIED', 'UNDER_REVIEW'].includes(app.status)

            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Company logo + info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 bg-[#f0f4ff] text-[#275df5] font-black text-base rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                        {(company.name || job.title || 'J')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {job.title || `Job #${app.job}`}
                          </h3>
                          <StatusBadge status={app.status} />
                          {app.ai_match_score != null && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#275df5] bg-[#f0f4ff] border border-blue-100 px-2 py-0.5 rounded-full">
                              <TrendingUp className="h-2.5 w-2.5" /> {Math.round(app.ai_match_score)}% Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {company.name && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Building2 className="h-3 w-3" /> {company.name}
                            </span>
                          )}
                          {job.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3" /> {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <Timeline status={app.status} />

                        {/* 1. Job Offer Confirmed Banner */}
                        {app.status === 'SELECTED' && (
                          <div className="mt-3.5 p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 shadow-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-emerald-900">
                                  🎉 Job Confirmed! You have been Selected
                                </p>
                                <p className="text-[11px] text-emerald-700">
                                  Official confirmation email dispatched to your inbox. The HR operations team will share your appointment letter.
                                </p>
                              </div>
                            </div>
                            {app.interview_notes && (
                              <div className="text-[11px] bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                                <b>Manager Note:</b> {app.interview_notes}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Interview Scheduled Details Card */}
                        {(app.status === 'INTERVIEW' || app.interview_date) && app.status !== 'SELECTED' && (
                          <div className="mt-3.5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 border shadow-2xs ${
                                  app.interview_mode === 'VIRTUAL' 
                                    ? 'bg-blue-100 text-blue-700 border-blue-300' 
                                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                }`}>
                                  {app.interview_mode === 'VIRTUAL' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                  {app.interview_mode === 'VIRTUAL' ? 'Virtual (Online Video Call)' : 'Offline (In-Person / Office)'}
                                </span>
                                {app.interview_round && (
                                  <span className="text-xs font-bold text-slate-800">
                                    • {app.interview_round}
                                  </span>
                                )}
                              </div>

                              {app.interview_date && (
                                <span className="text-xs font-bold text-blue-900 bg-white px-3 py-1 rounded-xl border border-blue-200 shadow-2xs">
                                  📅 {new Date(app.interview_date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-blue-100 text-xs">
                              <div className="flex items-center gap-1.5 text-slate-700 min-w-0">
                                <span className="font-bold text-slate-500 shrink-0">
                                  {app.interview_mode === 'VIRTUAL' ? 'Meeting Link:' : 'Venue / Office:'}
                                </span>
                                <span className="font-semibold text-slate-800 truncate max-w-sm">
                                  {app.interview_location || (app.interview_mode === 'VIRTUAL' ? 'Sent to your email' : (job.location || 'Company Office'))}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {app.interview_mode === 'VIRTUAL' && app.interview_location?.startsWith('http') && (
                                  <a 
                                    href={app.interview_location} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                                  >
                                    <Video className="h-3.5 w-3.5" /> Join Video Interview <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}

                                {app.interview_mode === 'OFFLINE' && (
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(app.interview_location || job.location || 'India')}`}
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                                  >
                                    <MapPin className="h-3.5 w-3.5" /> View on Google Maps <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {app.interview_notes && (
                              <p className="text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-blue-100/80 leading-relaxed">
                                📝 <b>Instructions:</b> {app.interview_notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {canWithdraw && (
                        <button onClick={() => handleWithdraw(app.id)} disabled={withdrawing === app.id}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50">
                          {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                      )}
                      <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#f8f9fa] p-5 space-y-4">
                    {/* Job meta grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Job Type',   value: job.job_type?.replace(/_/g, ' ') },
                        { label: 'Work Mode',  value: job.work_mode?.replace(/_/g, ' ') },
                        { label: 'Salary',     value: job.salary_min ? `₹${Number(job.salary_min).toLocaleString('en-IN')} – ₹${Number(job.salary_max).toLocaleString('en-IN')}` : null },
                        { label: 'Experience', value: job.experience_min != null ? `${job.experience_min}+ yrs` : null },
                      ].map(({ label, value }) => value ? (
                        <div key={label} className="bg-white rounded-xl border border-slate-200 p-3">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                          <p className="font-bold text-slate-800 text-sm mt-0.5 capitalize">{value}</p>
                        </div>
                      ) : null)}
                    </div>

                    {/* Required Skills */}
                    {job.required_skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.required_skills.map(s => (
                            <span key={s} className="bg-[#f0f4ff] text-[#275df5] border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    {app.cover_letter && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2">Your Cover Letter</p>
                        <p className="text-sm text-slate-600 bg-white rounded-xl border border-slate-200 p-4 leading-relaxed">
                          {app.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Status message */}
                    {app.status === 'SELECTED' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                          <span>Congratulations! Your job selection is confirmed. Check your registered email for official appointment details and next steps.</span>
                        </div>
                      </div>
                    )}
                    {app.status === 'INTERVIEW' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                        <div>
                          <span>Interview scheduled ({app.interview_mode === 'VIRTUAL' ? 'Virtual Video Conference' : 'In-Person / Office'}). Full instructions and venue/link have been emailed to you.</span>
                        </div>
                      </div>
                    )}
                    {app.status === 'REJECTED' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4 shrink-0" />
                        This application was not selected. Keep applying — the right opportunity is ahead!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
