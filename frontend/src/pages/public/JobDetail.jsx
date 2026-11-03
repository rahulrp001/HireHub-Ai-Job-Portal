import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { jobService, applicationService, resumeService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import JobLocationMap from '../../components/common/JobLocationMap'
import { 
  MapPin, Briefcase, Clock, DollarSign, GraduationCap, Calendar, 
  BookmarkPlus, BookmarkCheck, ArrowLeft, CheckCircle2, Star, Sparkles, 
  Building2, Send, FileText, Share2, Compass
} from 'lucide-react'

export default function JobDetail() {
  const { id } = useParams()
  const { user, openLoginDrawer } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => {
    const loadJob = () => {
      jobService.getJob(id)
        .then(({ data }) => {
          setJob(data.job)
          setSaved(data.job.is_saved)
        }).catch(() => navigate('/jobs'))
        .finally(() => setLoading(false))
    }
    loadJob()
    const interval = setInterval(loadJob, 30000)

    if (user?.role === 'CANDIDATE') {
      resumeService.getResumes().then(({ data }) => setResumes(data.resumes || [])).catch(() => {})
      applicationService.getMyApplications().then(({ data }) => {
        const apps = data.applications || []
        setApplied(apps.some(a => a.job === parseInt(id)))
      }).catch(() => {})
    }
    return () => clearInterval(interval)
  }, [id])

  const handleSave = async () => {
    if (!user) {
      openLoginDrawer()
      return
    }
    try {
      const { data } = await jobService.saveJob(id)
      setSaved(data.saved)
    } catch {}
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) {
      openLoginDrawer()
      return
    }
    setApplying(true)
    try {
      await applicationService.apply(id, { resume: selectedResume || undefined, cover_letter: coverLetter })
      setApplied(true)
      setShowApplyForm(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed')
    }
    setApplying(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#275df5] border-t-transparent" />
    </div>
  )

  if (!job) return null

  return (
    <div className="bg-[#f4f5f8] min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#275df5] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>

        {/* 1. Header Naukri Job Title Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm relative">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-50 text-[#275df5] font-black text-xl rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                {job.company_detail?.name?.[0] || 'C'}
              </div>

              <div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {job.title}
                </h1>
                
                <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-slate-600">
                  <span className="text-slate-900 font-bold">{job.company_detail?.name || 'Top Employer'}</span>
                  <span className="text-amber-500 font-bold flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded">
                    <Star className="h-3 w-3 fill-amber-400" /> 4.2 | 1.4k+ Reviews
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-4 text-xs font-medium text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-slate-400" /> {job.job_type?.replace('_', ' ')}
                  </span>
                  
                  {job.salary_min ? (
                    <span className="flex items-center gap-1 font-bold text-slate-900">
                      ₹{Number(job.salary_min).toLocaleString()} - ₹{Number(job.salary_max).toLocaleString()} PA
                    </span>
                  ) : (
                    <span className="text-slate-400">Salary Not Disclosed</span>
                  )}

                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" /> {job.location || 'Remote'} ({job.work_mode?.replace('_', ' ')})
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
              {applied ? (
                <div className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Applied
                </div>
              ) : user?.role === 'CANDIDATE' ? (
                <button
                  onClick={() => setShowApplyForm(!showApplyForm)}
                  className="bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-8 py-3 rounded-full text-sm transition-all shadow-md flex-1 md:flex-initial text-center"
                >
                  {showApplyForm ? 'Cancel Application' : 'Apply on HireHub'}
                </button>
              ) : !user ? (
                <button
                  onClick={openLoginDrawer}
                  className="bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-8 py-3 rounded-full text-sm transition-all shadow-md flex-1 md:flex-initial text-center"
                >
                  Login to Apply
                </button>
              ) : null}

              {user?.role === 'CANDIDATE' && (
                <button
                  onClick={handleSave}
                  className="p-3 rounded-full border border-slate-200 text-slate-500 hover:text-[#275df5] hover:bg-slate-50 transition-colors"
                  title="Save Job"
                >
                  {saved ? <BookmarkCheck className="h-5 w-5 text-[#275df5]" /> : <BookmarkPlus className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Apply Form Overlay card */}
            {showApplyForm && (
              <div className="bg-white rounded-2xl border-2 border-[#275df5] p-6 shadow-md">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Send className="h-4 w-4 text-[#275df5]" /> Complete your application
                </h3>
                <form onSubmit={handleApply} className="space-y-4">
                  {resumes.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Select Resume from Profile
                      </label>
                      <select 
                        className="input-field" 
                        value={selectedResume} 
                        onChange={e => setSelectedResume(e.target.value)}
                      >
                        <option value="">No resume selected</option>
                        {resumes.map(r => <option key={r.id} value={r.id}>{r.original_filename}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Cover Letter (Optional)
                    </label>
                    <textarea 
                      className="input-field" 
                      rows={4} 
                      placeholder="Briefly state your relevant skills and experience for this role..."
                      value={coverLetter} 
                      onChange={e => setCoverLetter(e.target.value)} 
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" disabled={applying} className="btn-naukri text-sm">
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Job Description Card */}
            {job.description && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Job Description
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            )}

            {/* Requirements Card */}
            {job.requirements && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Role Requirements
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Key Responsibilities
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.responsibilities}
                </p>
              </div>
            )}

            {/* Key Skill Badges Card */}
            {job.required_skills?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                  Key Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map(skill => (
                    <span 
                      key={skill} 
                      className="bg-blue-50 text-[#275df5] font-semibold text-xs px-3.5 py-1.5 rounded-full border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Workplace Location & Interactive Map */}
            <div id="job-location-section">
              <JobLocationMap
                location={job.location}
                companyName={job.company_detail?.name || job.title}
              />
            </div>

          </div>

          {/* Right Sidebar Details */}
          <div className="space-y-6">
            
            {/* Quick Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Job Overview
              </h3>

              {[
                { icon: Briefcase, label: 'Employment Type', value: job.job_type?.replace('_', ' ') },
                { icon: Clock, label: 'Work Mode', value: job.work_mode?.replace('_', ' ') },
                { icon: MapPin, label: 'Location', value: job.location || 'Remote', isMapLink: true },
                { icon: GraduationCap, label: 'Experience Required', value: `${job.experience_min || 0} - ${job.experience_max || 5} Yrs` },
                { icon: GraduationCap, label: 'Education', value: job.education_required || 'Graduate / Postgraduate' },
                { icon: Calendar, label: 'Deadline', value: job.application_deadline ? new Date(job.application_deadline).toLocaleDateString('en-IN') : 'Open' }
              ].map(({ icon: Icon, label, value, isMapLink }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{label}</p>
                    {isMapLink ? (
                      <a 
                        href="#job-location-section" 
                        className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1"
                        title="View job location on map"
                      >
                        {value} <span className="text-[10px] bg-blue-50 text-[#275df5] px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">Map</span>
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Skill Gap Tool Trigger */}
            {user?.role === 'CANDIDATE' && (
              <div className="bg-gradient-to-br from-[#0f2851] to-[#002a7b] text-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <Sparkles className="h-4 w-4" /> AI Resume Score
                </div>
                <h4 className="font-bold text-sm mb-1">Are you a good match for this role?</h4>
                <p className="text-xs text-blue-100/80 mb-4 leading-relaxed">
                  Run a full skill gap analysis against this job requirement.
                </p>
                <Link
                  to={`/candidate/skill-gap?job=${job.id}`}
                  className="bg-white text-[#275df5] hover:bg-blue-50 font-bold px-4 py-2 rounded-full text-xs inline-block text-center w-full transition-colors"
                >
                  Analyze My Resume Score
                </Link>
              </div>
            )}

            {/* About Company Widget */}
            {job.company_detail && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#275df5]" /> About Company
                </h3>
                <p className="font-bold text-slate-900 text-sm">{job.company_detail.name}</p>
                {job.company_detail.industry && <p className="text-xs text-slate-500 mt-0.5">{job.company_detail.industry}</p>}
                {job.company_detail.description && (
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-4">
                    {job.company_detail.description}
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
