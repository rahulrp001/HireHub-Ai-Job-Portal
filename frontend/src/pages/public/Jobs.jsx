import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { jobService } from '../../services'
import { 
  MapPin, Briefcase, Clock, Search, Filter, BookmarkPlus, BookmarkCheck, 
  IndianRupee, Star, Sparkles, Building2, SlidersHorizontal, ArrowUpDown, ChevronRight, Compass
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import LocationPickerModal from '../../components/common/LocationPickerModal'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE']
const WORK_MODES = ['REMOTE', 'HYBRID', 'ON_SITE']

export default function Jobs() {
  const { user, openLoginDrawer } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState({
    job_type: searchParams.get('job_type') || '',
    work_mode: searchParams.get('work_mode') || '',
    location: searchParams.get('location') || ''
  })
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [mapModalOpen, setMapModalOpen] = useState(false)

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = { page, ...(search && { q: search }), ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const { data } = await jobService.getJobs(params)
      setJobs(data.results || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
    setFilters({
      job_type: searchParams.get('job_type') || '',
      work_mode: searchParams.get('work_mode') || '',
      location: searchParams.get('location') || ''
    })
    setPage(1)
  }, [searchParams])

  useEffect(() => { 
    fetchJobs()
    const interval = setInterval(fetchJobs, 30000)
    return () => clearInterval(interval)
  }, [page, filters])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const handleSave = async (jobId) => {
    if (!user) {
      openLoginDrawer()
      return
    }
    try {
      const { data } = await jobService.saveJob(jobId)
      setSavedJobs(prev => {
        const next = new Set(prev)
        data.saved ? next.add(jobId) : next.delete(jobId)
        return next
      })
    } catch {}
  }

  const resetFilters = () => {
    setSearch('')
    setFilters({ job_type: '', work_mode: '', location: '' })
    setSearchParams({})
  }

  return (
    <div className="bg-[#f4f5f8] min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Search Bar Container (Naukri style) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="input-field pl-10 bg-slate-50 border-slate-200 text-sm font-medium"
                placeholder="Search by skills, designations, or companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-56 relative flex items-center">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="input-field pl-10 pr-16 bg-slate-50 border-slate-200 text-sm font-medium"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setMapModalOpen(true)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-50 hover:bg-blue-100 text-[#275df5] border border-blue-200 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="Search or pick location on interactive map"
              >
                <Compass className="h-3 w-3" /> Map
              </button>
            </div>
            <button
              type="submit"
              className="bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-8 py-2.5 rounded-xl transition-all text-sm shadow-sm flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> Search Jobs
            </button>
          </form>
        </div>

        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Filter Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <SlidersHorizontal className="h-4 w-4 text-[#275df5]" /> All Filters
                </div>
                {(search || filters.job_type || filters.work_mode || filters.location) && (
                  <button 
                    onClick={resetFilters}
                    className="text-xs font-bold text-[#275df5] hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Work Mode Filter */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Work Mode</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#275df5]">
                    <input
                      type="radio"
                      name="work_mode"
                      checked={filters.work_mode === ''}
                      onChange={() => setFilters(f => ({ ...f, work_mode: '' }))}
                      className="text-[#275df5] focus:ring-[#275df5]"
                    />
                    <span>All Modes</span>
                  </label>
                  {WORK_MODES.map(mode => (
                    <label key={mode} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#275df5]">
                      <input
                        type="radio"
                        name="work_mode"
                        checked={filters.work_mode === mode}
                        onChange={() => setFilters(f => ({ ...f, work_mode: mode }))}
                        className="text-[#275df5] focus:ring-[#275df5]"
                      />
                      <span>{mode.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div className="mb-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Employment Type</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#275df5]">
                    <input
                      type="radio"
                      name="job_type"
                      checked={filters.job_type === ''}
                      onChange={() => setFilters(f => ({ ...f, job_type: '' }))}
                      className="text-[#275df5] focus:ring-[#275df5]"
                    />
                    <span>All Job Types</span>
                  </label>
                  {JOB_TYPES.map(type => (
                    <label key={type} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#275df5]">
                      <input
                        type="radio"
                        name="job_type"
                        checked={filters.job_type === type}
                        onChange={() => setFilters(f => ({ ...f, job_type: type }))}
                        className="text-[#275df5] focus:ring-[#275df5]"
                      />
                      <span>{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Location</h4>
                  <button
                    type="button"
                    onClick={() => setMapModalOpen(true)}
                    className="text-[11px] font-bold text-[#275df5] hover:underline flex items-center gap-0.5"
                  >
                    <Compass className="h-3 w-3" /> Map View
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['Bangalore', 'Mumbai', 'Delhi', 'Noida', 'Gurugram', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore', 'Kochi', 'Remote'].map(city => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setFilters(f => ({ ...f, location: f.location === city ? '' : city }))
                        setPage(1)
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                        filters.location === city
                          ? 'bg-[#275df5] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Match Feature Teaser */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-600">
                <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs mb-1">
                  <Sparkles className="h-4 w-4 text-[#275df5]" /> Naukri AI Score
                </p>
                <p className="text-[11px] text-slate-500">Sign in to see percentage match score for your uploaded resume.</p>
              </div>

            </div>
          </div>

          {/* Right Column: Job Results List */}
          <div className="lg:col-span-3">
            
            {/* Header info & Sort bar */}
            <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-700">
                {loading ? 'Searching opportunities...' : `Showing ${jobs.length} jobs available`}
              {!loading && <span className="text-[10px] text-slate-400 ml-2">• Live</span>}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" /> Sort by: <span className="font-bold text-slate-800 cursor-pointer hover:text-[#275df5]">Relevance</span>
              </div>
            </div>

            {/* Job Cards Stack */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No matching jobs found</h3>
                <p className="text-slate-400 text-xs mt-1">Try clearing some filters or searching for broader terms like Software, Engineer, or Manager.</p>
                <button onClick={resetFilters} className="mt-4 text-xs font-bold text-[#275df5] hover:underline">
                  Reset Search & Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, idx) => {
                  const matchPercentage = 85 + ((idx * 3) % 12) // Demo AI Match Score
                  return (
                    <div 
                      key={job.id} 
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 hover:shadow-md hover:border-slate-300 transition-all relative group"
                    >
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div className="flex items-start gap-3.5">
                          {/* Company Logo Badge */}
                          <div className="w-11 h-11 bg-blue-50 text-[#275df5] font-black text-base rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            {job.company_detail?.name?.[0] || 'C'}
                          </div>

                          <div>
                            <Link 
                              to={`/jobs/${job.id}`} 
                              className="text-base md:text-lg font-bold text-slate-900 hover:text-[#275df5] transition-colors tracking-tight leading-snug"
                            >
                              {job.title}
                            </Link>
                            
                            <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-600">
                              <span>{job.company_detail?.name || 'Top Employer'}</span>
                              <span className="text-amber-500 font-bold flex items-center gap-0.5 text-[11px] bg-amber-50 px-1.5 py-0.5 rounded">
                                <Star className="h-3 w-3 fill-amber-400" /> 4.2
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Save Bookmark */}
                        <button
                          onClick={() => handleSave(job.id)}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#275df5] transition-colors"
                          title="Save Job"
                        >
                          {savedJobs.has(job.id) || job.is_saved
                            ? <BookmarkCheck className="h-5 w-5 text-[#275df5] fill-[#275df5]/10" />
                            : <BookmarkPlus className="h-5 w-5" />}
                        </button>
                      </div>

                      {/* Specs Row (Exp, Salary, Location) */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 my-3 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.job_type?.replace('_', ' ')}
                        </span>
                        
                        {job.salary_min ? (
                          <span className="flex items-center gap-1 font-bold text-slate-800">
                            ₹{Number(job.salary_min).toLocaleString()} - ₹{Number(job.salary_max).toLocaleString()} PA
                          </span>
                        ) : (
                          <span className="text-slate-400">Not Disclosed</span>
                        )}

                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location || 'Remote'} ({job.work_mode?.replace('_', ' ')})
                        </span>
                      </div>

                      {/* Description Excerpt */}
                      <p className="text-xs text-slate-500 line-clamp-2 my-3 leading-relaxed">
                        {job.description || 'Join our team as a professional where you will collaborate on high impact projects and build innovative products.'}
                      </p>

                      {/* Required Skills Badges */}
                      {job.required_skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 my-3">
                          {job.required_skills.slice(0, 5).map((skill) => (
                            <span 
                              key={skill} 
                              className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-md"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Card Footer Row */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span>Posted recently</span>
                          
                          {/* AI Match Badge */}
                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-emerald-600" /> {matchPercentage}% Match
                          </span>
                        </div>

                        <Link 
                          to={`/jobs/${job.id}`}
                          className="font-bold text-[#275df5] hover:underline flex items-center gap-1"
                        >
                          View Details <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Next
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialLocation={filters.location}
        onSelectLocation={(loc) => {
          setFilters(f => ({ ...f, location: loc }))
          setPage(1)
        }}
      />
    </div>
  )
}
