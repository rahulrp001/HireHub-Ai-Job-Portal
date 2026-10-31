import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { jobService, candidateService } from '../../services'
import api from '../../services/api'
import { BarChart2, CheckCircle, XCircle, BookOpen, ExternalLink, Search } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

const LEARNING_RESOURCES = {
  python: [{ name: 'Python for Everybody - Coursera', url: 'https://coursera.org/specializations/python' }, { name: 'Python Tutorial - YouTube', url: 'https://youtube.com/watch?v=_uQrJ0TkZlc' }],
  react: [{ name: 'React Official Docs', url: 'https://react.dev' }, { name: 'React Course - Scrimba', url: 'https://scrimba.com/learn/learnreact' }],
  django: [{ name: 'Django Official Tutorial', url: 'https://docs.djangoproject.com/en/stable/intro/tutorial01/' }, { name: 'Django for Beginners - YouTube', url: 'https://youtube.com/watch?v=rHux0gMZ3Eg' }],
  javascript: [{ name: 'JavaScript.info', url: 'https://javascript.info' }, { name: 'JS Full Course - freeCodeCamp', url: 'https://youtube.com/watch?v=PkZNo7MFNFg' }],
  sql: [{ name: 'SQL Tutorial - W3Schools', url: 'https://w3schools.com/sql' }, { name: 'SQL for Data Analysis - Udacity', url: 'https://udacity.com/course/sql-for-data-analysis--ud198' }],
  docker: [{ name: 'Docker Getting Started', url: 'https://docs.docker.com/get-started' }, { name: 'Docker Tutorial - TechWorld', url: 'https://youtube.com/watch?v=3c-iBn73dDE' }],
  aws: [{ name: 'AWS Free Tier + Docs', url: 'https://aws.amazon.com/free' }, { name: 'AWS Cloud Practitioner - freeCodeCamp', url: 'https://youtube.com/watch?v=SOTamWNgDKc' }],
  'machine learning': [{ name: 'ML Course - Andrew Ng (Coursera)', url: 'https://coursera.org/learn/machine-learning' }, { name: 'ML Crash Course - Google', url: 'https://developers.google.com/machine-learning/crash-course' }],
  typescript: [{ name: 'TypeScript Handbook', url: 'https://typescriptlang.org/docs/handbook/intro.html' }, { name: 'TypeScript Course - Fireship', url: 'https://youtube.com/watch?v=ahCwqrYpIuM' }],
  kubernetes: [{ name: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics' }, { name: 'K8s Full Course - TechWorld', url: 'https://youtube.com/watch?v=X48VuDVv0do' }],
}

function getResources(skill) {
  const key = skill.toLowerCase()
  return LEARNING_RESOURCES[key] || [
    { name: `Search "${skill}" on Coursera`, url: `https://coursera.org/search?query=${encodeURIComponent(skill)}` },
    { name: `Search "${skill}" on YouTube`, url: `https://youtube.com/results?search_query=${encodeURIComponent(skill + ' tutorial')}` },
  ]
}

export default function SkillGap() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    jobService.getJobs({ page: 1 })
      .then(({ data }) => setJobs(data.results || []))
      .catch(() => {})
      .finally(() => setJobsLoading(false))

    const jobId = searchParams.get('job')
    if (jobId) analyzeJob(jobId)
  }, [])

  const analyzeJob = async (jobId) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/candidates/skill-gap/${jobId}/`)
      setAnalysis(data)
      setSelectedJob(jobId)
    } catch {}
    setLoading(false)
  }

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company_detail?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Gap Analyzer</h1>
        <p className="text-gray-500 mt-1">Select a job to see which skills you have and what you need to learn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job selector */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input className="input-field pl-9 text-sm" placeholder="Search jobs..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {jobsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-8">No jobs found</p>
            ) : filteredJobs.map(job => (
              <button key={job.id} onClick={() => analyzeJob(job.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors ${selectedJob == job.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
                <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{job.company_detail?.name} • {job.location || 'Remote'}</p>
                {job.required_skills?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{job.required_skills.length} skills required</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis panel */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Analyzing your skill gap...</p>
              </div>
            </div>
          ) : !analysis ? (
            <div className="card flex items-center justify-center h-64 text-center">
              <div>
                <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Select a job to analyze</h3>
                <p className="text-gray-400 text-sm mt-1">Choose any job from the left panel</p>
              </div>
            </div>
          ) : (
            <>
              {/* Score card */}
              <div className="card">
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%"
                        data={[{ value: analysis.match_percentage, fill: analysis.match_percentage >= 75 ? '#10b981' : analysis.match_percentage >= 50 ? '#f59e0b' : '#ef4444' }]}
                        startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} background={{ fill: '#f3f4f6' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-gray-900">{analysis.match_percentage}%</p>
                    <p className="text-gray-500 mt-1">Overall Match</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {analysis.matched_skills?.length || 0} of {analysis.required_skills?.length || 0} required skills matched
                    </p>
                    <div className={`mt-2 text-sm font-medium ${analysis.match_percentage >= 75 ? 'text-green-600' : analysis.match_percentage >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {analysis.match_percentage >= 75 ? '✅ Strong candidate!' : analysis.match_percentage >= 50 ? '⚡ Good potential, learn missing skills' : '📚 Needs significant skill development'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Matched skills */}
              {analysis.matched_skills?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" /> You Have These Skills ({analysis.matched_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map(skill => (
                      <span key={skill} className="bg-green-50 text-green-700 border border-green-200 text-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills with learning resources */}
              {analysis.missing_skills?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" /> Skills to Learn ({analysis.missing_skills.length})
                  </h3>
                  <div className="space-y-3">
                    {analysis.missing_skills.map(skill => (
                      <div key={skill} className="border border-red-100 rounded-lg p-3 bg-red-50/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800 text-sm">{skill}</span>
                          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Missing</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getResources(skill).map(r => (
                            <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-white border border-blue-100 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                              <BookOpen className="h-3 w-3" /> {r.name} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.missing_skills?.length === 0 && (
                <div className="card text-center py-8 bg-green-50 border-green-200">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-700">Perfect Match! 🎉</h3>
                  <p className="text-green-600 text-sm mt-1">You have all the required skills for this job</p>
                  <Link to="/jobs" className="btn-primary inline-block mt-4">Apply Now</Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
