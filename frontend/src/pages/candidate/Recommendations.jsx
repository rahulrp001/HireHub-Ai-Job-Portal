import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService, applicationService, candidateService } from '../../services'
import api from '../../services/api'
import { MapPin, Briefcase, Star, Zap, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

function MatchBar({ score }) {
  const color = score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
        {score}%
      </span>
    </div>
  )
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [applied, setApplied] = useState(new Set())
  const [expanded, setExpanded] = useState(null)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/candidates/recommendations/'),
      api.get('/resumes/'),
      applicationService.getMyApplications(),
    ]).then(([recRes, resumeRes, appRes]) => {
      setRecommendations(recRes.data.recommendations || [])
      setResumes(resumeRes.data.resumes || [])
      const appliedIds = new Set((appRes.data.applications || []).map(a => a.job))
      setApplied(appliedIds)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      const resumeId = resumes[0]?.id
      await applicationService.apply(jobId, { resume: resumeId })
      setApplied(prev => new Set([...prev, jobId]))
    } catch {}
    setApplying(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Job Recommendations</h1>
        <p className="text-gray-500 mt-1">Jobs matched to your skills and experience by AI</p>
      </div>

      {recommendations.length === 0 ? (
        <div className="card text-center py-16">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No recommendations yet</h3>
          <p className="text-gray-400 mt-1 text-sm">Add skills to your profile to get AI-matched job recommendations</p>
          <Link to="/candidate/profile" className="btn-primary inline-block mt-4">Update Profile</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map(({ job, score, matched_skills, missing_skills, explanation }, idx) => (
            <div key={job.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {idx < 3 && (
                        <span className="bg-yellow-50 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Top Match
                        </span>
                      )}
                      <span className="text-xs text-gray-400">#{idx + 1}</span>
                    </div>
                    <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-lg">
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.company_detail?.name} • {job.location || 'Remote'} • {job.job_type?.replace('_', ' ')}
                    </p>
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-1">AI Match Score</p>
                      <MatchBar score={score} />
                    </div>
                    {explanation && (
                      <p className="text-xs text-gray-500 mt-2 italic">{explanation}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {job.salary_min && (
                      <span className="text-sm font-medium text-green-600">
                        ₹{Number(job.salary_min).toLocaleString()} - ₹{Number(job.salary_max).toLocaleString()}
                      </span>
                    )}
                    {applied.has(job.id) ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Applied
                      </span>
                    ) : (
                      <button onClick={() => handleApply(job.id)} disabled={applying === job.id}
                        className="btn-primary text-sm px-4 py-2">
                        {applying === job.id ? 'Applying...' : 'Quick Apply'}
                      </button>
                    )}
                    <button onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                      {expanded === job.id ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Details</>}
                    </button>
                  </div>
                </div>
              </div>

              {expanded === job.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Matched Skills ({matched_skills?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {matched_skills?.length > 0 ? matched_skills.map(s => (
                        <span key={s} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">{s}</span>
                      )) : <span className="text-xs text-gray-400">None matched</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-2 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Missing Skills ({missing_skills?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {missing_skills?.length > 0 ? missing_skills.map(s => (
                        <span key={s} className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full border border-red-200">{s}</span>
                      )) : <span className="text-xs text-gray-400">All skills matched! 🎉</span>}
                    </div>
                  </div>
                  {job.description && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Job Description</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                    </div>
                  )}
                  <div className="md:col-span-2 flex gap-2">
                    <Link to={`/jobs/${job.id}`} className="btn-secondary text-sm">View Full Job</Link>
                    <Link to={`/candidate/skill-gap?job=${job.id}`} className="btn-secondary text-sm">Analyze Skill Gap</Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
