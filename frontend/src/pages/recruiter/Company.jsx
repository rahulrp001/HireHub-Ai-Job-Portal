import { useState, useEffect } from 'react'
import { companyService } from '../../services'
import { Building2, Edit2, Check, X } from 'lucide-react'

export default function Company() {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    companyService.getMyCompany()
      .then(({ data }) => { setCompany(data.company); setForm(data.company || {}) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await companyService.updateCompany(form)
      setCompany(data.company)
      setEditing(false)
    } catch {}
    setSaving(false)
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
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-500 mt-1">Manage your company information</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-1">
              <Check className="h-3 w-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-secondary text-sm flex items-center gap-2">
            <Edit2 className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Building2 className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company?.name || 'Your Company'}</h2>
            <p className="text-gray-500">{company?.industry || 'Industry not set'}</p>
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Company Name', placeholder: 'Your company name' },
              { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology, Finance' },
              { key: 'location', label: 'Location', placeholder: 'e.g. Bangalore, India' },
              { key: 'website', label: 'Website', placeholder: 'https://yourcompany.com' },
              { key: 'company_size', label: 'Company Size', placeholder: 'e.g. 50-200 employees' },
              { key: 'founded_year', label: 'Founded Year', type: 'number', placeholder: '2020' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type || 'text'} className="input-field" placeholder={placeholder}
                  value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input-field" rows={4} placeholder="Tell candidates about your company..."
                value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Industry', value: company?.industry },
              { label: 'Location', value: company?.location },
              { label: 'Website', value: company?.website, link: true },
              { label: 'Company Size', value: company?.company_size },
              { label: 'Founded Year', value: company?.founded_year },
            ].map(({ label, value, link }) => (
              <div key={label}>
                <span className="text-gray-400">{label}:</span>
                {link && value
                  ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">{value}</a>
                  : <span className="font-medium text-gray-900 ml-2">{value || '—'}</span>}
              </div>
            ))}
            {company?.description && (
              <div className="md:col-span-2">
                <span className="text-gray-400">About:</span>
                <p className="text-gray-700 mt-1">{company.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
