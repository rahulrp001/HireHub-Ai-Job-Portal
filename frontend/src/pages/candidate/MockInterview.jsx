import { useState, useEffect, useRef } from 'react'
import { jobService, aiService } from '../../services'
import { Mic, MicOff, Play, RotateCcw, CheckCircle, Clock, ChevronRight, Search, Brain, Star, AlertCircle } from 'lucide-react'

const DIFFICULTY = ['Easy', 'Medium', 'Hard']

function Timer({ running, onEnd, duration, resetKey }) {
  const [left, setLeft] = useState(duration)

  useEffect(() => {
    setLeft(duration)
  }, [resetKey, duration])

  useEffect(() => {
    if (!running) return
    if (left <= 0) { onEnd(); return }
    const t = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [running, left])

  const pct = (left / duration) * 100
  const color = left < 30 ? 'text-red-500' : left < 60 ? 'text-yellow-500' : 'text-green-600'
  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${color}`} />
      <span className={`font-mono font-bold text-lg ${color}`}>
        {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
      </span>
      <div className="w-24 bg-gray-200 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${left < 30 ? 'bg-red-500' : left < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MockInterview() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [timerRunning, setTimerRunning] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [phase, setPhase] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)
  const timerResetKey = useRef(0)

  const DURATION = difficulty === 'Easy' ? 180 : difficulty === 'Medium' ? 120 : 90

  useEffect(() => {
    jobService.getJobs({ page: 1 })
      .then(({ data }) => setJobs(data.results || []))
      .catch(() => {})
      .finally(() => setJobsLoading(false))
  }, [])

  // Speech recognition setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-US'
    r.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setAnswer(transcript)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    recognitionRef.current = r
  }, [])

  const startInterview = async () => {
    if (!selectedJob) return
    setLoading(true)
    setError('')
    try {
      const { data } = await aiService.getInterviewPrep(selectedJob.id)
      const q = data.questions || {}
      const all = [
        ...(q.technical || []),
        ...(q.practical || []),
        ...(q.hr || []),
      ]
      if (all.length === 0) {
        setError('No questions found for this job. Try a job with required skills.')
        setLoading(false)
        return
      }
      const count = difficulty === 'Easy' ? 3 : difficulty === 'Medium' ? 5 : 7
      setQuestions(all.slice(0, Math.min(count, all.length)))
      setAnswers([])
      setCurrent(0)
      setAnswer('')
      setTimeUp(false)
      timerResetKey.current = 0
      setPhase('interview')
      setTimerRunning(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load questions. Make sure backend is running.')
    }
    setLoading(false)
  }

  const handleTimeUp = () => {
    setTimeUp(true)
    setTimerRunning(false)
    stopListening()
  }

  const nextQuestion = () => {
    const saved = [...answers, { question: questions[current], answer, timeUp }]
    setAnswers(saved)
    setAnswer('')
    setTimeUp(false)
    stopListening()
    if (current + 1 >= questions.length) {
      setPhase('result')
      setTimerRunning(false)
    } else {
      timerResetKey.current += 1
      setCurrent(c => c + 1)
      setTimerRunning(true)
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch {}
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop()
      setListening(false)
    }
  }

  const reset = () => {
    setPhase('setup')
    setQuestions([])
    setAnswers([])
    setCurrent(0)
    setAnswer('')
    setTimerRunning(false)
    setTimeUp(false)
    setError('')
    stopListening()
  }

  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.company_detail?.name || '').toLowerCase().includes(search.toLowerCase())
  )

  // ── SETUP PHASE ──
  if (phase === 'setup') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
            <p className="text-gray-500 text-sm">Practice real interview with timer & voice input</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job selector */}
          <div className="card p-0 overflow-hidden h-fit">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <p className="font-semibold text-gray-700 text-sm mb-3">1. Select a Job</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="input-field pl-9 text-sm" placeholder="Search jobs..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {jobsLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
              ) : filteredJobs.length === 0 ? (
                <p className="text-center text-gray-400 text-sm p-6">No jobs found</p>
              ) : filteredJobs.map(job => (
                <button key={job.id} onClick={() => { setSelectedJob(job); setError('') }}
                  className={`w-full text-left p-4 border-b border-gray-50 hover:bg-indigo-50 transition-colors ${selectedJob?.id === job.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}>
                  <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.company_detail?.name || 'Company'}</p>
                  {job.required_skills?.length > 0 && (
                    <p className="text-xs text-indigo-500 mt-0.5">{job.required_skills.slice(0, 3).join(', ')}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Config + start */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <p className="font-semibold text-gray-700 mb-3">2. Choose Difficulty</p>
              <div className="flex gap-3">
                {DIFFICULTY.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      difficulty === d
                        ? d === 'Easy' ? 'border-green-500 bg-green-50 text-green-700'
                          : d === 'Medium' ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}>
                    {d}
                    <p className="text-xs font-normal mt-0.5">
                      {d === 'Easy' ? '3 Q • 3 min each' : d === 'Medium' ? '5 Q • 2 min each' : '7 Q • 90 sec each'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedJob && (
              <div className="card bg-indigo-50 border border-indigo-200">
                <p className="text-sm font-semibold text-indigo-800">✅ Selected: {selectedJob.title}</p>
                <p className="text-xs text-indigo-600 mt-0.5">{selectedJob.company_detail?.name || 'Company'}</p>
                {selectedJob.required_skills?.length > 0 && (
                  <p className="text-xs text-indigo-500 mt-1">Skills: {selectedJob.required_skills.join(', ')}</p>
                )}
              </div>
            )}

            <div className="card bg-amber-50 border-amber-200">
              <p className="text-sm font-semibold text-amber-800 mb-2">📋 How it works</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Each question has a countdown timer</li>
                <li>• Type your answer OR use 🎤 voice input</li>
                <li>• Answer all questions to get your score</li>
                <li>• Answers with 30+ words count as attempted</li>
              </ul>
            </div>

            <button onClick={startInterview} disabled={!selectedJob || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> Generating questions...</>
              ) : (
                <><Play className="h-5 w-5" /> Start Mock Interview</>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── INTERVIEW PHASE ──
  if (phase === 'interview') {
    const q = questions[current]
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mock Interview</h1>
              <p className="text-gray-500 text-sm">{selectedJob?.title} • {difficulty}</p>
            </div>
          </div>
          <button onClick={reset} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm">
            <RotateCcw className="h-4 w-4" /> Exit
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {questions.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < current ? 'bg-indigo-600' : i === current ? 'bg-indigo-300' : 'bg-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-2 shrink-0">{current + 1}/{questions.length}</span>
        </div>

        {/* Question card */}
        <div className="card border-2 border-indigo-200">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Question {current + 1}
            </span>
            <Timer
              running={timerRunning}
              onEnd={handleTimeUp}
              duration={DURATION}
              resetKey={timerResetKey.current}
            />
          </div>
          <p className="text-gray-900 font-medium text-lg leading-relaxed">{q}</p>
          {timeUp && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
              ⏰ Time's up! Submit your answer or move on.
            </div>
          )}
        </div>

        {/* Answer area */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Your Answer</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {answer.trim().split(/\s+/).filter(Boolean).length} words
              </span>
              {recognitionRef.current && (
                <button onClick={toggleListening}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    listening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}>
                  {listening ? <><MicOff className="h-3.5 w-3.5" /> Stop</> : <><Mic className="h-3.5 w-3.5" /> Voice</>}
                </button>
              )}
            </div>
          </div>
          <textarea
            className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={6}
            placeholder="Type your answer here, or use the 🎤 voice button to speak..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
          />
          <button onClick={nextQuestion}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {current + 1 >= questions.length ? (
              <><CheckCircle className="h-5 w-5" /> Finish Interview</>
            ) : (
              <>Next Question <ChevronRight className="h-5 w-5" /></>
            )}
          </button>
        </div>
      </div>
    )
  }

  // ── RESULT PHASE ──
  const attempted = answers.filter(a => a.answer.trim().split(/\s+/).filter(Boolean).length >= 30).length
  const finalScore = answers.length > 0 ? Math.round((attempted / answers.length) * 100) : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Score card */}
      <div className="card bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-center">
        <div className="text-5xl font-black mb-2">{finalScore}%</div>
        <p className="text-indigo-200 text-sm">Interview Score</p>
        <p className="text-white font-semibold mt-1">
          {finalScore >= 80 ? '🎉 Excellent! You are well prepared.'
            : finalScore >= 50 ? '👍 Good effort! Keep practicing.'
            : '📚 Needs more practice. Review your answers.'}
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div><span className="text-indigo-200">Attempted</span><p className="font-bold text-lg">{attempted}/{answers.length}</p></div>
          <div><span className="text-indigo-200">Job</span><p className="font-bold text-lg truncate max-w-[8rem]">{selectedJob?.title}</p></div>
          <div><span className="text-indigo-200">Difficulty</span><p className="font-bold text-lg">{difficulty}</p></div>
        </div>
      </div>

      {/* Answers review */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Your Answers Review</h2>
        {answers.map((a, i) => {
          const wordCount = a.answer.trim().split(/\s+/).filter(Boolean).length
          const good = wordCount >= 30
          return (
            <div key={i} className={`card border-l-4 ${good ? 'border-l-green-500' : 'border-l-red-400'}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500">Q{i + 1}</p>
                <div className="flex items-center gap-2">
                  {a.timeUp && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">⏰ Time up</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${good ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {wordCount} words {good ? '✓' : '— too short'}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2">{a.question}</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
                {a.answer.trim() || <span className="text-gray-400 italic">No answer given</span>}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={reset} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
        <button onClick={() => { reset(); setSelectedJob(null) }}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <Star className="h-4 w-4" /> New Interview
        </button>
      </div>
    </div>
  )
}
