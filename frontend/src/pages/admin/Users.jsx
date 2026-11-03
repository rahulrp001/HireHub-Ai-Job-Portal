import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../../services'
import { Search, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react'

const ROLES = ['', 'CANDIDATE', 'RECRUITER', 'ADMIN']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [actionId, setActionId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    adminService.getUsers({ search, role })
      .then(({ data }) => { setUsers(data.users); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, role])

  useEffect(() => { load() }, [load])

  const handleToggle = async (u) => {
    setActionId(u.id)
    await adminService.toggleUser(u.id, !u.is_active).catch(() => {})
    setActionId(null)
    load()
  }

  const handleDelete = async (u) => {
    if (!confirm(`Delete user "${u.email}"? This cannot be undone.`)) return
    setActionId(u.id)
    await adminService.deleteUser(u.id).catch(() => {})
    setActionId(null)
    load()
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-red-600" />
        <h1 className="text-xl font-black text-slate-900">Users <span className="text-slate-400 font-normal text-base">({total})</span></h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          value={role}
          onChange={e => setRole(e.target.value)}
        >
          {ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.first_name} {u.last_name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'CANDIDATE' ? 'bg-emerald-100 text-emerald-700' :
                        u.role === 'RECRUITER' ? 'bg-violet-100 text-violet-700' :
                        'bg-red-100 text-red-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(u)}
                          disabled={actionId === u.id || u.role === 'ADMIN'}
                          title={u.is_active ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                          {u.is_active
                            ? <ToggleRight className="h-5 w-5 text-green-600" />
                            : <ToggleLeft className="h-5 w-5 text-slate-400" />}
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={actionId === u.id || u.role === 'ADMIN'}
                          title="Delete user"
                          className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
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
