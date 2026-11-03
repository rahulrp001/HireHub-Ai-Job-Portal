import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services'
import { Search, Trash2, Briefcase } from 'lucide-react'

const STATUSES = ['', 'DRAFT', 'PUBLISHED', 'CLOSED']

const statusColor = {
  PUBLISHED: 'bg-green-100 text-green-700',
  DRAFT: 'bg-yellow-100 text-yellow-700',
  CLOSED: 'bg-slate-100 text-slate-500',
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [actionId, setActionId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminService.getJobs({ search, status: statusFilter })
      .then(({ data }) => { setJobs(data.jobs); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, statusFilter])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (job, newStatus) => {
    setActionId(job.id)
    await adminService.updateJobStatus(job.id, newStatus).catch(() => {})
    setActionId(null)
    load()
  }

  const handleDelete = async (job) => {
    if (!confirm(`Delete job "${job.title}"? This cannot be undone.`)) return
    setActionId(job.id)
    await adminService.deleteJob(job.id).catch(() => {})
    setActionId(null)
    load()
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Briefcase className="h-6 w-6 text-red-600" />
        <h1 className="text-xl font-black text-slate-900">Jobs <span className="text-slate-400 font-normal text-base">({total})</span></h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Search by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No jobs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Recruiter</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Apps</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">{j.title}</td>
                    <td className="px-4 py-3 text-slate-500">{j.company}</td>
                    <td className="px-4 py-3 text-slate-500">{j.recruiter}</td>
                    <td className="px-4 py-3 text-slate-400">{j.location || '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{j.job_type}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{j.application_count}</td>
                    <td className="px-4 py-3">
                      <select
                        value={j.status}
                        disabled={actionId === j.id}
                        onChange={e => handleStatusChange(j, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none ${statusColor[j.status]}`}
                      >
                        {['DRAFT', 'PUBLISHED', 'CLOSED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(j)}
                        disabled={actionId === j.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
