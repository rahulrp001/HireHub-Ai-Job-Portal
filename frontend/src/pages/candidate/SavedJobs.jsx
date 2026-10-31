import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService, applicationService } from '../../services'
import { BookmarkCheck, MapPin, Briefcase, Clock, Trash2 } from 'lucide-react'

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [applied, setApplied] = useState(new Set())

  useEffect(() => {
    Promise.all([jobService.getSavedJobs(), applicationService.getMyApplications()])
      .then(([savedRes, appRes]) => {
        setSavedJobs(savedRes.data.saved_jobs || [])
        setApplied(new Set((appRes.data.applications || []).map(a => a.job)))
      }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleUnsave = async (jobId) => {
    try {
      await jobService.saveJob(jobId)
      setSavedJobs(prev => prev.filter(j => j.id !== jobId))
    } catch {}
  }

  const handleApply = async (jobId) => {
    setApplying(jobId)
    try {
      await applicationService.apply(jobId, {})
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
        <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
        <p className="text-gray-500 mt-1">{savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="card text-center py-16">
          <BookmarkCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No saved jobs yet</h3>
          <Link to="/jobs" className="btn-primary inline-block mt-4">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map(job => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600">{job.title}</Link>
                  <p className="text-sm text-gray-500 mt-0.5">{job.company_detail?.name}</p>
                </div>
                <button onClick={() => handleUnsave(job.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.job_type?.replace('_', ' ')}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.work_mode?.replace('_', ' ')}</span>
              </div>
              {job.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.required_skills.slice(0, 4).map(s => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between mt-auto">
                {job.salary_min && (
                  <span className="text-sm font-medium text-green-600">
                    ₹{Number(job.salary_min).toLocaleString()} - ₹{Number(job.salary_max).toLocaleString()}
                  </span>
                )}
                {applied.has(job.id) ? (
                  <span className="text-xs text-green-600 font-medium ml-auto">✓ Applied</span>
                ) : (
                  <button onClick={() => handleApply(job.id)} disabled={applying === job.id}
                    className="btn-primary text-sm ml-auto">
                    {applying === job.id ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
