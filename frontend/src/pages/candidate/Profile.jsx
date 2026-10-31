import { useState, useEffect } from 'react'
import { candidateService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { User, Plus, Trash2, Edit2, Check, X, GraduationCap, Briefcase, Code } from 'lucide-react'

function Section({ title, icon: Icon, children, action }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  )
}

const PROFICIENCY_COLORS = {
  BEGINNER: 'bg-gray-100 text-gray-600',
  INTERMEDIATE: 'bg-blue-50 text-blue-700',
  ADVANCED: 'bg-purple-50 text-purple-700',
  EXPERT: 'bg-green-50 text-green-700',
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [allSkills, setAllSkills] = useState([])
  const [education, setEducation] = useState([])
  const [experience, setExperience] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [newSkill, setNewSkill] = useState({ skill_id: '', proficiency: 'INTERMEDIATE', years_of_experience: 0 })
  const [showAddEdu, setShowAddEdu] = useState(false)
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' })
  const [showAddExp, setShowAddExp] = useState(false)
  const [expForm, setExpForm] = useState({ company: '', job_title: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' })

  useEffect(() => {
    Promise.all([
      candidateService.getProfile(),
      candidateService.getSkills(),
      candidateService.getAllSkills(),
      candidateService.getEducation(),
      candidateService.getExperience(),
    ]).then(([p, s, all, edu, exp]) => {
      setProfile(p.data.profile)
      setProfileForm(p.data.profile)
      setSkills(s.data.skills || [])
      setAllSkills(all.data || [])
      setEducation(edu.data.education || [])
      setExperience(exp.data.experience || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const { data } = await candidateService.updateProfile(profileForm)
      setProfile(data.profile)
      setEditProfile(false)
    } catch {}
    setSaving(false)
  }

  const addSkill = async () => {
    if (!newSkill.skill_id) return
    try {
      const { data } = await candidateService.addSkill(newSkill)
      setSkills(prev => [...prev, data.skill])
      setNewSkill({ skill_id: '', proficiency: 'INTERMEDIATE', years_of_experience: 0 })
      setShowAddSkill(false)
    } catch {}
  }

  const removeSkill = async (id) => {
    try {
      await candidateService.removeSkill(id)
      setSkills(prev => prev.filter(s => s.id !== id))
    } catch {}
  }

  const addEducation = async () => {
    try {
      const { data } = await candidateService.addEducation(eduForm)
      setEducation(prev => [...prev, data.education])
      setEduForm({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' })
      setShowAddEdu(false)
    } catch {}
  }

  const deleteEducation = async (id) => {
    try {
      await candidateService.deleteEducation(id)
      setEducation(prev => prev.filter(e => e.id !== id))
    } catch {}
  }

  const addExperience = async () => {
    try {
      const { data } = await candidateService.addExperience(expForm)
      setExperience(prev => [...prev, data.experience])
      setExpForm({ company: '', job_title: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' })
      setShowAddExp(false)
    } catch {}
  }

  const deleteExperience = async (id) => {
    try {
      await candidateService.deleteExperience(id)
      setExperience(prev => prev.filter(e => e.id !== id))
    } catch {}
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
    </div>
  )

  const completion = profile?.completion_percentage || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Keep your profile updated to get better job matches</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{completion}%</div>
          <div className="text-xs text-gray-500">Profile Complete</div>
          <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information" icon={User}
        action={
          editProfile
            ? <div className="flex gap-2">
                <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                  <Check className="h-3 w-3" /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditProfile(false)} className="btn-secondary text-sm px-3 py-1.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            : <button onClick={() => setEditProfile(true)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1">
                <Edit2 className="h-3 w-3" /> Edit
              </button>
        }>
        {editProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'headline', label: 'Headline', placeholder: 'e.g. Full Stack Developer' },
              { key: 'current_job_title', label: 'Current Job Title', placeholder: 'e.g. Software Engineer' },
              { key: 'location', label: 'Location', placeholder: 'e.g. Bangalore, India' },
              { key: 'years_of_experience', label: 'Years of Experience', type: 'number' },
              { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
              { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/...' },
              { key: 'portfolio_url', label: 'Portfolio URL', placeholder: 'https://yoursite.com' },
              { key: 'expected_salary', label: 'Expected Salary (₹)', type: 'number' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input type={type || 'text'} className="input-field text-sm" placeholder={placeholder}
                  value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea className="input-field text-sm" rows={3} placeholder="Tell recruiters about yourself..."
                value={profileForm.bio || ''} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Availability</label>
              <select className="input-field text-sm" value={profileForm.availability || 'IMMEDIATE'}
                onChange={e => setProfileForm(f => ({ ...f, availability: e.target.value }))}>
                <option value="IMMEDIATE">Immediate</option>
                <option value="TWO_WEEKS">2 Weeks</option>
                <option value="ONE_MONTH">1 Month</option>
                <option value="NOT_LOOKING">Not Looking</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400">Name:</span> <span className="font-medium ml-2">{user?.first_name} {user?.last_name}</span></div>
            <div><span className="text-gray-400">Email:</span> <span className="font-medium ml-2">{user?.email}</span></div>
            <div><span className="text-gray-400">Headline:</span> <span className="font-medium ml-2">{profile?.headline || '—'}</span></div>
            <div><span className="text-gray-400">Location:</span> <span className="font-medium ml-2">{profile?.location || '—'}</span></div>
            <div><span className="text-gray-400">Experience:</span> <span className="font-medium ml-2">{profile?.years_of_experience || 0} years</span></div>
            <div><span className="text-gray-400">Availability:</span> <span className="font-medium ml-2">{profile?.availability?.replace('_', ' ') || '—'}</span></div>
            {profile?.bio && <div className="md:col-span-2"><span className="text-gray-400">Bio:</span> <span className="ml-2">{profile.bio}</span></div>}
            {profile?.linkedin_url && <div><span className="text-gray-400">LinkedIn:</span> <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">View Profile</a></div>}
            {profile?.github_url && <div><span className="text-gray-400">GitHub:</span> <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">View Profile</a></div>}
          </div>
        )}
      </Section>

      {/* Skills */}
      <Section title="Skills" icon={Code}
        action={<button onClick={() => setShowAddSkill(!showAddSkill)} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"><Plus className="h-3 w-3" /> Add Skill</button>}>
        {showAddSkill && (
          <div className="flex gap-3 mb-4 p-3 bg-blue-50 rounded-lg flex-wrap">
            <select className="input-field text-sm flex-1 min-w-32" value={newSkill.skill_id}
              onChange={e => setNewSkill(s => ({ ...s, skill_id: e.target.value }))}>
              <option value="">Select Skill</option>
              {allSkills.filter(s => !skills.find(cs => cs.skill?.id === s.id)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select className="input-field text-sm w-36" value={newSkill.proficiency}
              onChange={e => setNewSkill(s => ({ ...s, proficiency: e.target.value }))}>
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" className="input-field text-sm w-24" placeholder="Years" min="0"
              value={newSkill.years_of_experience} onChange={e => setNewSkill(s => ({ ...s, years_of_experience: e.target.value }))} />
            <button onClick={addSkill} className="btn-primary text-sm px-3">Add</button>
            <button onClick={() => setShowAddSkill(false)} className="btn-secondary text-sm px-3">Cancel</button>
          </div>
        )}
        {skills.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No skills added yet. Add your skills to get better job matches.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map(cs => (
              <div key={cs.id} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 group">
                <span className="text-sm font-medium text-gray-800">{cs.skill?.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${PROFICIENCY_COLORS[cs.proficiency]}`}>{cs.proficiency}</span>
                {cs.years_of_experience > 0 && <span className="text-xs text-gray-400">{cs.years_of_experience}y</span>}
                <button onClick={() => removeSkill(cs.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap}
        action={<button onClick={() => setShowAddEdu(!showAddEdu)} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>}>
        {showAddEdu && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
            {[
              { key: 'institution', label: 'Institution', placeholder: 'University/College name' },
              { key: 'degree', label: 'Degree', placeholder: 'e.g. B.Tech, MCA' },
              { key: 'field_of_study', label: 'Field of Study', placeholder: 'e.g. Computer Science' },
              { key: 'grade', label: 'Grade/CGPA', placeholder: 'e.g. 8.5' },
              { key: 'start_date', label: 'Start Date', type: 'date' },
              { key: 'end_date', label: 'End Date', type: 'date' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input type={type || 'text'} className="input-field text-sm" placeholder={placeholder}
                  value={eduForm[key] || ''} onChange={e => setEduForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2 flex gap-2">
              <button onClick={addEducation} className="btn-primary text-sm px-4">Save</button>
              <button onClick={() => setShowAddEdu(false)} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          </div>
        )}
        {education.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No education added yet.</p>
        ) : (
          <div className="space-y-3">
            {education.map(edu => (
              <div key={edu.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{edu.degree} in {edu.field_of_study}</p>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {edu.start_date} — {edu.end_date || 'Present'} {edu.grade && `• ${edu.grade}`}
                  </p>
                </div>
                <button onClick={() => deleteEducation(edu.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Experience */}
      <Section title="Work Experience" icon={Briefcase}
        action={<button onClick={() => setShowAddExp(!showAddExp)} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"><Plus className="h-3 w-3" /> Add</button>}>
        {showAddExp && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 bg-blue-50 rounded-lg">
            {[
              { key: 'company', label: 'Company', placeholder: 'Company name' },
              { key: 'job_title', label: 'Job Title', placeholder: 'e.g. Software Engineer' },
              { key: 'location', label: 'Location', placeholder: 'e.g. Bangalore' },
              { key: 'start_date', label: 'Start Date', type: 'date' },
              { key: 'end_date', label: 'End Date', type: 'date' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input type={type || 'text'} className="input-field text-sm" placeholder={placeholder}
                  value={expForm[key] || ''} onChange={e => setExpForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea className="input-field text-sm" rows={2} placeholder="What did you do in this role?"
                value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="currently_working" checked={expForm.currently_working}
                onChange={e => setExpForm(f => ({ ...f, currently_working: e.target.checked }))} />
              <label htmlFor="currently_working" className="text-sm text-gray-600">Currently working here</label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button onClick={addExperience} className="btn-primary text-sm px-4">Save</button>
              <button onClick={() => setShowAddExp(false)} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          </div>
        )}
        {experience.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No experience added yet.</p>
        ) : (
          <div className="space-y-3">
            {experience.map(exp => (
              <div key={exp.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{exp.job_title}</p>
                  <p className="text-sm text-gray-600">{exp.company} {exp.location && `• ${exp.location}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {exp.start_date} — {exp.currently_working ? 'Present' : exp.end_date || '—'}
                  </p>
                  {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                </div>
                <button onClick={() => deleteExperience(exp.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
