import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService, jobService, applicationService } from '../../services'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  Briefcase, Users, CheckCircle2, Plus, ArrowRight, Eye, Sparkles, 
  Search, Star, FileText, Calendar, Building2, SlidersHorizontal, UserCheck, XCircle
} from 'lucide-react'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [updatingId, setUpdatingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const [statsRes, appsRes] = await Promise.all([
        authService.dashboardStats(),
        applicationService.getRecruiterApplications(),
      ])
      setStats(statsRes.data)
      setApplications(appsRes.data.applications || [])
    } catch {}
    finally { if (showLoader) setLoading(false) }
  }

  useEffect(() => {
    fetchData(true)
    pollRef.current = setInterval(() => fetchData(false), 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const handleShortlist = async (appId, candidateName) => {
    setUpdatingId(appId)
    try {
      await applicationService.updateStatus(appId, { status: 'SHORTLISTED' })
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'SHORTLISTED' } : a))
      setStats(prev => prev ? {
        ...prev,
        shortlisted: (prev.shortlisted || 0) + 1,
      } : prev)
    } catch {}
    finally { setUpdatingId(null) }
  }

  const activeJobs = stats?.active_jobs ?? 0
  const highMatchesCount = stats?.high_match_count ?? 0
  const interviewCount = stats?.interviews ?? 0

  const chartData = (stats?.chart_data || []).map(j => ({
    name: j.title.slice(0, 14),
    applicants: j.app_count || 0,
  }))

  const displayApplications = applications

  const statCards = [
    { label: 'Active Job Listings', value: activeJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Total Applicants', value: stats?.total_applications ?? 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { label: 'AI High Fits (>85%)', value: highMatchesCount, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Interviews Scheduled', value: interviewCount, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#275df5] border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Recruiter Enterprise Hero Banner */}
      <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-2">
              <Building2 className="h-3.5 w-3.5 text-amber-400" /> Employer Talent Acquisition Suite
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome, {user?.first_name || 'Employer'} 🏢
            </h1>
            <p className="text-blue-100/80 text-xs md:text-sm mt-1">
              You have <span className="font-bold text-emerald-400">{highMatchesCount} high-match candidate profiles</span> ready for shortlist.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              to="/recruiter/jobs/create" 
              className="bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-6 py-3 rounded-full text-sm transition-all shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Plus className="h-4 w-4" /> Post New Job
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`bg-white rounded-2xl border ${bg} p-5 shadow-xs flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white shadow-xs border border-slate-100 shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Talent Pipeline Table (Dummy & Real Data) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#275df5]" /> Candidate Screening Pipeline
            </h2>
            <p className="text-xs text-slate-500">AI-ranked applicant profiles sorted by job match score</p>
          </div>

          <Link to="/recruiter/applications" className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1">
            View Full ATS Pipeline →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">Candidate</th>
                <th className="py-3 px-4">Applied Role</th>
                <th className="py-3 px-4">AI Match Rating</th>
                <th className="py-3 px-4">Matched Skills</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {displayApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No applications yet. Post a job to start receiving candidates.
                  </td>
                </tr>
              ) : displayApplications.slice(0, 5).map((app) => {
                const matchScore = app.ai_match_score || 90
                const isHighFit = matchScore >= 90
                
                return (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Candidate Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#275df5]/10 text-[#275df5] font-black text-sm rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                          {app.candidate_detail?.full_name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{app.candidate_detail?.full_name}</p>
                          <p className="text-[11px] text-slate-400">{app.candidate_detail?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Applied Role */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      {app.job_detail?.title}
                    </td>

                    {/* AI Score */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full border ${
                        isHighFit ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <Sparkles className="h-3 w-3 text-emerald-600" /> {matchScore}% Match
                      </span>
                    </td>

                    {/* Skills */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(app.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4">
                      <span className={`inline-block font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                        app.status === 'SHORTLISTED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        app.status === 'INTERVIEW' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => window.open(`/recruiter/applications`, '_self')}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#275df5] hover:bg-slate-100 transition-colors"
                          title="View Resume"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {app.status !== 'SHORTLISTED' && app.status !== 'INTERVIEW' && app.status !== 'SELECTED' ? (
                          <button 
                            onClick={() => handleShortlist(app.id, app.candidate_detail?.full_name)}
                            disabled={updatingId === app.id}
                            className="px-3 py-1 rounded-full bg-[#275df5] text-white text-xs font-bold hover:bg-[#1a4bd8] transition-colors disabled:opacity-50"
                          >
                            {updatingId === app.id ? '...' : 'Shortlist'}
                          </button>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                            {app.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Analytics Bar Chart & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Applicant Traffic Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Applicant Volume Per Listing</span>
            <span className="text-xs text-slate-400 font-normal">Real-time stats</span>
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="applicants" fill="#275df5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Right 1 Col: Quick Recruiter Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              { to: '/recruiter/jobs/create', label: 'Post New Job Vacancy', desc: 'Create AI-assisted job listing', icon: Plus },
              { to: '/recruiter/jobs', label: 'Manage Active Jobs', desc: 'Edit, pause or close listings', icon: Briefcase },
              { to: '/recruiter/applications', label: 'Candidate Pipeline', desc: 'Screen & rank applicants', icon: Users },
              { to: '/recruiter/company', label: 'Company Profile', desc: 'Update branding & overview', icon: Building2 },
            ].map(({ to, label, desc, icon: Icon }) => (
              <Link 
                key={to} 
                to={to} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
              >
                <div className="w-9 h-9 bg-blue-50 text-[#275df5] rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#275df5] transition-colors">{label}</p>
                  <p className="text-[11px] text-slate-400">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#275df5] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
