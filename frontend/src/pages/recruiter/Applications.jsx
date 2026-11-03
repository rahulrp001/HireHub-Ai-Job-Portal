import { useState, useEffect, useRef } from 'react'
import { applicationService, jobService } from '../../services'
import { 
  Users, ChevronDown, CheckCircle, XCircle, Clock, Star, Filter, 
  Calendar, Video, MapPin, Mail, Sparkles 
} from 'lucide-react'
import ScheduleInterviewModal from '../../components/recruiter/ScheduleInterviewModal'

const STATUS_OPTIONS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED']
const STATUS_COLORS = {
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200', 
  UNDER_REVIEW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  SHORTLISTED: 'bg-purple-50 text-purple-700 border-purple-200', 
  INTERVIEW: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  SELECTED: 'bg-green-50 text-green-700 border-green-200', 
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  WITHDRAWN: 'bg-gray-50 text-gray-600 border-gray-200',
}

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)
  const [sortBy, setSortBy] = useState('ai_score')
  const [activeModalApp, setActiveModalApp] = useState(null)
  const [successToast, setSuccessToast] = useState('')
  const pollRef = useRef(null)

  const loadData = () => {
    Promise.all([
      applicationService.getRecruiterApplications(),
      jobService.getMyJobs(),
    ]).then(([appRes, jobRes]) => {
      setApplications(appRes.data.applications || [])
      setJobs(jobRes.data.jobs || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    loadData()
    pollRef.current = setInterval(loadData, 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const handleModalSuccess = async (id, payload) => {
    setUpdating(id)
    try {
      const { data } = await applicationService.updateStatus(id, payload)
      const updated = data.application
      setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
      
      const candidateEmail = updated?.candidate_detail?.email || 'Candidate'
      setSuccessToast(`Status updated to ${payload.status} and notification/email dispatched to ${candidateEmail}!`)
      setTimeout(() => setSuccessToast(''), 6000)
    } catch (err) {
      alert('Could not update status: ' + (err.response?.data?.message || err.message))
    }
    setUpdating(null)
  }

  const handleDropdownChange = (app, newStatus) => {
    if (['INTERVIEW', 'SHORTLISTED', 'SELECTED'].includes(newStatus)) {
      setActiveModalApp({ ...app, status: newStatus })
    } else {
      handleModalSuccess(app.id, { status: newStatus, send_email: true })
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Candidate Applications</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Review AI matches, schedule interviews (Virtual/In-person), and confirm job selections with automated candidate emails.
          </p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">✕</button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {STATUS_OPTIONS.map(s => (
          <div key={s} className="card p-3 text-center border border-gray-100 shadow-xs">
            <div className="text-xl font-black text-gray-900">{stats[s] || 0}</div>
            <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.replace('_', ' ')}</div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select 
            className="input-field w-auto text-xs font-semibold py-1.5" 
            value={selectedJob} 
            onChange={e => setSelectedJob(e.target.value)}
          >
            <option value="">All Jobs ({jobs.length})</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>

        <select 
          className="input-field w-auto text-xs font-semibold py-1.5" 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>

        <select 
          className="input-field w-auto text-xs font-semibold py-1.5" 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="ai_score">Sort: Highest AI Match</option>
          <option value="date">Sort: Latest Application</option>
        </select>

        <span className="text-xs font-bold text-gray-500 ml-auto">
          {filtered.length} candidates
        </span>
      </div>

      {/* Applications table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16 bg-white border border-gray-200">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No candidate applications found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden border border-gray-200/80 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-3.5 font-bold">Candidate</th>
                  <th className="text-left px-4 py-3.5 font-bold">Applied Job</th>
                  <th className="text-left px-4 py-3.5 font-bold">AI Fit Score</th>
                  <th className="text-left px-4 py-3.5 font-bold">Status & Schedule</th>
                  <th className="text-left px-4 py-3.5 font-bold">Applied Date</th>
                  <th className="text-left px-4 py-3.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Candidate Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {app.candidate_detail?.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{app.candidate_detail?.full_name}</p>
                          <p className="text-xs text-gray-400">{app.candidate_detail?.email}</p>
                        </div>
                        {idx === 0 && sortBy === 'ai_score' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Best Fit
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Job Title */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-800 text-xs">
                        {app.job_detail?.title}
                      </span>
                      <p className="text-[11px] text-gray-400">{app.job_detail?.location || 'Remote'}</p>
                    </td>

                    {/* AI Score */}
                    <td className="px-4 py-3.5">
                      {app.ai_match_score ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                app.ai_match_score >= 75 ? 'bg-emerald-500' : 
                                app.ai_match_score >= 50 ? 'bg-amber-500' : 'bg-rose-400'
                              }`}
                              style={{ width: `${app.ai_match_score}%` }} 
                            />
                          </div>
                          <span className="font-bold text-xs text-gray-900">{Math.round(app.ai_match_score)}%</span>
                        </div>
                      ) : <span className="text-gray-300">—</span>}
                    </td>

                    {/* Status & Interview Badge */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[app.status] || 'bg-gray-50 text-gray-700'}`}>
                          {app.status === 'SELECTED' && '🎉 '}
                          {app.status === 'INTERVIEW' && '📅 '}
                          {app.status.replace('_', ' ')}
                        </span>

                        {/* Interview Details Badge */}
                        {app.interview_date && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                            {app.interview_mode === 'VIRTUAL' ? (
                              <Video className="h-3 w-3 text-blue-600" />
                            ) : (
                              <MapPin className="h-3 w-3 text-emerald-600" />
                            )}
                            <span>
                              {app.interview_mode === 'VIRTUAL' ? 'Virtual' : 'In-Person'}: {new Date(app.interview_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Applied Date */}
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-medium">
                      {new Date(app.applied_at).toLocaleDateString('en-IN')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Schedule / Status Modal Button */}
                        <button
                          type="button"
                          onClick={() => setActiveModalApp(app)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-all border border-blue-200/70"
                          title="Schedule Interview, Select, or Shortlist with Email Notification"
                        >
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          <span>Schedule / Email</span>
                        </button>

                        {/* Quick Status Select */}
                        <select 
                          value={app.status} 
                          disabled={updating === app.id || app.status === 'WITHDRAWN'}
                          onChange={e => handleDropdownChange(app, e.target.value)}
                          className="text-xs font-semibold border border-gray-200 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
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

      {/* Schedule Interview & Email Notification Modal */}
      {activeModalApp && (
        <ScheduleInterviewModal
          isOpen={!!activeModalApp}
          onClose={() => setActiveModalApp(null)}
          application={activeModalApp}
          onUpdateSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
