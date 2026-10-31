import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { X, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2, User, Building2 } from 'lucide-react'

export default function LoginDrawer() {
  const { isLoginDrawerOpen, closeLoginDrawer, login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('candidate') // candidate | recruiter

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  if (!isLoginDrawerOpen) return null

  const onSubmit = async (data) => {
    setError('')
    try {
      const user = await login(data)
      closeLoginDrawer()
      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard')
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="relative z-50 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeLoginDrawer}
      />

      {/* Slide Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out border-l border-slate-100">
        
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-[#275df5] text-white p-2 rounded-xl font-black text-lg tracking-tight">
              HH
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Hire<span className="text-[#275df5]">Hub</span></span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Naukri Interface</span>
            </div>
          </div>
          <button 
            onClick={closeLoginDrawer} 
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Login</h2>
            <p className="text-sm text-slate-500 mt-1">Access your profile, job applications & AI recommendations</p>
          </div>

          {/* Role Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('candidate')}
              className={`py-2 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'candidate'
                  ? 'bg-white text-[#275df5] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="h-4 w-4" /> Jobseeker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('recruiter')}
              className={`py-2 px-[#275df5] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'recruiter'
                  ? 'bg-white text-[#275df5] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="h-4 w-4" /> Employer
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email ID / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className="input-field pl-10 text-slate-900"
                  placeholder="Enter your email ID"
                  {...register('email', { required: 'Email ID is required' })}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please reset password using registered email."); }} className="text-xs text-[#275df5] font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10 text-slate-900"
                  placeholder="Enter your password"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#275df5] hover:bg-[#1a4bd8] text-white font-semibold py-3.5 rounded-full transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  Login <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Perks Teaser */}
          <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-[#275df5]" /> Naukri AI Match Advantages:
            </p>
            <ul className="space-y-1 pl-5 list-disc text-slate-600">
              <li>Instant 1-Click Job Applications</li>
              <li>AI Resume Keyword Score & Skill Analysis</li>
              <li>Personalized Employer Recommendations</li>
            </ul>
          </div>
        </div>

        {/* Footer in Drawer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              onClick={closeLoginDrawer}
              className="text-[#275df5] font-bold hover:underline"
            >
              Register for FREE
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
