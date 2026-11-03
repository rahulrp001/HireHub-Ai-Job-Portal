import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService, candidateService } from '../../services'
import api from '../../services/api'
import {
  BarChart3, CheckCircle2, XCircle, BookOpen, ExternalLink,
  Search, Sparkles, Target, ChevronRight, Zap, AlertCircle,
  TrendingUp, User, Briefcase
} from 'lucide-react'

// Learning resources per skill
const RESOURCES = {
  python: [
    { name: 'Python for Everybody – Coursera', url: 'https://coursera.org/specializations/python' },
    { name: 'Python Full Course – freeCodeCamp', url: 'https://youtube.com/watch?v=rfscVS0vtbw' },
  ],
  react: [
    { name: 'React Official Docs', url: 'https://react.dev' },
    { name: 'React Full Course – Scrimba', url: 'https://scrimba.com/learn/learnreact' },
  ],
  django: [
    { name: 'Django Official Tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' },
    { name: 'Django Crash Course – Traversy', url: 'https://youtube.com/watch?v=e1IyzVyrLSU' },
  ],
  javascript: [
    { name: 'JavaScript.info', url: 'https://javascript.info' },
    { name: 'JS Full Course – freeCodeCamp', url: 'https://youtube.com/watch?v=PkZNo7MFNFg' },
  ],
  typescript: [
    { name: 'TypeScript Handbook', url: 'https://typescriptlang.org/docs/handbook/intro.html' },
    { name: 'TypeScript Course – Fireship', url: 'https://youtube.com/watch?v=ahCwqrYpIuM' },
  ],
  sql: [
    { name: 'SQL Tutorial – W3Schools', url: 'https://w3schools.com/sql' },
    { name: 'SQL for Data Analysis – Udacity', url: 'https://udacity.com/course/sql-for-data-analysis--ud198' },
  ],
  docker: [
    { name: 'Docker Getting Started', url: 'https://docs.docker.com/get-started' },
    { name: 'Docker Full Course – TechWorld', url: 'https://youtube.com/watch?v=3c-iBn73dDE' },
  ],
  aws: [
    { name: 'AWS Free Tier + Docs', url: 'https://aws.amazon.com/free' },
    { name: 'AWS Cloud Practitioner – freeCodeCamp', url: 'https://youtube.com/watch?v=SOTamWNgDKc' },
  ],
  'machine learning': [
    { name: 'ML Course – Andrew Ng (Coursera)', url: 'https://coursera.org/learn/machine-learning' },
    { name: 'ML Crash Course – Google', url: 'https://developers.google.com/machine-learning/crash-course' },
  ],
  kubernetes: [
    { name: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics' },
    { name: 'K8s Full Course – TechWorld', url: 'https://youtube.com/watch?v=X48VuDVv0do' },
  ],
  nodejs: [
    { name: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
    { name: 'Node.js Crash Course – Traversy', url: 'https://youtube.com/watch?v=fBNz5xF-Kx4' },
  ],
  git: [
    { name: 'Git Official Docs', url: 'https://git-scm.com/doc' },
    { name: 'Git & GitHub – freeCodeCamp', url: 'https://youtube.com/watch?v=RGOj5yH7evk' },
  ],
}

function getResources(skill) {
  const key = skill.toLowerCase()
  return RESOURCES[key] || [
    { name: `"${skill}" on Coursera`, url: `https://coursera.org/search?query=${encodeURIComponent(skill)}` },
    { name: `"${skill}" Tutorial – YouTube`, url: `https://youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` },
  ]
}

function MatchMeter({ pct }) {
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
  const label = pct >= 75 ? 'Strong Match' : pct >= 50 ? 'Good Potential' : 'Needs Work'
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * pct) / 100

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle cx="44" cy="44" r={r} stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <span className="absolute text-xl font-black text-slate-900">{pct}%</span>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900">{pct}%</p>
        <p className="font-bold text-sm mt-0.5" style={{ color }}>{label}</p>
        <p className="text-xs text-slate-500 mt-1">Overall skill match score</p>
      </div>
    </div>
  )
}

export default function SkillGap() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [mySkills, setMySkills] = useState([])

  useEffect(() => {
    Promise.all([
      jobService.getJobs({ page: 1 }),
      candidateService.getSkills(),
    ]).then(([jobsRes, skillsRes]) => {
      // Backend returns paginated: { count, results: [...] }
      const jobList = jobsRes.data?.results || jobsRes.data || []
      console.log('Jobs loaded:', jobList.length, jobList)
      setJobs(jobList)
      const raw = skillsRes.data?.skills || skillsRes.data || []
      setMySkills(raw.map(s => (s.skill?.name || s.name || '').toLowerCase()).filter(Boolean))
    }).catch((err) => {
      console.error('SkillGap load error:', err?.response?.data || err.message)
    }).finally(() => setJobsLoading(false))
  }, [])

  const analyzeJob = async (job) => {
    setSelectedJob(job)
    setAnalysis(null)
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get(`/candidates/skill-gap/${job.id}/`)
      setAnalysis(data)
    } catch (err) {
      // Fallback: compute locally from job.required_skills vs mySkills
      const required = (job.required_skills || []).map(s => s.toLowerCase())
      if (required.length === 0) {
        setError('This job has no required skills listed.')
      } else {
        const matched = required.filter(s => mySkills.includes(s))
        const missing = required.filter(s => !mySkills.includes(s))
        const pct = Math.round((matched.length / required.length) * 100)
        setAnalysis({
          required_skills: required,
          matched_skills: matched,
          missing_skills: missing,
          match_percentage: pct,
          recommendations: missing.slice(0, 5).map(s => `Learn ${s} to improve your chances`),
          _local: true,
        })
      }
    }
    setLoading(false)
  }

  const filteredJobs = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company_detail?.name?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  )

  const matchColor = analysis
    ? analysis.match_percentage >= 75 ? 'text-emerald-600'
      : analysis.match_percentage >= 50 ? 'text-amber-600'
      : 'text-red-500'
    : ''

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#275df5] rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-md shrink-0">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-0.5 rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> AI-Powered Analysis
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Skill Gap Analyzer</h1>
              <p className="text-blue-100/80 text-xs md:text-sm mt-0.5">
                Select a job to see your match score and what to learn
              </p>
            </div>
          </div>
          {/* My skills count badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-[#275df5] rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{mySkills.length}</p>
              <p className="text-xs text-blue-200">Skills in your profile</p>
            </div>
            <Link to="/candidate/profile" className="ml-2 text-xs font-bold text-amber-300 hover:underline whitespace-nowrap">
              Add Skills →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Job List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                className="w-full bg-[#f8f9fa] border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#275df5]/30 focus:border-[#275df5] transition-all"
                placeholder="Search jobs..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{filteredJobs.length} jobs available</p>
          </div>

          <div className="overflow-y-auto flex-1" style={{ maxHeight: '520px' }}>
            {jobsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No jobs found</p>
              </div>
            ) : filteredJobs.map(job => {
              const isSelected = selectedJob?.id === job.id
              const reqCount = job.required_skills?.length || 0
              return (
                <button key={job.id} onClick={() => analyzeJob(job)}
                  className={`w-full text-left p-4 border-b border-slate-50 hover:bg-[#f0f4ff] transition-colors ${
                    isSelected ? 'bg-[#f0f4ff] border-l-4 border-l-[#275df5]' : 'border-l-4 border-l-transparent'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelected ? 'text-[#275df5]' : 'text-slate-900'}`}>
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {job.company_detail?.name || 'Company'} • {job.location || 'Remote'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {reqCount > 0 ? (
                          <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                            {reqCount} skills required
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                            No skills listed
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{job.job_type?.replace('_', ' ') || 'Full Time'}</span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight className="h-4 w-4 text-[#275df5] shrink-0 mt-1" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Analysis Panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* Empty state */}
          {!loading && !analysis && !error && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-[#275df5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Select a job to analyze</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">
                Pick any job from the left panel to see your skill match score and learning plan
              </p>
              {mySkills.length === 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Add skills to your profile for accurate analysis</span>
                  <Link to="/candidate/profile" className="font-bold underline ml-1">Add now</Link>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center justify-center py-20">
              <div className="w-14 h-14 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-[#275df5] animate-pulse" />
              </div>
              <p className="font-bold text-slate-700">Analyzing your skill gap...</p>
              <p className="text-slate-400 text-sm mt-1">Comparing your profile with job requirements</p>
              <div className="flex gap-1.5 mt-4">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 bg-[#275df5] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
              <p className="font-bold text-slate-700">{error}</p>
              <p className="text-slate-400 text-sm mt-1">Try selecting a different job</p>
            </div>
          )}

          {/* Results */}
          {analysis && !loading && (
            <>
              {/* Score Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <MatchMeter pct={analysis.match_percentage} />
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-bold text-emerald-700">{analysis.matched_skills?.length || 0}</span>
                      <span className="text-emerald-600">skills matched</span>
                    </div>
                    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="font-bold text-red-600">{analysis.missing_skills?.length || 0}</span>
                      <span className="text-red-500">skills missing</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-700">{analysis.required_skills?.length || 0}</span>
                      <span className="text-slate-500">total required</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Match Progress</span>
                    <span className={matchColor}>{analysis.match_percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${analysis.match_percentage}%`,
                        background: analysis.match_percentage >= 75 ? '#10b981'
                          : analysis.match_percentage >= 50 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                {analysis._local && (
                  <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mt-3 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Computed locally from your profile skills. Backend analysis unavailable.
                  </p>
                )}
              </div>

              {/* Matched Skills */}
              {analysis.matched_skills?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Skills You Already Have
                    <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {analysis.matched_skills.length} matched
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map(skill => (
                      <span key={skill}
                        className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills with Resources */}
              {analysis.missing_skills?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-[#275df5]" />
                    Skills to Learn
                    <span className="ml-auto text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      {analysis.missing_skills.length} missing
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {analysis.missing_skills.map((skill, idx) => (
                      <div key={skill} className="border border-slate-200 rounded-xl p-4 hover:border-[#275df5]/30 hover:bg-[#f8f9fa] transition-colors">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 text-sm capitalize">{skill}</span>
                          </div>
                          <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                            Missing
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getResources(skill).map(r => (
                            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-[#275df5] bg-[#f0f4ff] border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-[#275df5] hover:text-white transition-colors font-medium">
                              <BookOpen className="h-3 w-3" /> {r.name} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfect match */}
              {analysis.missing_skills?.length === 0 && (
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-700">Perfect Match! 🎉</h3>
                  <p className="text-emerald-600 text-sm mt-1">You have all the required skills for this job</p>
                  <Link to="/jobs" className="inline-flex items-center gap-2 mt-5 bg-[#275df5] hover:bg-[#1a4fd8] text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors">
                    Apply Now <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
