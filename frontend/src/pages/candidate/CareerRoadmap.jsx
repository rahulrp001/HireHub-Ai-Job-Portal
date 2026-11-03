import { useState } from 'react'
import { Link } from 'react-router-dom'
import { aiService } from '../../services'
import { 
  Map, CheckCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, 
  Zap, Sparkles, ArrowRight, Briefcase, RefreshCw, AlertCircle, Compass 
} from 'lucide-react'

const POPULAR_ROLES = [
  'Full Stack Developer',
  'Generative AI Engineer',
  'Cloud Solutions Architect',
  'DevOps Engineer',
  'Cybersecurity Specialist',
  'Frontend Developer',
  'Python Backend Developer',
  'Data Scientist',
  'Flutter Mobile Developer',
  'Product Manager',
  'UI/UX Product Designer',
  'Blockchain Developer',
  'QA Automation Engineer',
]

export default function CareerRoadmap() {
  const [targetRole, setTargetRole] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  const fetchRoadmap = async (role) => {
    const r = role || targetRole
    if (!r.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await aiService.getCareerRoadmap(r.trim())
      if (data && data.roadmap) {
        setRoadmap(data.roadmap)
        setExpanded(0) // Default expand first step
      } else {
        setError('Could not generate roadmap for this role. Please try again.')
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to generate career roadmap. Please check connection.')
    } finally {
      setLoading(false)
    }
  }

  const completedSteps = roadmap?.steps?.filter(s => s.is_complete)?.length || 0
  const totalSteps = roadmap?.steps?.length || 0
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-sm text-white">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">AI Career Roadmap</h1>
          <p className="text-slate-500 text-sm">Real-time personalized milestone pathway to achieve your dream target role</p>
        </div>
      </div>

      {/* Target Search Card */}
      <div className="card space-y-4 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              className="input-field text-sm font-medium pr-10" 
              placeholder="Enter ANY target role (e.g. Cloud Architect, GenAI Engineer, Flutter Developer)..."
              value={targetRole} 
              onChange={e => setTargetRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRoadmap()} 
            />
            {targetRole && (
              <button 
                type="button"
                onClick={() => setTargetRole('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <button 
            onClick={() => fetchRoadmap()} 
            disabled={loading || !targetRole.trim()} 
            className="btn-primary px-8 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" /> Generate Real-time Roadmap
              </>
            )}
          </button>
        </div>

        {/* Popular Tags */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Targets:</span>
            {POPULAR_ROLES.map(r => (
              <button 
                key={r} 
                onClick={() => { setTargetRole(r); fetchRoadmap(r) }}
                className="text-xs bg-orange-50/80 text-orange-700 hover:bg-orange-100 border border-orange-200/80 font-medium px-3 py-1 rounded-full transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card flex items-center justify-center py-16 bg-white border border-slate-200/80">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Synthesizing Real-time Curriculum...</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto">
              Analyzing core requirements, prerequisite skills, hands-on projects, and free authoritative resources for <b>{targetRole}</b>.
            </p>
          </div>
        </div>
      )}

      {/* Roadmap Content */}
      {roadmap && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Banner Card */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Career Milestone Pathway
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{roadmap.title}</h2>
                <p className="text-orange-50/90 text-xs md:text-sm leading-relaxed">{roadmap.description}</p>
                
                <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-orange-100">
                  <span>⏱ Estimated Duration: <b>{roadmap.total_months} months</b></span>
                  <span>•</span>
                  <span>📚 <b>{roadmap.steps?.length || 0} Sequential Phases</b></span>
                </div>
              </div>

              {/* Progress Dial */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 w-full md:w-auto">
                <div className="text-3xl font-black">{progressPct}%</div>
                <p className="text-orange-100 text-[11px] font-semibold mt-0.5">Profile Match Score</p>
                <div className="w-32 bg-black/20 rounded-full h-2 mt-2 mx-auto overflow-hidden">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-[10px] text-orange-200 mt-1.5">
                  {completedSteps} of {totalSteps} phases mastered
                </p>
              </div>
            </div>
          </div>

          {/* Action Link to Jobs matching target role */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-5 w-5 text-[#275df5]" />
              <span className="text-xs text-slate-700 font-semibold">
                Looking to apply right away? Explore live vacancies matching this role:
              </span>
            </div>
            <Link 
              to={`/jobs?q=${encodeURIComponent(targetRole)}`}
              className="btn-secondary text-xs font-bold px-4 py-2 flex items-center gap-1 text-[#275df5] hover:bg-blue-50 shrink-0"
            >
              Browse {targetRole} Jobs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Stepper Phases List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Phases & Milestones</span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setExpanded(expanded === null ? 0 : null)}
                  className="text-[#275df5] hover:underline"
                >
                  {expanded !== null ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>

            {roadmap.steps.map((step, idx) => {
              const isExpanded = expanded === idx || expanded === 'ALL'
              const isComplete = step.is_complete
              const hasProgress = step.completed_skills?.length > 0 && !isComplete

              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    isComplete 
                      ? 'border-emerald-300 ring-1 ring-emerald-200/60' 
                      : hasProgress 
                      ? 'border-amber-300 ring-1 ring-amber-200/60' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Step Header */}
                  <div 
                    className="p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                  >
                    {/* Step Icon Badge */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border shadow-xs ${
                      isComplete 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : hasProgress 
                        ? 'bg-amber-50 text-amber-600 border-amber-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      ) : (
                        `0${step.step}`
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Phase {step.step}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                        {isComplete && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            ✓ Mastered
                          </span>
                        )}
                        {hasProgress && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-500" /> In Progress
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 font-medium">⏱ Estimated: {step.duration}</p>

                      {/* Skill Chips Preview */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {step.skills.map(skill => {
                          const done = step.completed_skills?.includes(skill)
                          return (
                            <span 
                              key={skill} 
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border transition-colors ${
                                done 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200/80'
                              }`}
                            >
                              {done && '✓ '}{skill}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    <button 
                      type="button" 
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Expanded Details Body */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      
                      {/* Project to Build */}
                      {step.project && (
                        <div className="p-3.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-xl">
                          <p className="text-xs font-bold text-orange-900 flex items-center gap-1.5 mb-1">
                            🎯 Milestone Portfolio Project to Build
                          </p>
                          <p className="text-xs text-orange-950 font-medium leading-relaxed">
                            {step.project}
                          </p>
                        </div>
                      )}

                      {/* Curated Resources */}
                      {step.resources?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                            <BookOpen className="h-3.5 w-3.5 text-[#275df5]" /> Authoritative Learning Resources & Tutorials
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((r, rIdx) => (
                              <a
                                key={rIdx}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#275df5] hover:text-[#1a4bd8] bg-white border border-slate-200 hover:border-blue-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs"
                              >
                                {r.name} <ExternalLink className="h-3 w-3 text-slate-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remaining Skills to Learn */}
                      {step.remaining_skills?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Focus Skills for this Phase:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {step.remaining_skills.map(s => (
                              <span 
                                key={s} 
                                className="text-xs bg-white text-slate-700 border border-slate-200 font-medium px-2.5 py-1 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}
