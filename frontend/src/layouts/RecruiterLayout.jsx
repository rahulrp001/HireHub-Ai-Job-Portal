import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import {
  LayoutDashboard, Building2, Briefcase, Plus, Users,
  MessageSquare, Bell, Settings, BarChart2
} from 'lucide-react'

const navItems = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recruiter/company', icon: Building2, label: 'Company Profile' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'My Jobs' },
  { to: '/recruiter/jobs/create', icon: Plus, label: 'Post a Job' },
  { to: '/recruiter/applications', icon: Users, label: 'Applications' },
  { to: '/recruiter/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/recruiter/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/recruiter/notifications', icon: Bell, label: 'Notifications' },
  { to: '/recruiter/settings', icon: Settings, label: 'Settings' },
]

const mobileNav = [
  { to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/recruiter/jobs/create', icon: Plus, label: 'Post' },
  { to: '/recruiter/applications', icon: Users, label: 'Apps' },
  { to: '/recruiter/messages', icon: MessageSquare, label: 'Chat' },
]

export default function RecruiterLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 py-6 px-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recruiter Panel</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{user?.full_name || user?.first_name}</p>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to || location.pathname.startsWith(to + '/')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 lg:p-6 bg-gray-50 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
              location.pathname === to || location.pathname.startsWith(to + '/')
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}>
            <Icon className="h-5 w-5 mb-0.5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
