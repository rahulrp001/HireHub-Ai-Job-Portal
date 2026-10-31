import { Link } from 'react-router-dom'
import { Brain, FileSearch, BarChart2, Briefcase, Bot, DollarSign, Map, Users, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  { icon: FileSearch, title: 'AI Resume Parsing', desc: 'Upload PDF/DOCX — AI extracts skills, education, experience automatically and gives a score.' },
  { icon: Brain, title: 'Smart Job Matching', desc: 'AI matches your skills to jobs and shows a match percentage for every listing.' },
  { icon: BarChart2, title: 'Skill Gap Analyzer', desc: 'See exactly which skills you are missing for any job with learning resource links.' },
  { icon: Bot, title: 'AI Career Coach', desc: 'Chat with our AI agent for resume tips, salary info, interview prep and career advice.' },
  { icon: Brain, title: 'Interview Prep AI', desc: 'Get job-specific technical, practical and HR questions. Practice answers right in the app.' },
  { icon: DollarSign, title: 'Salary Insights', desc: 'Market salary data by role, experience and location with skill premium calculator.' },
  { icon: Map, title: 'Career Roadmap', desc: 'Get a personalized step-by-step learning path to your target role with resources.' },
  { icon: Briefcase, title: 'Real-time Tracking', desc: 'Track every application with a live status timeline from Applied to Selected.' },
]

const stats = [
  { value: '10K+', label: 'Active Jobs' },
  { value: '50K+', label: 'Candidates' },
  { value: '5K+', label: 'Companies' },
  { value: '95%', label: 'Match Accuracy' },
]

export default function About() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f2851] to-[#002a7b] text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6">
            <Brain className="h-4 w-4 text-yellow-400" /> AI-Powered Job Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            About <span className="text-blue-300">HireHub</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            HireHub is a next-generation job portal that uses AI to connect the right candidates with the right jobs — faster, smarter, and more accurately than traditional platforms.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-blue-600">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            We believe finding the right job should not be a guessing game. HireHub uses AI to analyze your skills, match you with relevant opportunities, identify your skill gaps, and guide your career growth — all in one platform.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Makes HireHub Unique</h2>
            <p className="text-gray-500 mt-2">Features no other job portal offers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> For Candidates
              </h3>
              {[
                'Register and create your profile',
                'Upload resume — AI parses skills automatically',
                'Browse jobs with AI match scores',
                'Use Skill Gap Analyzer to identify missing skills',
                'Chat with AI Career Coach for guidance',
                'Apply and track applications in real-time',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-gray-600 text-sm">{step}</p>
                </div>
              ))}
              <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-4 text-sm">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-600" /> For Recruiters
              </h3>
              {[
                'Register as Employer and set up company profile',
                'Post jobs with required skills',
                'AI automatically ranks candidates by match score',
                'Review AI-scored applications in one dashboard',
                'Shortlist, schedule interviews, and hire',
                'Track hiring funnel with analytics',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 mb-3">
                  <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                  <p className="text-gray-600 text-sm">{step}</p>
                </div>
              ))}
              <Link to="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors mt-4 text-sm">
                Post a Job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built With</h2>
          <p className="text-gray-500 mb-8">Modern tech stack for a production-ready platform</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Django REST Framework', 'React.js', 'PostgreSQL', 'Tailwind CSS', 'JWT Auth', 'Python AI Services', 'Recharts', 'Vite'].map(tech => (
              <span key={tech} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to find your next opportunity?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join HireHub today and let AI guide your career journey.</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/register" className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/jobs" className="bg-blue-500/30 border border-blue-400/50 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500/50 transition-colors">
            Browse Jobs
          </Link>
        </div>
      </section>
    </div>
  )
}
