import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services'
import { FileText } from 'lucide-react'

const STATUSES = ['', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN']

const statusColor = {
  APPLIED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  SHORTLISTED: 'bg-purple-100 text-purple-700',
  INTERVIEW: 'bg-orange-100 text-orange-700',
  SELECTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
}

export default function AdminApplications() {
  const [apps, setApps] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    adminService.getApplications({ status: statusFilter })
      .then(({ data }) => { setApps(data.applications); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-red-600" />
        <h1 className="text-xl font-black text-slate-900">Applications <span className="text-slate-400 font-normal text-base">({total})</span></h1>
      </div>

      <div className="flex gap-3">
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
        ) : apps.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No applications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Job</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">AI Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.candidate}</td>
                    <td className="px-4 py-3 text-slate-500">{a.candidate_email}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{a.job}</td>
                    <td className="px-4 py-3 text-slate-400">{a.company}</td>
                    <td className="px-4 py-3 text-center">
                      {a.ai_match_score != null
                        ? <span className={`font-bold ${a.ai_match_score >= 85 ? 'text-green-600' : a.ai_match_score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {Math.round(a.ai_match_score)}%
                          </span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(a.applied_at).toLocaleDateString()}</td>
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
