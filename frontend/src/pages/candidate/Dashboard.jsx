import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService, applicationService, jobService, candidateService } from '../../services'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { 
  Briefcase, CheckCircle2, Clock, Star, BookmarkCheck, TrendingUp, 
  ArrowRight, User, Sparkles, Brain, Bot, FileText, BarChart3, 
  MapPin, Award, ChevronRight, Zap, Target
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
  const [applications, setApplications] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const fetchData = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const [statsRes, appsRes, jobsRes] = await Promise.all([
        authService.dashboardStats(),
        applicationService.getMyApplications(),
        jobService.getJobs({ page_size: 3 }),
      ])
      setStats(statsRes.data)
      setApplications(appsRes.data.applications || [])
      const jobs = jobsRes.data.results || []
      setRecommendedJobs(jobs)
    } catch {}
    finally { if (showLoader) setLoading(false) }
  }

  useEffect(() => {
    fetchData(true)
    pollRef.current = setInterval(() => fetchData(false), 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const statusCounts = stats?.status_counts || {}
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
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

  const completionPct = profile?.completion_percentage || 85

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Welcome Hero Banner */}
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
                Your ATS Resume Match Score is <span className="font-bold text-emerald-400">92/100</span>. Top MNCs are reviewing your profile.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 w-full md:w-auto shrink-0 flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-white/20" fill="transparent" />
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="4" className="text-emerald-400" strokeDasharray={138} strokeDashoffset={138 - (138 * completionPct) / 100} strokeLinecap="round" fill="transparent" />
              </svg>
              <span className="absolute text-xs font-black text-white">{completionPct}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Profile Score</p>
              <p className="text-[11px] text-blue-200">Add 2 key skills to reach 100%</p>
              <Link to="/candidate/profile" className="text-xs font-bold text-amber-300 hover:underline mt-1 inline-block">
                Edit Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* 3. AI Power Tools Quick Launch Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#275df5]" /> AI Career Intelligence Hub
            </h2>
            <p className="text-xs text-slate-500">Accelerate your shortlist chances with instant AI tools</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-[#275df5] px-2.5 py-1 rounded-md">
            HireHub Exclusive
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/candidate/ai-coach', title: 'AI Mock Interviewer', desc: 'Practice role questions with real-time AI feedback', icon: Bot, badge: 'Interactive' },
            { to: '/candidate/skill-gap', title: 'Skill Gap Analyzer', desc: 'Compare your resume against target job requirements', icon: BarChart3, badge: 'ATS Match' },
            { to: '/candidate/resume', title: 'Smart Resume Parser', desc: 'Auto-extract skills & experience for 90%+ ATS score', icon: FileText, badge: 'Parser' },
            { to: '/candidate/salary-insights', title: 'Salary Estimator', desc: 'Benchmark compensation by role & experience', icon: TrendingUp, badge: 'Insights' },
          ].map(({ to, title, desc, icon: Icon, badge }) => (
            <Link 
              key={to} 
              to={to}
              className="bg-[#f8f9fa] border border-slate-200/80 rounded-2xl p-4 hover:bg-white hover:border-[#275df5]/50 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center text-[#275df5] group-hover:bg-[#275df5] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                    {badge}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#275df5] transition-colors">{title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
              <div className="mt-4 text-xs font-bold text-[#275df5] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Launch Tool <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Split Grid: Applications & AI Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recommended Jobs matched to Candidate */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Target className="h-4 w-4 text-[#275df5]" /> AI Recommended Jobs For You
                </h2>
                <p className="text-xs text-slate-500">Jobs matched to your parsed skills & target roles</p>
              </div>
              <Link to="/jobs" className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <div 
                  key={job.id}
                  onClick={() => navigate(`/jobs`)}
                  className="bg-[#f8f9fa] border border-slate-200/70 rounded-xl p-4 hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-[#275df5] font-black text-sm rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                      {job.company[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-[#275df5] transition-colors">{job.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{job.company} • {job.location}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.map(t => (
                          <span key={t} className="bg-slate-200/60 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" /> {job.match}% Match
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-1">{job.salary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Application Pipeline & Chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              Application Status Breakdown
            </h2>

            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No applications submitted yet.
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">Track Applications</span>
              <Link to="/candidate/applications" className="text-[#275df5] hover:underline">
                View Tracker →
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
