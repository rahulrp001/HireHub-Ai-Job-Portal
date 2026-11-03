import { useState, useEffect } from 'react'
import { adminService } from '../../services'
import { Building2 } from 'lucide-react'

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getCompanies()
      .then(({ data }) => { setCompanies(data.companies); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-red-600" />
        <h1 className="text-xl font-black text-slate-900">Companies <span className="text-slate-400 font-normal text-base">({total})</span></h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" /></div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No companies found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Industry</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Recruiter</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Jobs</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.industry || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.location || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{c.company_size || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{c.recruiter}</td>
                    <td className="px-4 py-3 text-slate-400">{c.recruiter_email}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-700">{c.job_count}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
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
