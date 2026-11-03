import { useState, useEffect, useRef } from 'react'
import { resumeService } from '../../services'
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock, Zap, TrendingUp } from 'lucide-react'

const SCORE_TIPS = [
  { key: 'has_email', label: 'Email address present', points: 10 },
  { key: 'has_phone', label: 'Phone number present', points: 10 },
  { key: 'has_name', label: 'Name detected', points: 10 },
  { key: 'has_skills', label: 'Skills extracted (5+)', points: 25 },
  { key: 'has_many_skills', label: 'Strong skill set (10+)', points: 15 },
  { key: 'has_education', label: 'Education info present', points: 15 },
  { key: 'has_experience', label: 'Work experience present', points: 15 },
]

function scoreResume(resume) {
  const checks = {
    has_email: !!resume.extracted_email,
    has_phone: !!resume.extracted_phone,
    has_name: !!resume.extracted_name,
    has_skills: (resume.extracted_skills?.length || 0) >= 5,
    has_many_skills: (resume.extracted_skills?.length || 0) >= 10,
    has_education: (resume.extracted_education?.length || 0) > 0 || resume.parsed_text?.toLowerCase().includes('education'),
    has_experience: (resume.extracted_experience?.length || 0) > 0 || resume.parsed_text?.toLowerCase().includes('experience'),
  }
  const score = SCORE_TIPS.reduce((acc, tip) => acc + (checks[tip.key] ? tip.points : 0), 0)
  return { score, checks }
}

const STATUS_CONFIG = {
  COMPLETED: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle, label: 'Parsed' },
  PROCESSING: { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, label: 'Processing' },
  FAILED: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle, label: 'Failed' },
  PENDING: { color: 'text-gray-600', bg: 'bg-gray-50', icon: Clock, label: 'Pending' },
}

export default function Resume() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    resumeService.getResumes()
      .then(({ data }) => {
        const list = data.resumes || []
        setResumes(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const { data } = await resumeService.uploadResume(formData)
      const newResume = data.resume
      setResumes(prev => [newResume, ...prev])
      setSelected(newResume)
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await resumeService.deleteResume(id)
      const updated = resumes.filter(r => r.id !== id)
      setResumes(updated)
      setSelected(updated[0] || null)
    } catch {}
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  const scoreData = selected?.parsing_status === 'COMPLETED' ? scoreResume(selected) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Manager</h1>
        <p className="text-gray-500 mt-1">Upload your resume — AI will parse and score it automatically</p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
          onChange={e => handleUpload(e.target.files[0])} />
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-blue-600 font-medium">Uploading & parsing resume...</p>
          </div>
        ) : (
          <div>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="font-medium text-gray-700">Drop your resume here or click to upload</p>
            <p className="text-sm text-gray-400 mt-1">PDF, DOCX, DOC or TXT • Max 5MB</p>
          </div>
        )}
      </div>

      {resumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume list */}
          <div className="space-y-2">
            <h2 className="font-semibold text-gray-700 text-sm">Uploaded Resumes</h2>
            {resumes.map(r => {
              const cfg = STATUS_CONFIG[r.parsing_status] || STATUS_CONFIG.PENDING
              const Icon = cfg.icon
              return (
                <div key={r.id} onClick={() => setSelected(r)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selected?.id === r.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate">{r.original_filename}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={`flex items-center gap-1 mt-1.5 text-xs ${cfg.color}`}>
                    <Icon className="h-3 w-3" /> {cfg.label}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(r.uploaded_at).toLocaleDateString('en-IN')}</p>
                </div>
              )
            })}
          </div>

          {/* Resume details + score */}
          {selected && (
            <div className="lg:col-span-2 space-y-4">
              {/* AI Score */}
              {scoreData && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" /> AI Resume Score
                    </h3>
                    <div className={`text-2xl font-bold ${scoreData.score >= 70 ? 'text-green-600' : scoreData.score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {scoreData.score}/100
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div className={`h-3 rounded-full transition-all ${scoreData.score >= 70 ? 'bg-green-500' : scoreData.score >= 50 ? 'bg-yellow-500' : 'bg-red-400'}`}
                      style={{ width: `${scoreData.score}%` }} />
                  </div>
                  <div className="space-y-2">
                    {SCORE_TIPS.map(tip => (
                      <div key={tip.key} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {scoreData.checks[tip.key]
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <AlertCircle className="h-4 w-4 text-red-400" />}
                          <span className={scoreData.checks[tip.key] ? 'text-gray-700' : 'text-gray-400'}>{tip.label}</span>
                        </div>
                        <span className={`text-xs font-medium ${scoreData.checks[tip.key] ? 'text-green-600' : 'text-gray-300'}`}>
                          +{tip.points}
                        </span>
                      </div>
                    ))}
                  </div>
                  {scoreData.score < 70 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800 flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> Tips to improve your score:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {SCORE_TIPS.filter(t => !scoreData.checks[t.key]).map(t => (
                          <li key={t.key} className="text-xs text-yellow-700">• {t.label.replace('present', 'is missing — add it')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Parsed data */}
              {selected.parsing_status === 'COMPLETED' && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Parsed Information</h3>
                    {(selected.extracted_name || selected.extracted_phone) && (
                      <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200">
                        Details Detected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-400">Name:</span> <span className="font-bold text-gray-900 ml-2">{selected.extracted_name || '—'}</span></div>
                    <div><span className="text-gray-400">Phone:</span> <span className="font-bold text-gray-900 ml-2">{selected.extracted_phone || '—'}</span></div>
                    <div><span className="text-gray-400">Email:</span> <span className="font-medium ml-2">{selected.extracted_email || '—'}</span></div>
                    <div><span className="text-gray-400">Skills found:</span> <span className="font-medium ml-2">{selected.extracted_skills?.length || 0}</span></div>
                  </div>

                  {selected.extracted_skills?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Extracted Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.extracted_skills.map(s => (
                          <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.extracted_education?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Education Qualifications</p>
                      <div className="space-y-1">
                        {selected.extracted_education.map((e, idx) => (
                          <div key={idx} className="text-xs text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                            <span>{e}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selected.extracted_experience?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-400 mb-2">Experience & Career Level</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.extracted_experience.map((exp, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
