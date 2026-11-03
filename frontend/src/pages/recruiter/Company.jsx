import { useState, useEffect, useRef } from 'react'
import { companyService } from '../../services'
import { Building2, Edit2, Check, X, Upload, AlertCircle, CheckCircle2, MapPin, Compass } from 'lucide-react'
import LocationInputWithMap from '../../components/common/LocationInputWithMap'
import LocationPickerModal from '../../components/common/LocationPickerModal'

export default function Company() {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [viewMapOpen, setViewMapOpen] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    companyService.getMyCompany()
      .then(({ data }) => {
        setCompany(data.company)
        setForm(data.company || {})
      })
      .catch((err) => {
        console.error('Failed to load company profile:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStartEdit = () => {
    setError('')
    setSuccess('')
    setLogoFile(null)
    setLogoPreview('')
    setForm(company || {})
    setEditing(true)
  }

  const handleCancelEdit = () => {
    setError('')
    setSuccess('')
    setLogoFile(null)
    setLogoPreview('')
    setForm(company || {})
    setEditing(false)
  }

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo image must be less than 5MB')
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const save = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // 1. Prepare clean data
      const companyName = (form.name || '').trim()
      const industry = (form.industry || '').trim()
      const location = (form.location || '').trim()
      const companySize = (form.company_size || '').trim()
      const description = (form.description || '').trim()

      // Website formatting
      let website = (form.website || '').trim()
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`
      }

      // Founded year formatting
      let foundedYear = null
      if (form.founded_year !== undefined && form.founded_year !== null && form.founded_year !== '') {
        const parsed = parseInt(form.founded_year, 10)
        if (!isNaN(parsed) && parsed > 0) {
          foundedYear = parsed
        }
      }

      let payload
      if (logoFile) {
        payload = new FormData()
        payload.append('name', companyName)
        payload.append('industry', industry)
        payload.append('location', location)
        payload.append('website', website)
        payload.append('company_size', companySize)
        if (foundedYear !== null) payload.append('founded_year', foundedYear)
        payload.append('description', description)
        payload.append('logo', logoFile)
      } else {
        payload = {
          name: companyName,
          industry,
          location,
          website,
          company_size: companySize,
          founded_year: foundedYear,
          description,
        }
      }

      const { data } = await companyService.updateCompany(payload)
      setCompany(data.company)
      setForm(data.company || {})
      setEditing(false)
      setLogoFile(null)
      setLogoPreview('')
      setSuccess(data.message || 'Company profile updated successfully!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      console.error('Update company failed:', err)
      const errData = err.response?.data
      let message = 'Failed to update company profile. Please try again.'

      if (errData) {
        if (typeof errData === 'string') {
          message = errData
        } else if (errData.message) {
          message = errData.message
        } else if (errData.detail) {
          message = errData.detail
        } else if (typeof errData === 'object') {
          message = Object.entries(errData)
            .map(([field, msgs]) => {
              const text = Array.isArray(msgs) ? msgs.join(', ') : msgs
              const label = field.replace('_', ' ')
              return `${label.charAt(0).toUpperCase() + label.slice(1)}: ${text}`
            })
            .join(' | ')
        }
      }
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  const activeLogo = logoPreview || company?.logo

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
              <Check className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCancelEdit} disabled={saving} className="btn-secondary text-sm flex items-center gap-1">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleStartEdit} className="btn-secondary text-sm flex items-center gap-2">
            <Edit2 className="h-4 w-4" /> Edit Profile
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
          <span>{success}</span>
        </div>
      )}

      <div className="card">
        {/* Header with Logo */}
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="relative group">
            {activeLogo ? (
              <img
                src={activeLogo}
                alt={company?.name || 'Company'}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
                <Building2 className="h-10 w-10 text-indigo-600" />
              </div>
            )}

            {editing && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity text-xs font-semibold"
                  title="Upload company logo"
                >
                  <Upload className="h-5 w-5 mb-1" />
                  <span>Logo</span>
                </button>
              </>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{company?.name || 'Your Company'}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{company?.industry || 'Industry not set'}</p>
            {company?.location && (
              <p className="text-gray-400 text-xs mt-1">📍 {company.location}</p>
            )}
          </div>
        </div>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Company Name', placeholder: 'Your company name' },
              { key: 'industry', label: 'Industry', placeholder: 'e.g. Technology, Finance, Healthcare' },
              { key: 'location', label: 'Location / Headquarters', placeholder: 'e.g. Bangalore, India', isMap: true },
              { key: 'website', label: 'Website', placeholder: 'e.g. https://yourcompany.com or yourcompany.com' },
              { key: 'company_size', label: 'Company Size', placeholder: 'e.g. 50-200 employees' },
              { key: 'founded_year', label: 'Founded Year', type: 'number', placeholder: 'e.g. 2020' },
            ].map(({ key, label, placeholder, type, isMap }) => (
              <div key={key}>
                {isMap ? (
                  <LocationInputWithMap
                    label={label}
                    placeholder={placeholder}
                    value={form[key] ?? ''}
                    onChange={(loc) => setForm((f) => ({ ...f, [key]: loc }))}
                    buttonLabel="Map"
                  />
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type={type || 'text'}
                      className="input-field"
                      placeholder={placeholder}
                      value={form[key] ?? ''}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </>
                )}
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
              <textarea
                className="input-field"
                rows={4}
                placeholder="Tell candidates about your company culture, mission, and achievements..."
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {[
              { key: 'name', label: 'Company Name', value: company?.name },
              { key: 'industry', label: 'Industry', value: company?.industry },
              { key: 'location', label: 'Location', value: company?.location, isLocation: true },
              { key: 'website', label: 'Website', value: company?.website, link: true },
              { key: 'company_size', label: 'Company Size', value: company?.company_size },
              { key: 'founded_year', label: 'Founded Year', value: company?.founded_year },
            ].map(({ key, label, value, link, isLocation }) => (
              <div key={label} className="p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-gray-400 text-xs block mb-0.5">{label}</span>
                {link && value ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium hover:underline break-all"
                  >
                    {value}
                  </a>
                ) : isLocation && value ? (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{value}</span>
                    <button
                      type="button"
                      onClick={() => setViewMapOpen(true)}
                      className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md"
                    >
                      <Compass className="h-3 w-3" /> Map
                    </button>
                  </div>
                ) : (
                  <span className="font-semibold text-gray-900">{value || '—'}</span>
                )}
              </div>
            ))}
            {company?.description && (
              <div className="md:col-span-2 p-4 bg-gray-50/70 rounded-xl border border-gray-100">
                <span className="text-gray-400 text-xs block mb-1">About Company</span>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{company.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View / Explore Location Map Modal */}
      <LocationPickerModal
        isOpen={viewMapOpen}
        onClose={() => setViewMapOpen(false)}
        initialLocation={company?.location || ''}
        onSelectLocation={(loc) => {
          // If in edit mode, update form location
          if (editing) setForm(f => ({ ...f, location: loc }))
        }}
      />
    </div>
  )
}
