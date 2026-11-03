import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationService } from '../../services'
import { 
  Bell, LogOut, Menu, X, ChevronDown, Sparkles, Building2, Briefcase 
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout, openLoginDrawer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread notifications for logged in user
  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }
    const fetchNotifs = () => {
      notificationService.getNotifications()
        .then(({ data }) => setUnreadCount(data?.unread_count || 0))
        .catch(() => {})
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [user])

  // Close mobile menu on route navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search, location.hash])

  const handleLogout = async () => {
    setMenuOpen(false)
    await logout()
    navigate('/')
  }

  const dashboardLink = user?.role === 'CANDIDATE' ? '/candidate/dashboard'
    : user?.role === 'RECRUITER' ? '/recruiter/dashboard'
    : user?.role === 'ADMIN' ? '/admin/dashboard' : '/'

  const notificationsLink = user?.role === 'RECRUITER' 
    ? '/recruiter/notifications' 
    : user?.role === 'ADMIN' 
    ? '/admin/dashboard' 
    : '/candidate/notifications'

  const scrollToCompanies = () => {
    if (location.pathname === '/') {
      const el = document.getElementById('companies')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18 gap-4">
          
          {/* Logo & Navigation Left */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="bg-[#275df5] text-white w-9 h-9 rounded-xl font-black text-lg flex items-center justify-center tracking-tight shadow-sm group-hover:scale-105 transition-transform">
                HH
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Hire<span className="text-[#275df5]">Hub</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                  AI Job Portal
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              
              {/* 1. Jobs Dropdown */}
              <div className="relative group">
                <Link 
                  to="/jobs" 
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-full transition-all ${
                    location.pathname === '/jobs' ? 'bg-blue-50 text-[#275df5]' : 'text-slate-700 hover:text-[#275df5] hover:bg-slate-50'
                  }`}
                >
                  Jobs <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#275df5] transition-transform group-hover:rotate-180" />
                </Link>
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/jobs?job_type=FULL_TIME" className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    <span>Full-Time Jobs</span>
                    <span className="text-[10px] text-slate-400">Permanent</span>
                  </Link>
                  <Link to="/jobs?work_mode=REMOTE" className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    <span>Remote Work Jobs</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">WFM</span>
                  </Link>
                  <Link to="/jobs?work_mode=HYBRID" className="flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    <span>Hybrid Roles</span>
                    <span className="text-[10px] text-slate-400">2-3 days office</span>
                  </Link>
                  <div className="my-1.5 border-t border-slate-100"></div>
                  <Link to="/jobs" className="block px-3.5 py-2 text-xs font-bold text-[#275df5] hover:bg-blue-50 rounded-xl transition-colors">
                    Explore All Jobs →
                  </Link>
                </div>
              </div>

              {/* 2. Companies Link */}
              <Link 
                to="/#companies" 
                onClick={scrollToCompanies}
                className="px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-[#275df5] hover:bg-slate-50 rounded-full transition-all"
              >
                Companies
              </Link>

              {/* 3. AI Career Tools Dropdown */}
              <div className="relative group">
                <button 
                  type="button"
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-full transition-all ${
                    location.pathname.startsWith('/candidate/ai-') || location.pathname.startsWith('/candidate/career-')
                      ? 'bg-blue-50 text-[#275df5]'
                      : 'text-slate-700 hover:text-[#275df5] hover:bg-slate-50'
                  }`}
                >
                  AI Career Tools <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-400" /> <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#275df5] transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-0 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl p-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/candidate/ai-coach" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    AI Career Coach
                  </Link>
                  <Link to="/candidate/career-roadmap" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    Career Roadmap
                  </Link>
                  <Link to="/candidate/interview-prep" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    Mock AI Interviewer
                  </Link>
                  <Link to="/candidate/resume" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    AI Resume Match Score
                  </Link>
                  <Link to="/candidate/skill-gap" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    Skill Gap Analyzer
                  </Link>
                  <Link to="/candidate/salary-insights" className="block px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-[#275df5] rounded-xl transition-colors">
                    Salary Benchmarking
                  </Link>
                </div>
              </div>

            </nav>
          </div>

          {/* Right Action Menu */}
          <div className="hidden lg:flex items-center gap-3">
            {!user ? (
              <>
                <button 
                  onClick={openLoginDrawer}
                  className="px-5 py-2 text-sm font-bold text-[#275df5] border border-[#275df5] hover:bg-blue-50/80 rounded-full transition-all shadow-2xs"
                >
                  Login
                </button>
                <Link 
                  to="/register" 
                  className="px-5 py-2 text-sm font-bold text-white bg-[#275df5] hover:bg-[#1a4bd8] rounded-full transition-all shadow-sm"
                >
                  Register
                </Link>
                
                <div className="h-6 w-px bg-slate-200 mx-1"></div>

                <Link 
                  to="/login" 
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#275df5] py-2 px-3 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <Building2 className="h-4 w-4 text-slate-400" /> Employer Login
                </Link>
              </>
            ) : (
              <>
                {/* Notification Bell */}
                <Link 
                  to={notificationsLink} 
                  className="relative p-2 text-slate-600 hover:text-[#275df5] rounded-full hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2.5 py-1 px-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/80 bg-slate-50/50">
                    <div className="w-7 h-7 bg-[#275df5] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-2xs">
                      {user.first_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-bold text-xs text-slate-800">{user.first_name || 'Account'}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#275df5] transition-transform group-hover:rotate-180" />
                  </button>

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#275df5] rounded-md uppercase tracking-wider">
                        {user.role === 'CANDIDATE' ? 'Job Seeker' : user.role === 'RECRUITER' ? 'Employer' : 'Admin'}
                      </span>
                    </div>

                    <Link to={dashboardLink} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#275df5] rounded-xl transition-colors">
                      <Briefcase className="h-4 w-4 text-slate-400" /> Dashboard
                    </Link>

                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!user ? (
              <button 
                onClick={openLoginDrawer}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#275df5] rounded-full shadow-sm"
              >
                Login
              </button>
            ) : (
              <Link 
                to={notificationsLink} 
                className="relative p-2 text-slate-600 hover:text-[#275df5] rounded-full hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </Link>
            )}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2 bg-white px-2">
            <Link 
              to="/jobs" 
              onClick={() => setMenuOpen(false)} 
              className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Browse Jobs
            </Link>
            <Link 
              to="/#companies" 
              onClick={() => {
                setMenuOpen(false)
                scrollToCompanies()
              }} 
              className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Top Companies
            </Link>

            {/* AI Career Tools */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                AI Career Tools
              </span>
              <Link to="/candidate/ai-coach" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                AI Career Coach
              </Link>
              <Link to="/candidate/career-roadmap" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                Career Roadmap
              </Link>
              <Link to="/candidate/interview-prep" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                Mock AI Interviewer
              </Link>
              <Link to="/candidate/resume" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                AI Resume Match Score
              </Link>
              <Link to="/candidate/skill-gap" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                Skill Gap Analyzer
              </Link>
              <Link to="/candidate/salary-insights" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl">
                Salary Benchmarking
              </Link>
            </div>

            {!user ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button 
                  onClick={() => { setMenuOpen(false); openLoginDrawer(); }} 
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#275df5] hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Login
                </button>
                <Link 
                  to="/register" 
                  onClick={() => setMenuOpen(false)} 
                  className="block px-4 py-2.5 text-sm font-bold text-center text-white bg-[#275df5] rounded-xl shadow-xs"
                >
                  Register for Free
                </Link>
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)} 
                  className="block px-4 py-2 text-xs font-semibold text-center text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Employer Login
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="px-4 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.first_name} {user.last_name}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
                <Link 
                  to={dashboardLink} 
                  onClick={() => setMenuOpen(false)} 
                  className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  My Dashboard
                </Link>
                <button 
                  onClick={() => { setMenuOpen(false); handleLogout(); }} 
                  className="block w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  )
}
