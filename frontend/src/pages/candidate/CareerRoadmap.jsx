import { useState } from 'react'
import { aiService } from '../../services'
import { Map, CheckCircle, BookOpen, ExternalLink, ChevronDown, ChevronUp, Zap } from 'lucide-react'

const POPULAR_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'DevOps Engineer', 'Mobile Developer',
]

export default function CareerRoadmap() {
  const [targetRole, setTargetRole] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const fetchRoadmap = async (role) => {
    const r = role || targetRole
    if (!r.trim()) return
    setLoading(true)
    try {
      const { data } = await aiService.getCareerRoadmap(r)
      setRoadmap(data.roadmap)
      setExpanded(null)
    } catch {}
    setLoading(false)
  }

  const completedSteps = roadmap?.steps?.filter(s => s.is_complete)?.length || 0
  const totalSteps = roadmap?.steps?.length || 0
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
          <Map className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Roadmap</h1>
          <p className="text-gray-500 text-sm">Get a personalized step-by-step path to your target role</p>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-3">
          <input className="input-field flex-1" placeholder="Enter your target role (e.g. Full Stack Developer)"
            value={targetRole} onChange={e => setTargetRole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchRoadmap()} />
          <button onClick={() => fetchRoadmap()} disabled={loading || !targetRole.trim()} className="btn-primary px-6">
            {loading ? 'Generating...' : 'Generate Roadmap'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400">Popular:</span>
          {POPULAR_ROLES.map(r => (
            <button key={r} onClick={() => { setTargetRole(r); fetchRoadmap(r) }}
              className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors">
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="card flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Building your personalized roadmap...</p>
          </div>
        </div>
      )}

      {roadmap && !loading && (
        <>
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{roadmap.title}</h2>
                <p className="text-orange-100 mt-1">{roadmap.description}</p>
                <p className="text-orange-200 text-sm mt-2">⏱ Estimated: {roadmap.total_months} months</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{progressPct}%</div>
                <div className="text-orange-200 text-xs">Skills matched</div>
                <div className="w-20 bg-white/20 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {roadmap.steps.map((step, idx) => {
              const isExpanded = expanded === idx
              const isComplete = step.is_complete
              const hasProgress = step.completed_skills?.length > 0 && !isComplete

              return (
                <div key={idx} className={`card p-0 overflow-hidden border-l-4 ${
                  isComplete ? 'border-l-green-500' : hasProgress ? 'border-l-yellow-500' : 'border-l-gray-200'
                }`}>
                  <div className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : idx)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isComplete ? 'bg-green-100' : hasProgress ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {isComplete
                        ? <CheckCircle className="h-6 w-6 text-green-600" />
                        : <span className={`font-bold text-sm ${hasProgress ? 'text-yellow-700' : 'text-gray-500'}`}>{step.step}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        {isComplete && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✅ Complete</span>}
                        {hasProgress && <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Zap className="h-3 w-3" /> In Progress</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">⏱ {step.duration}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {step.skills.map(skill => {
                          const done = step.completed_skills?.includes(skill)
                          return (
                            <span key={skill} className={`text-xs px-2 py-0.5 rounded-full ${
                              done ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {done && '✓ '}{skill}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                    <button className="text-gray-400 flex-shrink-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                      {step.project && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs font-semibold text-orange-700 mb-1">🎯 Project to Build</p>
                          <p className="text-sm text-orange-800">{step.project}</p>
                        </div>
                      )}
                      {step.resources?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Learning Resources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map(r => (
                              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                {r.name} <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {step.remaining_skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Skills to Learn</p>
                          <div className="flex flex-wrap gap-1">
                            {step.remaining_skills.map(s => (
                              <span key={s} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">{s}</span>
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
        </>
      )}
    </div>
  )
}
