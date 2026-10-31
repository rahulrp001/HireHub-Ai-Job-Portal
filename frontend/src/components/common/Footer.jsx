import { Link } from 'react-router-dom'
import { Sparkles, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400 text-xs py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-[#275df5] text-white p-1.5 rounded-lg font-black text-lg tracking-tight">
                HH
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Hire<span className="text-[#275df5]">Hub</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Naukri-inspired job search & AI talent matching platform. Connect with top Indian and Global MNC employers today.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="h-4 w-4" /> 100% Verified Job Postings & ATS Resume Parsing
            </div>
          </div>

          {/* Col 2: Job Seekers */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">For Jobseekers</h4>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse All Jobs</Link></li>
              <li><Link to="/jobs?work_mode=REMOTE" className="hover:text-white transition-colors">Remote Jobs</Link></li>
              <li><Link to="/jobs?job_type=FULL_TIME" className="hover:text-white transition-colors">IT & Software Jobs</Link></li>
              <li><Link to="/candidate/resume" className="hover:text-white transition-colors">AI Resume Analyzer</Link></li>
              <li><Link to="/candidate/skill-gap" className="hover:text-white transition-colors">Skill Gap Insights</Link></li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">For Employers</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="hover:text-white transition-colors">Post Job Vacancies</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Candidate Search</Link></li>
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Portal</Link></li>
              <li><Link to="/recruiter/analytics" className="hover:text-white transition-colors">AI Hiring Analytics</Link></li>
            </ul>
          </div>

          {/* Col 4: FastForward Services */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> FastForward
            </h4>
            <ul className="space-y-2">
              <li><Link to="/candidate/interview-prep" className="hover:text-white transition-colors">Mock AI Interviews</Link></li>
              <li><Link to="/candidate/salary-insights" className="hover:text-white transition-colors">Salary Benchmarking</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About HireHub</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireHub Services (Naukri Interface Edition). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <a href="#security" className="hover:text-slate-300">Trust & Security</a>
          </div>
        </div>

      </div>
    </footer>
  )
}
