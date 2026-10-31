import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import {
  LayoutDashboard, User, FileText, Briefcase, BookmarkCheck,
  Star, BarChart2, MessageSquare, Bell, Settings, Bot, Brain, DollarSign, Map, Swords
} from 'lucide-react'

const navItems = [
  { to: '/candidate/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidate/profile', icon: User, label: 'Profile' },
  { to: '/candidate/resume', icon: FileText, label: 'Resume' },
  { to: '/candidate/applications', icon: Briefcase, label: 'Applications' },
  { to: '/candidate/saved-jobs', icon: BookmarkCheck, label: 'Saved Jobs' },
  { to: '/candidate/recommendations', icon: Star, label: 'Recommended' },
  { to: '/candidate/skill-gap', icon: BarChart2, label: 'Skill Gap' },
  { to: '/candidate/ai-coach', icon: Bot, label: 'AI Career Coach' },
  { to: '/candidate/interview-prep', icon: Brain, label: 'Interview Prep' },
  { to: '/candidate/mock-interview', icon: Swords, label: 'Mock Interview' },
  { to: '/candidate/salary-insights', icon: DollarSign, label: 'Salary Insights' },
  { to: '/candidate/career-roadmap', icon: Map, label: 'Career Roadmap' },
  { to: '/candidate/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/candidate/notifications', icon: Bell, label: 'Notifications' },
  { to: '/candidate/settings', icon: Settings, label: 'Settings' },
]

export default function CandidateLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 py-6 px-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate Panel</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{user?.full_name || user?.first_name}</p>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
