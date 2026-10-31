import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { jobService, aiService } from '../../services'
import { Brain, ChevronDown, ChevronUp, Search, Code, Users, Lightbulb, CheckCircle, Clock, Star } from 'lucide-react'

const CATEGORY_CONFIG = {
  technical: { label: 'Technical', icon: Code, color: 'blue' },
  practical: { label: 'Practical / Coding', icon: Lightbulb, color: 'purple' },
  hr: { label: 'HR / Behavioral', icon: Users, color: 'green' },
}

function QuestionCard({ question, index, category }) {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [marked, setMarked] = useState(false)

  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${marked ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border ${colors[category]}`}>
          {index + 1}
        </span>
        <p className="text-sm font-medium text-gray-800 flex-1 leading-relaxed">{question}</p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {marked && <CheckCircle className="h-4 w-4 text-green-500" />}
          {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">✍️ Practice your answer:</p>
            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
              rows={4}
              placeholder="Type your answer here to practice. The more you write, the better prepared you'll be..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
          </div>
          {answer.length > 30 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Good answer! Review and refine it.
              </p>
              <button
                onClick={() => setMarked(!marked)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${marked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700'}`}>
                {marked ? '✅ Marked Done' : 'Mark as Done'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function InterviewPrep() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('technical')
  const [search, setSearch] = useState('')

  useEffect(() => {
    jobService.getJobs({ page: 1 })
      .then(({ data }) => setJobs(data.results || []))
      .catch(() => {})
      .finally(() => setJobsLoading(false))

    const jobId = searchParams.get('job')
    if (jobId) loadQuestions(jobId)
  }, [])

  const loadQuestions = async (jobId) => {
    setLoading(true)
    setQuestions(null)
    try {
      const { data } = await aiService.getInterviewPrep(jobId)
      setQuestions(data.questions)
      setJobTitle(data.job_title)
      setCompany(data.company || '')
      setSelectedJob(jobId)
      setActiveTab('technical')
    } catch (err) {
      alert('Could not load questions. Make sure backend is running.')
    }
    setLoading(false)
  }

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.company_detail?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const totalQ = questions ? Object.values(questions).reduce((a, b) => a + b.length, 0) : 0
  const currentQ = questions?.[activeTab] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Prep AI</h1>
          <p className="text-gray-500 text-sm">Select a job → get AI-generated questions → practice answers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Job Selector */}
        <div className="card p-0 overflow-hidden h-fit">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="font-semibold text-gray-700 text-sm mb-3">Select a Job</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input className="input-field pl-9 text-sm" placeholder="Search jobs..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
            {jobsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-400 text-sm">No jobs found</p>
                <Link to="/jobs" className="text-blue-600 text-xs hover:underline mt-1 block">Browse all jobs</Link>
              </div>
            ) : filteredJobs.map(job => (
              <button key={job.id} onClick={() => loadQuestions(job.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-purple-50 transition-colors ${selectedJob == job.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''}`}>
                <p className="font-medium text-gray-900 text-sm leading-tight">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{job.company_detail?.name || 'Company'}</p>
                {job.required_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {job.required_skills.slice(0, 3).map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="text-xs text-gray-400">+{job.required_skills.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Questions Panel */}
        <div className="lg:col-span-2 space-y-4">

          {/* Loading */}
          {loading && (
            <div className="card flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Generating interview questions...</p>
                <p className="text-gray-400 text-sm mt-1">AI is analyzing the job requirements</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !questions && (
            <div className="card flex items-center justify-center h-64 text-center">
              <div>
                <Brain className="h-14 w-14 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-500">Select a job to start</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                  AI will generate technical, practical, and HR questions specific to that job
                </p>
              </div>
            </div>
          )}

          {/* Questions loaded */}
          {!loading && questions && (
            <>
              {/* Job info banner */}
              <div className="card bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-lg">{jobTitle}</h2>
                    {company && <p className="text-purple-200 text-sm">{company}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1 text-purple-100">
                        <Star className="h-4 w-4" /> {totalQ} questions
                      </span>
                      <span className="flex items-center gap-1 text-purple-100">
                        <Clock className="h-4 w-4" /> ~{Math.ceil(totalQ * 3)} min prep
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-purple-200">
                    <p>Click any question</p>
                    <p>to practice answer</p>
                  </div>
                </div>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  const count = questions[key]?.length || 0
                  const tabColors = {
                    blue: activeTab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50',
                    purple: activeTab === key ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-purple-50',
                    green: activeTab === key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-green-50',
                  }
                  return (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tabColors[cfg.color]}`}>
                      <Icon className="h-4 w-4" />
                      {cfg.label}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-white/20' : 'bg-gray-100'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Questions list */}
              <div className="space-y-2">
                {currentQ.length === 0 ? (
                  <div className="card text-center py-10 text-gray-400">
                    <p>No questions in this category</p>
                  </div>
                ) : currentQ.map((q, i) => (
                  <QuestionCard key={`${activeTab}-${i}`} question={q} index={i} category={CATEGORY_CONFIG[activeTab].color} />
                ))}
              </div>

              {/* Tips */}
              <div className="card bg-amber-50 border-amber-200">
                <p className="text-sm font-semibold text-amber-800 mb-2">💡 Interview Tips</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Use STAR method for behavioral questions (Situation, Task, Action, Result)</li>
                  <li>• Think out loud during technical questions — explain your approach</li>
                  <li>• Ask clarifying questions before answering complex problems</li>
                  <li>• Prepare 2-3 questions to ask the interviewer at the end</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
