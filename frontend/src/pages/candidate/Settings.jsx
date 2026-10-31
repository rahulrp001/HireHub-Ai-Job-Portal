import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { Settings as SettingsIcon, Lock, User, Check } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const changePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' })
      return
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
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" /> Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-xs">Full Name</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.first_name} {user?.last_name}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.email}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-xs">Role</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.role}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-400 text-xs">Member Since</p>
            <p className="font-medium text-gray-900 mt-0.5">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-blue-600" /> Change Password
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
              {pwMsg.type === 'success' && <Check className="h-4 w-4" />}
              {pwMsg.text}
            </div>
          )}
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h2 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" /> Danger Zone
        </h2>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium text-red-800 text-sm">Delete Account</p>
          <p className="text-red-600 text-xs mt-1 mb-3">This action is permanent and cannot be undone. All your data will be deleted.</p>
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
