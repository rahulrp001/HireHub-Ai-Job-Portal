import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobService } from '../../services'
import { Plus, X, Briefcase } from 'lucide-react'
import LocationInputWithMap from '../../components/common/LocationInputWithMap'

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'Django', 'FastAPI', 'TypeScript',
  'Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Git', 'REST API', 'GraphQL', 'Machine Learning',
  'TensorFlow', 'PyTorch', 'Figma', 'HTML', 'CSS', 'Tailwind', 'Vue.js', 'Angular',
]

const AI_SKILL_MAP = {
  'software engineer': ['Python', 'JavaScript', 'SQL', 'Git', 'REST API', 'Docker'],
  'frontend developer': ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind'],
  'backend developer': ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API', 'Git'],
  'full stack developer': ['React', 'Node.js', 'Python', 'SQL', 'Docker', 'Git'],
  'data scientist': ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'NumPy'],
  'devops engineer': ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Linux', 'CI/CD'],
  'mobile developer': ['React Native', 'Swift', 'Kotlin', 'Java', 'Git'],
  'ui ux designer': ['Figma', 'Photoshop', 'HTML', 'CSS'],
}

function SkillInput({ label, skills, onChange }) {
  const [input, setInput] = useState('')
  const add = (skill) => {
    const s = skill.trim()
    if (s && !skills.includes(s)) onChange([...skills, s])
    setInput('')
  }
  const remove = (s) => onChange(skills.filter(x => x !== s))
  const suggestions = input.length > 1 ? SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !skills.includes(s)) : []

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skills.map(s => (
          <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm px-2.5 py-1 rounded-full">
            {s} <button type="button" onClick={() => remove(s)}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input className="input-field text-sm" placeholder="Type skill and press Enter..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(input) } }} />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-40 overflow-y-auto">
            {suggestions.slice(0, 8).map(s => (
              <button key={s} type="button" onClick={() => add(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-700">{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CreateJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    required_skills: [], preferred_skills: [],
    location: '', job_type: 'FULL_TIME', work_mode: 'ON_SITE',
    salary_min: '', salary_max: '', experience_min: 0, experience_max: '',
    education_required: '', application_deadline: '', status: 'DRAFT',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const autoSuggestSkills = () => {
    const titleLower = form.title.toLowerCase()
    for (const [key, skills] of Object.entries(AI_SKILL_MAP)) {
      if (titleLower.includes(key.split(' ')[0]) || titleLower.includes(key)) {
        set('required_skills', skills)
        return
      }
    }
  }

  const handleSubmit = async (e, status = form.status) => {
    e.preventDefault()
    setLoading(true)
    try {
      await jobService.createJob({ ...form, status })
      navigate('/recruiter/jobs')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create job')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 mt-1">Fill in the details to attract the right candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-600" /> Job Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="e.g. Senior React Developer" required
                value={form.title} onChange={e => set('title', e.target.value)} />
              <button type="button" onClick={autoSuggestSkills}
                className="btn-secondary text-sm px-3 whitespace-nowrap flex items-center gap-1">
                <Plus className="h-3 w-3" /> AI Suggest Skills
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea className="input-field" rows={5} required placeholder="Describe the role, responsibilities, and what makes it exciting..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea className="input-field" rows={3} placeholder="List key requirements..."
                value={form.requirements} onChange={e => set('requirements', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities</label>
              <textarea className="input-field" rows={3} placeholder="List key responsibilities..."
                value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Skills</h2>
          <SkillInput label="Required Skills" skills={form.required_skills} onChange={v => set('required_skills', v)} />
          <SkillInput label="Preferred Skills (Nice to have)" skills={form.preferred_skills} onChange={v => set('preferred_skills', v)} />
        </div>

        {/* Job Meta */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <LocationInputWithMap
                label="Location"
                placeholder="e.g. Bangalore, India"
                value={form.location}
                onChange={(loc) => set('location', loc)}
                buttonLabel="Pick on Map"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
              <select className="input-field" value={form.job_type} onChange={e => set('job_type', e.target.value)}>
                {['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select className="input-field" value={form.work_mode} onChange={e => set('work_mode', e.target.value)}>
                {['REMOTE', 'HYBRID', 'ON_SITE'].map(m => (
                  <option key={m} value={m}>{m.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (₹)</label>
              <input type="number" className="input-field" placeholder="e.g. 500000" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary (₹)</label>
              <input type="number" className="input-field" placeholder="e.g. 1200000" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (years)</label>
              <input type="number" className="input-field" min="0" value={form.experience_min} onChange={e => set('experience_min', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Experience (years)</label>
              <input type="number" className="input-field" min="0" value={form.experience_max} onChange={e => set('experience_max', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Required</label>
              <input className="input-field" placeholder="e.g. B.Tech in CS" value={form.education_required} onChange={e => set('education_required', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
              <input type="date" className="input-field" value={form.application_deadline} onChange={e => set('application_deadline', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading}
            className="btn-secondary">Save as Draft</button>
          <button type="button" onClick={(e) => handleSubmit(e, 'PUBLISHED')} disabled={loading}
            className="btn-primary">{loading ? 'Publishing...' : 'Publish Job'}</button>
        </div>
      </form>
    </div>
  )
}
