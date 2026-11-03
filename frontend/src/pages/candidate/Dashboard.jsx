import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService, applicationService, jobService } from '../../services'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  Briefcase, CheckCircle2, Star, BookmarkCheck, TrendingUp,
  ArrowRight, Sparkles, Brain, Bot, FileText, BarChart3,
  ChevronRight, Target
} from 'lucide-react'

const STATUS_COLORS = {
  APPLIED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  SHORTLISTED: '#8b5cf6',
  INTERVIEW: '#06b6d4',
  SELECTED: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#6b7280'
}

export default function CandidateDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const [statsRes, jobsRes] = await Promise.all([
        authService.dashboardStats(),
        jobService.getJobs({ page: 1 }),
      ])
      setStats(statsRes.data)
      setJobs((jobsRes.data.results || []).slice(0, 4))
    } catch {}
    finally { if (showLoader) setLoading(false) }
  }

  useEffect(() => {
    fetchData(true)
    pollRef.current = setInterval(() => fetchData(false), 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const pieData = Object.entries(stats?.status_counts || {}).map(([name, value]) => ({ name, value }))
  const completionPct = stats?.completion_percentage || 0

  const statCards = [
    { label: 'Total Applications', value: stats?.total_applications ?? 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Shortlisted / Interviews', value: (stats?.shortlisted ?? 0) + (stats?.interviews ?? 0), icon: Star, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { label: 'Saved Jobs', value: stats?.saved_jobs ?? 0, icon: BookmarkCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Selected', value: stats?.selected ?? 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#275df5] border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#275df5] text-white font-black text-2xl rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
              {user?.first_name?.[0] || 'C'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Candidate Talent Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-blue-100/80 text-xs md:text-sm mt-0.5">
                Profile completion: <span className="font-bold text-emerald-400">{completionPct}%</span>
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 w-full md:w-auto shrink-0 flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-white/20" fill="transparent" />
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-emerald-400"
                  strokeDasharray={138} strokeDashoffset={138 - (138 * completionPct) / 100}
                  strokeLinecap="round" fill="transparent" />
              </svg>
              <span className="absolute text-xs font-black text-white">{completionPct}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Profile Score</p>
              <p className="text-[11px] text-blue-200">Complete profile for better matches</p>
              <Link to="/candidate/profile" className="text-xs font-bold text-amber-300 hover:underline mt-1 inline-block">
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`bg-white rounded-2xl border ${bg} p-5 shadow-sm flex items-center gap-4`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-white shadow-sm border border-slate-100 shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tools */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#275df5]" /> AI Career Tools
            </h2>
            <p className="text-xs text-slate-500">Boost your job search with AI</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/candidate/ai-coach', title: 'AI Career Coach', desc: 'Get personalized career guidance', icon: Bot, badge: 'AI' },
            { to: '/candidate/skill-gap', title: 'Skill Gap Analyzer', desc: 'Find missing skills for your target role', icon: BarChart3, badge: 'ATS' },
            { to: '/candidate/resume', title: 'Resume Builder', desc: 'Create ATS-friendly resume', icon: FileText, badge: 'Resume' },
            { to: '/candidate/salary-insights', title: 'Salary Insights', desc: 'Know your market worth', icon: TrendingUp, badge: 'Data' },
          ].map(({ to, title, desc, icon: Icon, badge }) => (
            <Link key={to} to={to}
              className="bg-[#f8f9fa] border border-slate-200/80 rounded-2xl p-4 hover:bg-white hover:border-[#275df5]/50 hover:shadow-md transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#275df5] group-hover:bg-[#275df5] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">{badge}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#275df5] transition-colors">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
              <div className="mt-4 text-xs font-bold text-[#275df5] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Jobs + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Jobs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#275df5]" /> Latest Jobs
            </h2>
            <Link to="/jobs" className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No jobs available right now.</p>
            ) : jobs.map((job) => (
              <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-[#f8f9fa] border border-slate-200/70 rounded-xl p-4 hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-[#275df5] font-black text-sm rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                    {(job.company_detail?.name || 'C')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company_detail?.name || 'Company'} • {job.location || 'Remote'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{job.job_type?.replace('_', ' ') || 'Full Time'}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 shrink-0">
                  {job.salary_min ? `₹${Number(job.salary_min).toLocaleString()}` : 'Not disclosed'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
            Application Status
          </h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                {pieData.map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[name] || '#94a3b8' }} />
                      <span className="text-slate-600">{name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No applications yet.
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">Track Applications</span>
            <Link to="/candidate/applications" className="text-[#275df5] hover:underline">View →</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
