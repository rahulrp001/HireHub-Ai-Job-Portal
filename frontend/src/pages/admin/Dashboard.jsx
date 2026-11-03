import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { adminService } from '../../services'
import { Users, Briefcase, Building2, FileText, Shield, TrendingUp, UserCheck, UserX } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const fetchStats = () => {
    adminService.getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
    pollRef.current = setInterval(fetchStats, 30000)
    return () => clearInterval(pollRef.current)
  }, [])

  const cards = [
    { label: 'Total Users', value: stats?.total_users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', to: '/admin/users' },
    { label: 'Candidates', value: stats?.candidates, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', to: '/admin/users?role=CANDIDATE' },
    { label: 'Recruiters', value: stats?.recruiters, icon: UserX, color: 'text-violet-600', bg: 'bg-violet-50', to: '/admin/users?role=RECRUITER' },
    { label: 'Total Jobs', value: stats?.total_jobs, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', to: '/admin/jobs' },
    { label: 'Active Jobs', value: stats?.active_jobs, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', to: '/admin/jobs?status=PUBLISHED' },
    { label: 'Applications', value: stats?.total_applications, icon: FileText, color: 'text-pink-600', bg: 'bg-pink-50', to: '/admin/applications' },
    { label: 'Companies', value: stats?.total_companies, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50', to: '/admin/companies' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-2xl p-6 text-white flex items-center gap-4">
        <Shield className="h-10 w-10 opacity-80" />
        <div>
          <h1 className="text-2xl font-black">Super Admin Panel</h1>
          <p className="text-red-200 text-sm">Welcome, {user?.first_name}. Full system access granted.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg, to }) => (
          <Link key={label} to={to} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color} shrink-0`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{value ?? '—'}</div>
              <div className="text-xs text-slate-500 font-semibold">{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {stats?.recent_users?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
            <Link to="/admin/users" className="text-sm text-red-600 font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-semibold">Name</th>
                  <th className="pb-2 font-semibold">Email</th>
                  <th className="pb-2 font-semibold">Role</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.recent_users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{u.first_name} {u.last_name}</td>
                    <td className="py-2.5 text-slate-500">{u.email}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'CANDIDATE' ? 'bg-emerald-100 text-emerald-700' :
                        u.role === 'RECRUITER' ? 'bg-violet-100 text-violet-700' :
                        'bg-red-100 text-red-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
