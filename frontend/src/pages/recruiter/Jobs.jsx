import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { jobService } from '../../services'
import { Plus, Trash2, Eye, Users, ToggleLeft, ToggleRight, Search, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_COLORS = {
  PUBLISHED: 'bg-green-50 text-green-700 border-green-200',
  DRAFT: 'bg-gray-50 text-gray-600 border-gray-200',
  CLOSED: 'bg-red-50 text-red-600 border-red-200',
}

const PAGE_SIZE = 25

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pollRef = useRef(null)

  const loadJobs = () => {
    jobService.getMyJobs()
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadJobs()
    pollRef.current = setInterval(loadJobs, 30000)
    return () => clearInterval(pollRef.current)
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

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
      if (!matchesStatus) return false

      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      const titleMatch = job.title?.toLowerCase().includes(q)
      const locMatch = job.location?.toLowerCase().includes(q)
      const skillsMatch = Array.isArray(job.required_skills) && 
        job.required_skills.some(s => s.toLowerCase().includes(q))

      return titleMatch || locMatch || skillsMatch
    })
  }, [jobs, statusFilter, searchTerm])

  const totalPages = Math.ceil(filteredJobs.length / PAGE_SIZE) || 1
  const currentPageClamped = Math.min(currentPage, totalPages)

  const paginatedJobs = useMemo(() => {
    const start = (currentPageClamped - 1) * PAGE_SIZE
    return filteredJobs.slice(start, start + PAGE_SIZE)
  }, [filteredJobs, currentPageClamped])

  const publishedCount = jobs.filter(j => j.status === 'PUBLISHED').length
  const closedCount = jobs.filter(j => j.status === 'CLOSED').length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Job Postings</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Total <span className="font-bold text-gray-800">{jobs.length.toLocaleString()}</span> jobs ({publishedCount.toLocaleString()} active / published)
          </p>
        </div>
        <Link to="/recruiter/jobs/create" className="btn-primary flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Post New Job
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by title, location, or skill..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl self-start md:self-auto">
          {[
            { key: 'ALL', label: `All (${jobs.length})` },
            { key: 'PUBLISHED', label: `Published (${publishedCount})` },
            { key: 'CLOSED', label: `Closed (${closedCount})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-400 mb-4">No jobs posted yet</p>
          <Link to="/recruiter/jobs/create" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Post Your First Job
          </Link>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 text-center py-12 px-4 shadow-sm">
          <p className="text-gray-500 font-medium">No jobs matching "{searchTerm}"</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            className="mt-3 text-xs font-bold text-blue-600 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedJobs.map(job => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    📍 {job.location || 'Remote'} • {job.job_type?.replace('_', ' ')} • {job.work_mode?.replace('_', ' ')}
                    {job.salary_min && ` • ₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}`}
                  </p>
                  {job.required_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {job.required_skills.slice(0, 6).map(s => (
                        <span key={s} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-md font-medium">
                          {s}
                        </span>
                      ))}
                      {job.required_skills.length > 6 && (
                        <span className="text-xs text-gray-400 self-center">+{job.required_skills.length - 6} more</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2.5">
                    Posted {new Date(job.created_at).toLocaleDateString('en-IN')}
                    {job.application_deadline && ` • Deadline: ${new Date(job.application_deadline).toLocaleDateString('en-IN')}`}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200" title="Total Applications">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>{job.applications_count || 0}</span>
                  </div>
                  <button 
                    onClick={() => toggleStatus(job)} 
                    className="text-gray-400 hover:text-blue-600 transition-colors p-1" 
                    title={job.status === 'PUBLISHED' ? 'Deactivate / Close job' : 'Publish job'}
                  >
                    {job.status === 'PUBLISHED' ? <ToggleRight className="h-6 w-6 text-green-500" /> : <ToggleLeft className="h-6 w-6" />}
                  </button>
                  <Link to={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Job Details">
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(job.id)} 
                    disabled={deleting === job.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Job"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200 px-1">
              <span className="text-xs text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-800">{((currentPageClamped - 1) * PAGE_SIZE) + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPageClamped * PAGE_SIZE, filteredJobs.length)}</span> of <span className="font-bold text-gray-800">{filteredJobs.length.toLocaleString()}</span> jobs
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPageClamped <= 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Prev
                </button>
                <span className="text-xs font-bold text-gray-700 px-2">
                  Page {currentPageClamped} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPageClamped >= totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
