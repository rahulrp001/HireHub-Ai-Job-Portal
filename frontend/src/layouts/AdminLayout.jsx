import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import { LayoutDashboard, Users, Briefcase, Building2, FileText, Shield } from 'lucide-react'

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/companies', icon: Building2, label: 'Companies' },
  { to: '/admin/applications', icon: FileText, label: 'Applications' },
]

export default function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 py-6 px-4">
          <div className="mb-6 px-2">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-red-600" />
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Super Admin</p>
            </div>
            <p className="text-sm font-medium text-gray-700">{user?.full_name || user?.first_name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <nav className="space-y-1 flex-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith(to)
                    ? 'bg-red-50 text-red-700'
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
