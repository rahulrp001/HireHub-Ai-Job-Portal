import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Search, MapPin, Briefcase, Brain, FileText, BarChart3, 
  ArrowRight, Star, ChevronRight, Sparkles, Building2, TrendingUp,
  ShieldCheck, Zap, Laptop, LineChart, Cpu, DollarSign
} from 'lucide-react'

const topCompanies = [
  { name: 'Google', logo: 'G', rating: '4.4', reviews: '24.2k+', jobs: '140+ Jobs', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { name: 'Microsoft', logo: 'MS', rating: '4.3', reviews: '18.9k+', jobs: '95+ Jobs', bg: 'bg-blue-50 text-blue-600 border-blue-200' },
  { name: 'TCS', logo: 'TCS', rating: '3.9', reviews: '72.1k+', jobs: '1,200+ Jobs', bg: 'bg-[#275df5]/10 text-[#275df5] border-blue-200' },
  { name: 'Amazon', logo: 'A', rating: '4.1', reviews: '31.5k+', jobs: '310+ Jobs', bg: 'bg-amber-50 text-amber-600 border-amber-200' },
  { name: 'Infosys', logo: 'INF', rating: '3.8', reviews: '54.0k+', jobs: '850+ Jobs', bg: 'bg-purple-50 text-purple-600 border-purple-200' },
]

const popularCategories = [
  { icon: Laptop, title: 'Software & Tech', count: '12,450+ Jobs' },
  { icon: Cpu, title: 'AI & Data Science', count: '4,820+ Jobs' },
  { icon: LineChart, title: 'Finance & Banking', count: '3,190+ Jobs' },
  { icon: DollarSign, title: 'Sales & Business', count: '6,410+ Jobs' },
  { icon: Briefcase, title: 'HR & Operations', count: '2,150+ Jobs' },
]

const aiFeatures = [
  { icon: Brain, title: 'AI Job Match Scoring', desc: 'Get percentage match scores on every job based on your parsed skills & resume.' },
  { icon: FileText, title: 'Smart Resume Parser', desc: 'Instantly extract skills, projects, and work history to build a 90%+ ATS resume.' },
  { icon: BarChart3, title: 'Skill Gap Breakdown', desc: 'Identify missing requirements for target roles and get personalized learning paths.' },
  { icon: Zap, title: '1-Click Instant Apply', desc: 'Apply to top hiring MNCs directly with your saved AI candidate profile.' },
]

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [experience, setExperience] = useState('')
  const [location, setLocation] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (experience) params.append('exp', experience)
    if (location) params.append('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  const handleQuickTagClick = (tag) => {
    navigate(`/jobs?q=${encodeURIComponent(tag)}`)
  }

  return (
    <div className="bg-[#f4f5f8] min-h-screen">
      
      {/* 1. Naukri Signature Hero Section */}
      <section className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#002a7b] text-white py-14 md:py-20 px-4 relative overflow-hidden">
        {/* Background Subtle Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold mb-6 text-blue-200">
            <Sparkles className="h-4 w-4 text-amber-400" /> Over 500,000+ Jobs for candidate & employer matching
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight leading-tight">
            Find your dream job now
          </h1>
          <p className="text-blue-100/90 text-sm md:text-lg mb-10 max-w-2xl mx-auto font-normal">
            500,000+ jobs for you to explore powered by Naukri-style AI matching algorithms
          </p>

          {/* Naukri Central Multi-Field Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-full p-2 md:p-2.5 shadow-2xl flex flex-col md:flex-row items-center border border-slate-200 text-slate-800 gap-2 transition-all"
          >
            {/* Field 1: Skills / Designation / Companies */}
            <div className="flex items-center gap-3 px-4 py-2.5 w-full md:flex-[2]">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter skills / designations / companies"
                className="w-full text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            {/* Field 2: Select Experience */}
            <div className="flex items-center gap-2 px-3 py-2.5 w-full md:flex-1">
              <Briefcase className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                className="w-full text-slate-700 text-sm font-medium focus:outline-none bg-transparent cursor-pointer"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              >
                <option value="">Select experience</option>
                <option value="0">Fresher (0 Yrs)</option>
                <option value="1-3">1 - 3 Yrs</option>
                <option value="3-5">3 - 5 Yrs</option>
                <option value="5-10">5 - 10 Yrs</option>
                <option value="10+">10+ Yrs</option>
              </select>
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            {/* Field 3: Location */}
            <div className="flex items-center gap-2 px-3 py-2.5 w-full md:flex-1">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Enter location"
                className="w-full text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full md:w-auto bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-8 py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick Trending Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 text-xs text-blue-200">
            <span className="font-semibold text-white flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-amber-400" /> Trending:
            </span>
            {['Remote', 'MNC', 'Software Engineer', 'Data Analyst', 'Marketing', 'Banking', 'Fresher'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleQuickTagClick(tag)}
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-3 py-1 rounded-full text-xs font-medium transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Top Hiring Companies Widget */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Top companies hiring now</h2>
            <p className="text-slate-500 text-xs mt-0.5">Explore open vacancies at top rated multinational brands</p>
          </div>
          <Link to="/jobs" className="text-xs font-bold text-[#275df5] hover:underline flex items-center gap-1">
            View All Companies <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topCompanies.map((c) => (
            <div 
              key={c.name} 
              onClick={() => navigate(`/jobs?q=${encodeURIComponent(c.name)}`)}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center cursor-pointer hover:shadow-md hover:border-[#275df5]/40 transition-all group"
            >
              <div className={`w-12 h-12 rounded-2xl border ${c.bg} font-black text-base flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform`}>
                {c.logo}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
              <div className="flex items-center justify-center gap-1 my-1">
                <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400" /> {c.rating}
                </span>
                <span className="text-[11px] text-slate-400">| {c.reviews}</span>
              </div>
              <span className="inline-block mt-2 text-[11px] font-bold text-[#275df5] bg-blue-50 px-2.5 py-0.5 rounded-full">
                {c.jobs}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Popular Job Categories */}
      <section className="py-10 px-4 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Popular Job Categories</h2>
            <p className="text-slate-500 text-xs mt-0.5">Discover roles matching your domain expertise</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {popularCategories.map(({ icon: Icon, title, count }) => (
              <div
                key={title}
                onClick={() => navigate(`/jobs?q=${encodeURIComponent(title)}`)}
                className="bg-[#f8f9fa] border border-slate-200/80 rounded-2xl p-4 hover:bg-white hover:shadow-md hover:border-[#275df5]/50 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[#275df5] mb-3 group-hover:bg-[#275df5] group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#275df5] transition-colors">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HireHub AI Features (Naukri FastForward Style) */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-[#275df5] px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-blue-100">
            <Sparkles className="h-3.5 w-3.5" /> Powered by AI Intelligence
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Accelerate your hiring & career growth
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-xl mx-auto">
            Naukri-inspired smart tools designed to boost resume visibility and shortlist chances
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#275df5] mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
              <Link 
                to="/jobs" 
                className="inline-flex items-center gap-1 text-xs font-bold text-[#275df5] mt-6 hover:underline"
              >
                Try Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Naukri Employer Callout Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
              <Building2 className="h-4 w-4" /> For Employers & Recruiters
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Hire top talent 3x faster with AI screening</h2>
            <p className="text-slate-300 text-xs md:text-sm mt-1">
              Post job vacancies, let AI parse resume skills, rank top candidates, and schedule interviews effortlessly.
            </p>
          </div>
          <Link
            to="/register"
            className="bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all shadow-lg shrink-0 flex items-center gap-2"
          >
            Post a Job Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
