import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, User, Building2, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

export default function Register() {
  const { register: registerUser, openLoginDrawer } = useAuth()
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'CANDIDATE' }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    setError('')
    try {
      await registerUser(data)
      navigate('/login')
    } catch (err) {
      const errData = err.response?.data
      if (errData && typeof errData === 'object') {
        const messages = Object.entries(errData).map(([key, val]) => {
          const msgs = Array.isArray(val) ? val.join(', ') : val
          return key === 'non_field_errors' || key === 'message' ? msgs : `${key}: ${msgs}`
        })
        setError(messages.join(' | '))
      } else {
        setError('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-[85vh] bg-[#f4f5f8] flex items-center justify-center p-4 py-8">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 overflow-hidden border border-slate-200/80">
        
        {/* Left Side Banner (Naukri style) */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#0a1f44] via-[#0f2851] to-[#002a7b] text-white p-8 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 text-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Naukri Career Portal
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-4 leading-tight">
              {selectedRole === 'CANDIDATE' ? 'Build your profile & get headhunted' : 'Hire top tech & business talent'}
            </h2>
            
            <p className="text-blue-100/80 text-xs leading-relaxed mb-6">
              {selectedRole === 'CANDIDATE'
                ? 'Create a free account to receive AI job recommendations, ATS resume scores, and 1-click applications.'
                : 'Access qualified candidate profiles, AI resume scoring, and automatic applicant screening.'}
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2.5 text-xs text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>100% Verified Employer Jobs</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-blue-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Free AI Skill Gap Analysis</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-blue-100">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Data privacy guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right Registration Form */}
        <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Find your dream job</h1>
            <p className="text-xs text-slate-500 mt-1">Register for free and start applying in minutes</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                I am registering as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedRole === 'CANDIDATE' ? 'border-[#275df5] bg-blue-50/50 text-[#275df5]' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input type="radio" value="CANDIDATE" className="hidden" {...register('role')} />
                  <User className="h-4 w-4" />
                  <span className="font-bold text-xs">Jobseeker</span>
                </label>

                <label className={`flex items-center justify-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedRole === 'RECRUITER' ? 'border-[#275df5] bg-blue-50/50 text-[#275df5]' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}>
                  <input type="radio" value="RECRUITER" className="hidden" {...register('role')} />
                  <Building2 className="h-4 w-4" />
                  <span className="font-bold text-xs">Employer</span>
                </label>
              </div>
            </div>

            {/* Name Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">First Name</label>
                <input className="input-field" placeholder="John"
                  {...register('first_name', { required: 'Required' })} />
                {errors.first_name && <p className="text-rose-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Last Name</label>
                <input className="input-field" placeholder="Doe"
                  {...register('last_name', { required: 'Required' })} />
                {errors.last_name && <p className="text-rose-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Username</label>
              <input className="input-field" placeholder="johndoe"
                {...register('username', { required: 'Username is required' })} />
              {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email ID</label>
              <input type="email" className="input-field" placeholder="name@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field pr-10" placeholder="Minimum 8 characters"
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password"
                {...register('password2', {
                  required: 'Please confirm password',
                  validate: (val) => val === watch('password') || 'Passwords do not match'
                })} />
              {errors.password2 && <p className="text-rose-500 text-xs mt-1">{errors.password2.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#275df5] hover:bg-[#1a4bd8] text-white font-bold py-3.5 rounded-full transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? 'Creating account...' : <>Register Now <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-5">
            Already registered?{' '}
            <button
              type="button"
              onClick={openLoginDrawer}
              className="text-[#275df5] font-bold hover:underline"
            >
              Login now
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}
