import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    try {
      const user = await login(data)
      if (user.role === 'CANDIDATE') navigate('/candidate/dashboard')
      else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#f4f5f8] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-slate-200/80">
        
        {/* Left Info Banner (Naukri style) */}
        <div className="bg-gradient-to-br from-[#0f2851] to-[#002a7b] text-white p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8 text-blue-200 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Naukri AI Career Hub
            </div>

            <h1 className="text-3xl font-black tracking-tight mb-4 leading-tight">
              Find your dream job & let employers find you.
            </h1>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
              Join millions of professionals building their careers with AI-powered resume scoring, skill recommendations, and instant job applications.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Over 500,000+ active job vacancies</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Direct connect with top hiring MNCs</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>AI Resume Parsing & Match Rating</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-slate-500 text-xs mt-1">Or click Login in top bar to use the slide drawer</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="name@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
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
              className="w-full bg-[#275df5] hover:bg-[#1a4bd8] text-white font-semibold py-3.5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : <>Login <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#275df5] font-bold hover:underline">
              Register for Free
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
