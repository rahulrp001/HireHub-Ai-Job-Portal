import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Settings as SettingsIcon, Lock, User, Check } from 'lucide-react'

export default function RecruiterSettings() {
  const { user } = useAuth()
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' }); return
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return
    }
    setPwLoading(true)
    try {
      await api.post('/auth/change-password/', { old_password: pwForm.old_password, new_password: pwForm.new_password })
      setPwMsg({ type: 'success', text: 'Password changed successfully!' })
      setPwForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    }
    setPwLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your recruiter account</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" /> Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Full Name', value: `${user?.first_name} ${user?.last_name}` },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-400 text-xs">{label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-600" /> Change Password
        </h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          {[
            { key: 'old_password', label: 'Current Password' },
            { key: 'new_password', label: 'New Password' },
            { key: 'confirm_password', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="password" className="input-field" value={pwForm[key]}
                onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))} required />
            </div>
          ))}
          {pwMsg && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {pwMsg.type === 'success' && <Check className="h-4 w-4" />} {pwMsg.text}
            </div>
          )}
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="card border-red-200">
        <h2 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" /> Danger Zone
        </h2>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium text-red-800 text-sm">Delete Account</p>
          <p className="text-red-600 text-xs mt-1 mb-3">All your jobs and data will be permanently deleted.</p>
          <input className="input-field text-sm mb-3 max-w-xs" placeholder={`Type "DELETE" to confirm`}
            value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} />
          <br />
          <button disabled={deleteConfirm !== 'DELETE'}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  )
}
