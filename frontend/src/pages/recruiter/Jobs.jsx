import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../../services'
import { Plus, Edit2, Trash2, Eye, Users, ToggleLeft, ToggleRight } from 'lucide-react'

const STATUS_COLORS = {
  PUBLISHED: 'bg-green-50 text-green-700',
  DRAFT: 'bg-gray-50 text-gray-600',
  CLOSED: 'bg-red-50 text-red-600',
}

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    jobService.getMyJobs()
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job? This cannot be undone.')) return
    setDeleting(id)
    try {
      await jobService.deleteJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
    } catch {}
    setDeleting(null)
  }

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED'
    try {
      await jobService.updateJob(job.id, { status: newStatus })
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j))
    } catch {}
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 mt-1">{jobs.length} job posting{jobs.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">No jobs posted yet</p>
          <Link to="/recruiter/jobs/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status]}`}>{job.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {job.location || 'Remote'} • {job.job_type?.replace('_', ' ')} • {job.work_mode?.replace('_', ' ')}
                    {job.salary_min && ` • ₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}`}
                  </p>
                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.required_skills.slice(0, 5).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted {new Date(job.created_at).toLocaleDateString('en-IN')}
                    {job.application_deadline && ` • Deadline: ${new Date(job.application_deadline).toLocaleDateString('en-IN')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{job.applications_count || 0}</span>
                  </div>
                  <button onClick={() => toggleStatus(job)} className="text-gray-400 hover:text-blue-600 transition-colors" title={job.status === 'PUBLISHED' ? 'Close job' : 'Publish job'}>
                    {job.status === 'PUBLISHED' ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <Link to={`/jobs/${job.id}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(job.id)} disabled={deleting === job.id}
                    className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
