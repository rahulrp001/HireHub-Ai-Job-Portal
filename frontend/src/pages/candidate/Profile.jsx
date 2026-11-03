import { useState, useEffect, useRef } from 'react'
import { candidateService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { User, Plus, Trash2, Edit2, Check, X, GraduationCap, Briefcase, Code, Search } from 'lucide-react'
import LocationInputWithMap from '../../components/common/LocationInputWithMap'

function SearchableSelect({ options, value, onChange, placeholder }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="input-field text-sm flex items-center gap-2 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
        {value && <button type="button" onClick={e => { e.stopPropagation(); onChange(''); setSearch('') }} className="ml-auto text-gray-300 hover:text-gray-500"><X className="h-3 w-3" /></button>}
      </div>
      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-hidden">
          <input autoFocus className="w-full px-3 py-2 text-sm border-b border-gray-100 outline-none"
            placeholder="Type to search..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="overflow-y-auto max-h-40">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 px-3 py-2">No results</p>
              : filtered.map(o => (
                <div key={o} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => { onChange(o); setOpen(false); setSearch('') }}>{o}</div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

const INDIAN_COLLEGES = [
  // IITs
  'IIT Bombay','IIT Delhi','IIT Madras','IIT Kanpur','IIT Kharagpur','IIT Roorkee','IIT Guwahati','IIT Hyderabad','IIT BHU Varanasi','IIT Mandi','IIT Jodhpur','IIT Patna','IIT Indore',
  // NITs
  'NIT Trichy','NIT Warangal','NIT Surathkal','NIT Calicut','NIT Rourkela','NIT Allahabad','NIT Agra',
  // BITS
  'BITS Pilani','BITS Goa','BITS Hyderabad',
  // IIITs
  'IIIT Hyderabad','IIIT Bangalore','IIIT Allahabad','IIIT Delhi','IIIT Lucknow','IIIT Gwalior',
  // UP - Central Universities
  'Banaras Hindu University (BHU), Varanasi','Aligarh Muslim University (AMU), Aligarh','University of Allahabad, Prayagraj','Babasaheb Bhimrao Ambedkar University, Lucknow',
  // UP - State Universities
  'Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow','Chaudhary Charan Singh University (CCSU), Meerut','Mahatma Jyotiba Phule Rohilkhand University, Bareilly','Veer Bahadur Singh Purvanchal University, Jaunpur','Deen Dayal Upadhyaya Gorakhpur University, Gorakhpur','Bundelkhand University, Jhansi','Lucknow University, Lucknow','Agra University (Dr. Bhimrao Ambedkar University), Agra','Kanpur University (CSJMU), Kanpur','Sampurnanand Sanskrit University, Varanasi','Siddharth University, Kapilvastu, Siddharthnagar',
  // UP - Engineering Colleges (AKTU Affiliated)
  'Harcourt Butler Technical University (HBTU), Kanpur','Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur','Kamla Nehru Institute of Technology (KNIT), Sultanpur','Institute of Engineering & Technology (IET), Lucknow','Bundelkhand Institute of Engineering & Technology (BIET), Jhansi','United College of Engineering & Research, Prayagraj','Raj Kumar Goel Institute of Technology, Ghaziabad','JSS Academy of Technical Education, Noida','Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad','Galgotias College of Engineering & Technology, Greater Noida','Galgotias University, Greater Noida','Sharda University, Greater Noida','Amity University, Noida','GL Bajaj Institute of Technology, Greater Noida','Noida Institute of Engineering & Technology (NIET), Greater Noida','Krishna Engineering College, Ghaziabad','Hindustan College of Science & Technology, Mathura','GLA University, Mathura','Invertis University, Bareilly','Teerthanker Mahaveer University (TMU), Moradabad','Integral University, Lucknow','Babu Banarasi Das University (BBDU), Lucknow','Rama University, Kanpur','Shri Ramswaroop Memorial University (SRMU), Lucknow','Maharishi University of Information Technology (MUIT), Lucknow','Pranveer Singh Institute of Technology (PSIT), Kanpur','Kanpur Institute of Technology (KIT), Kanpur','Naraina Vidyapeeth Engineering & Management Institute, Kanpur','Roorkee College of Engineering, Roorkee','Dev Bhoomi Uttarakhand University, Dehradun','Graphic Era University, Dehradun',
  // UP - Medical Colleges
  'King George Medical University (KGMU), Lucknow','Moti Lal Nehru Medical College, Prayagraj','Maharani Laxmi Bai Medical College, Jhansi','BRD Medical College, Gorakhpur','Sarojini Naidu Medical College, Agra','Government Medical College, Kanpur','Era Medical College, Lucknow','Rama Medical College, Kanpur',
  // UP - Management / Law Colleges
  'Indian Institute of Management (IIM) Lucknow','Symbiosis Law School, Noida','Amity Law School, Noida','Dr. Ram Manohar Lohia National Law University (RMLNLU), Lucknow','Babu Banarasi Das National Institute of Technology & Management, Lucknow',
  // UP Gorakhpur - Universities & Colleges
  'Deen Dayal Upadhyaya Gorakhpur University (DDU), Gorakhpur','Madan Mohan Malaviya University of Technology (MMMUT), Gorakhpur','BRD Medical College, Gorakhpur','Maharana Pratap Degree College, Gorakhpur','St. Andrews College, Gorakhpur','Brahmanand Degree College, Gorakhpur','Shaheed Mahendra Karma Government Degree College, Gorakhpur','Siddharth University Campus, Gorakhpur','Gorakhpur University Law College, Gorakhpur','Gorakhpur University B.Ed College, Gorakhpur',
  // UP Gorakhpur - Engineering Colleges
  'Buddha Institute of Technology (BIT), Gorakhpur','Maharana Pratap Engineering College (MPEC), Gorakhpur','Azad Institute of Engineering & Technology, Gorakhpur','Guru Nanak Institute of Technology, Gorakhpur','Shri Ram Murti Smarak College of Engineering (SRMS), Gorakhpur','Goel Institute of Technology & Management, Gorakhpur','Kamla Nehru Institute of Technology (KNIT), Sultanpur (near Gorakhpur region)','Invertis University (Gorakhpur Campus)','Rama Shankar Singh College of Engineering, Gorakhpur','Gorakhpur Engineering College, Gorakhpur',
  // UP Gorakhpur - Management Colleges
  'Institute of Management Studies (IMS), Gorakhpur','Gorakhpur Management Association College, Gorakhpur','Shri Ram Murti Smarak Institute of Management, Gorakhpur','Indira Gandhi National Open University (IGNOU) Study Centre, Gorakhpur',
  // UP Gorakhpur - Polytechnic
  'Government Polytechnic, Gorakhpur','Maharana Pratap Polytechnic, Gorakhpur','Azad Polytechnic, Gorakhpur','Guru Nanak Polytechnic, Gorakhpur','Shri Ram Polytechnic, Gorakhpur',
  // UP - Polytechnic / Diploma
  'Government Polytechnic, Lucknow','Government Polytechnic, Kanpur','Government Polytechnic, Agra','Government Polytechnic, Varanasi','Government Polytechnic, Meerut','Government Polytechnic, Allahabad',
  // Other States
  'Delhi University','Mumbai University','Pune University','Anna University','Osmania University','VIT Vellore','VIT Chennai','SRM University','Manipal University','Jadavpur University','Calcutta University','Chandigarh University','Thapar University','PES University','RV College of Engineering','Lovely Professional University','Christ University','Symbiosis International University',
  'Other'
]

const DEGREES = [
  // Engineering
  'B.Tech','B.E.','M.Tech','M.E.','Integrated M.Tech','Dual Degree (B.Tech + M.Tech)','B.Tech (Lateral Entry)',
  // Science
  'B.Sc','M.Sc','B.Sc (Hons)','M.Sc (Hons)','B.Sc (Agriculture)','M.Sc (Agriculture)',
  // Commerce
  'B.Com','M.Com','B.Com (Hons)',
  // Arts
  'B.A.','M.A.','B.A. (Hons)',
  // Management
  'B.B.A.','M.B.A.','PGDM','Executive MBA',
  // Computer Applications
  'B.C.A.','M.C.A.',
  // Medical
  'MBBS','BDS','B.Pharm','M.Pharm','B.Sc Nursing','M.Sc Nursing','BAMS','BHMS','MD','MS (Surgery)',
  // Law
  'LLB','LLM','B.A. LLB (Hons)','BBA LLB',
  // Architecture
  'B.Arch','M.Arch',
  // Education
  'B.Ed','M.Ed','D.El.Ed',
  // Diploma / Polytechnic (UP Board)
  'Diploma in Engineering','Diploma in Computer Science','Diploma in Electronics','Diploma in Mechanical Engineering','Diploma in Civil Engineering','Diploma in Electrical Engineering','Diploma in IT','Polytechnic Diploma',
  // Research
  'Ph.D','M.Phil',
  // Certificates
  'Certificate Course','PG Diploma','Advanced Diploma',
  'Other'
]

const FIELDS_OF_STUDY = [
  'Computer Science Engineering','Information Technology','Electronics & Communication Engineering',
  'Electrical Engineering','Mechanical Engineering','Civil Engineering','Chemical Engineering',
  'Aerospace Engineering','Biotechnology','Data Science','Artificial Intelligence & ML',
  'Cybersecurity','Cloud Computing','Software Engineering',
  'Business Administration','Finance','Marketing','Human Resources','Operations Management',
  'Economics','Commerce','Accounting','Banking & Finance',
  'Physics','Chemistry','Mathematics','Statistics','Biology',
  'English Literature','Psychology','Sociology','Political Science','History',
  'Architecture','Pharmacy','Medicine','Law','Journalism & Mass Communication','Other'
]

const JOB_TITLES = [
  'Software Engineer','Senior Software Engineer','Lead Software Engineer','Principal Engineer',
  'Frontend Developer','Backend Developer','Full Stack Developer','Mobile Developer',
  'DevOps Engineer','Cloud Engineer','Data Engineer','Data Scientist','ML Engineer',
  'Product Manager','Project Manager','Scrum Master','Business Analyst',
  'UI/UX Designer','Graphic Designer','QA Engineer','Test Engineer',
  'System Administrator','Network Engineer','Security Engineer','Database Administrator',
  'Marketing Manager','Sales Manager','HR Manager','Finance Manager','Operations Manager',
  'Fresher / Intern','Other'
]

const COMPANIES = [
  'TCS','Infosys','Wipro','HCL Technologies','Tech Mahindra','Cognizant','Capgemini',
  'Accenture','IBM','Oracle','Microsoft','Google','Amazon','Meta','Apple',
  'Flipkart','Swiggy','Zomato','Paytm','PhonePe','BYJU S','Ola','Uber',
  'Deloitte','PwC','EY','KPMG','McKinsey','BCG',
  'HDFC Bank','ICICI Bank','Axis Bank','SBI','Reliance Industries','Startup / Other'
]

const LOCATIONS = [
  'Bangalore','Mumbai','Delhi','Hyderabad','Chennai','Pune','Kolkata',
  'Ahmedabad','Noida','Gurgaon','Chandigarh','Jaipur','Kochi','Indore',
  'Bhubaneswar','Coimbatore','Nagpur','Lucknow','Surat','Vadodara',
  'Remote','Hybrid','Other'
]

const PREDEFINED_SKILLS = [
  // Programming Languages
  'Python','JavaScript','TypeScript','Java','C','C++','C#','Go','Rust','Kotlin','Swift','PHP','Ruby','Scala','R','MATLAB','Dart','Perl',
  // Web Frontend
  'React.js','Next.js','Vue.js','Angular','HTML','CSS','Tailwind CSS','Bootstrap','Redux','jQuery','Webpack','Vite','SASS/SCSS',
  // Web Backend
  'Node.js','Express.js','Django','Flask','FastAPI','Spring Boot','Laravel','Ruby on Rails','ASP.NET','NestJS',
  // Mobile
  'React Native','Flutter','Android Development','iOS Development','Ionic',
  // Database
  'MySQL','PostgreSQL','MongoDB','SQLite','Redis','Oracle DB','Microsoft SQL Server','Cassandra','Firebase','Supabase',
  // Cloud & DevOps
  'AWS','Azure','Google Cloud (GCP)','Docker','Kubernetes','CI/CD','Jenkins','GitHub Actions','Terraform','Ansible','Linux','Nginx','Apache',
  // Data Science & AI/ML
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy','Matplotlib','OpenCV','NLP','Computer Vision','Data Analysis','Power BI','Tableau','Excel',
  // Version Control
  'Git','GitHub','GitLab','Bitbucket',
  // Testing
  'Unit Testing','Selenium','Jest','Pytest','Postman','JUnit',
  // Design
  'Figma','Adobe XD','Photoshop','Illustrator','Canva','UI/UX Design',
  // Soft Skills
  'Communication','Leadership','Team Management','Problem Solving','Critical Thinking','Time Management','Project Management','Agile','Scrum',
  // Other Tech
  'REST API','GraphQL','WebSocket','Microservices','System Design','Data Structures & Algorithms','OOP','Blockchain','Cybersecurity','Ethical Hacking','Networking','IoT'
]

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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    setError('')
    setSuccess('')
    try {
      const { data } = await candidateService.updateProfile(profileForm)
      setProfile(data.profile)
      setEditProfile(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err.response?.data)
      setError(err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to save profile.')
    }
    setSaving(false)
  }

  const addSkill = async () => {
    if (!newSkill.skill_id && !newSkill.skill_name) return
    try {
      if (newSkill.skill_name && !allSkills.length) {
        const { data: sd } = await candidateService.createSkill({ name: newSkill.skill_name })
        await candidateService.addSkill({ skill_id: sd.id, proficiency: newSkill.proficiency, years_of_experience: Number(newSkill.years_of_experience) })
      } else {
        await candidateService.addSkill({ skill_id: Number(newSkill.skill_id), proficiency: newSkill.proficiency, years_of_experience: Number(newSkill.years_of_experience) })
      }
      const { data } = await candidateService.getSkills()
      setSkills(data.skills || [])
      setNewSkill({ skill_id: '', proficiency: 'INTERMEDIATE', years_of_experience: 0 })
      setShowAddSkill(false)
    } catch (e) { console.error(e) }
  }

  const removeSkill = async (id) => {
    try {
      await candidateService.removeSkill(id)
      setSkills(prev => prev.filter(s => s.id !== id))
    } catch {}
  }

  const addEducation = async () => {
    try {
      await candidateService.addEducation(eduForm)
      const { data } = await candidateService.getEducation()
      setEducation(data.education || [])
      setEduForm({ institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' })
      setShowAddEdu(false)
    } catch (e) { console.error('Education error:', e.response?.data) }
  }

  const deleteEducation = async (id) => {
    try {
      await candidateService.deleteEducation(id)
      setEducation(prev => prev.filter(e => e.id !== id))
    } catch (e) { console.error(e) }
  }

  const addExperience = async () => {
    try {
      const payload = { ...expForm }
      if (payload.currently_working) delete payload.end_date
      if (!payload.end_date) delete payload.end_date
      await candidateService.addExperience(payload)
      const { data } = await candidateService.getExperience()
      setExperience(data.experience || [])
      setExpForm({ company: '', job_title: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' })
      setShowAddExp(false)
    } catch (e) { console.error('Experience error:', e.response?.data) }
  }

  const deleteExperience = async (id) => {
    try {
      await candidateService.deleteExperience(id)
      setExperience(prev => prev.filter(e => e.id !== id))
    } catch (e) { console.error(e) }
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

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-sm">{success}</div>}

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
              { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
              { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/...' },
              { key: 'portfolio_url', label: 'Portfolio URL', placeholder: 'https://yoursite.com' },
              { key: 'years_of_experience', label: 'Years of Experience', type: 'number' },
              { key: 'expected_salary', label: 'Expected Salary (₹)', type: 'number' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                <input type={type || 'text'} className="input-field text-sm" placeholder={placeholder}
                  value={profileForm[key] || ''} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Current Job Title</label>
              <select className="input-field text-sm" value={profileForm.current_job_title || ''}
                onChange={e => setProfileForm(f => ({ ...f, current_job_title: e.target.value }))}>
                <option value="">Select Job Title</option>
                {JOB_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <LocationInputWithMap
                label="Location"
                placeholder="e.g. Bangalore, Mumbai, or pick on map"
                value={profileForm.location || ''}
                onChange={(loc) => setProfileForm(f => ({ ...f, location: loc }))}
                buttonLabel="Map"
              />
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
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
              <textarea className="input-field text-sm" rows={3} placeholder="Tell recruiters about yourself..."
                value={profileForm.bio || ''} onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))} />
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
            <div className="flex-1 min-w-48">
              <SearchableSelect
                options={allSkills.length > 0 ? allSkills.map(s => s.name) : PREDEFINED_SKILLS}
                value={allSkills.length > 0
                  ? allSkills.find(s => s.id === parseInt(newSkill.skill_id))?.name || ''
                  : newSkill.skill_name || ''}
                onChange={v => {
                  if (allSkills.length > 0) {
                    const found = allSkills.find(s => s.name === v)
                    if (found) setNewSkill(s => ({ ...s, skill_id: found.id }))
                  } else {
                    setNewSkill(s => ({ ...s, skill_name: v, skill_id: v }))
                  }
                }}
                placeholder="Search Skill"
              />
            </div>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Institution</label>
              <SearchableSelect options={INDIAN_COLLEGES} value={eduForm.institution}
                onChange={v => setEduForm(f => ({ ...f, institution: v }))} placeholder="Search College/University" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Degree</label>
              <SearchableSelect options={DEGREES} value={eduForm.degree}
                onChange={v => setEduForm(f => ({ ...f, degree: v }))} placeholder="Search Degree" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Field of Study</label>
              <SearchableSelect options={FIELDS_OF_STUDY} value={eduForm.field_of_study}
                onChange={v => setEduForm(f => ({ ...f, field_of_study: v }))} placeholder="Search Field of Study" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grade/CGPA</label>
              <input type="text" className="input-field text-sm" placeholder="e.g. 8.5 or 85%"
                value={eduForm.grade} onChange={e => setEduForm(f => ({ ...f, grade: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="date" className="input-field text-sm"
                value={eduForm.start_date} onChange={e => setEduForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input type="date" className="input-field text-sm"
                value={eduForm.end_date} onChange={e => setEduForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
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
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
              <SearchableSelect options={COMPANIES} value={expForm.company}
                onChange={v => setExpForm(f => ({ ...f, company: v }))} placeholder="Search Company" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Job Title</label>
              <SearchableSelect options={JOB_TITLES} value={expForm.job_title}
                onChange={v => setExpForm(f => ({ ...f, job_title: v }))} placeholder="Search Job Title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <SearchableSelect options={LOCATIONS} value={expForm.location}
                onChange={v => setExpForm(f => ({ ...f, location: v }))} placeholder="Search Location" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <input type="date" className="input-field text-sm"
                value={expForm.start_date} onChange={e => setExpForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <input type="date" className="input-field text-sm" disabled={expForm.currently_working}
                value={expForm.end_date} onChange={e => setExpForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" id="currently_working" checked={expForm.currently_working}
                onChange={e => setExpForm(f => ({ ...f, currently_working: e.target.checked, end_date: '' }))} />
              <label htmlFor="currently_working" className="text-sm text-gray-600">Currently working here</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea className="input-field text-sm" rows={2} placeholder="What did you do in this role?"
                value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} />
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
