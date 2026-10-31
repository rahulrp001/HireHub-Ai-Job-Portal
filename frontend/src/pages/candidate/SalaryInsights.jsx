import { useState, useEffect } from 'react'
import { aiService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { DollarSign, TrendingUp, MapPin, Briefcase } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'DevOps Engineer',
  'Cloud Engineer', 'Mobile Developer', 'UI UX Designer', 'Product Manager',
  'QA Engineer', 'Cybersecurity Engineer', 'Blockchain Developer',
]

const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Gurgaon', 'Noida', 'Remote', 'Other']

const LEVEL_COLORS = { fresher: '#94a3b8', junior: '#60a5fa', mid: '#3b82f6', senior: '#1d4ed8' }

function formatSalary(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  return `₹${(amount / 1000).toFixed(0)}K`
}

export default function SalaryInsights() {
  const { user } = useAuth()
  const [form, setForm] = useState({ role: 'Software Engineer', years: 0, location: 'Bangalore' })
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const { data } = await aiService.getSalaryInsights({
        role: form.role, years: form.years, location: form.location,
      })
      setInsights(data.insights)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchInsights() }, [])

  const chartData = insights ? Object.entries(insights.all_levels).map(([level, data]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    min: data.min,
    avg: data.avg,
    max: data.max,
    isCurrentLevel: level === insights.experience_level,
  })) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Insights</h1>
          <p className="text-gray-500 text-sm">Market salary data based on role, experience & location</p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Briefcase className="h-4 w-4" /> Role
            </label>
            <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Years of Experience
            </label>
            <input type="number" min="0" max="30" className="input-field"
              value={form.years} onChange={e => setForm(f => ({ ...f, years: parseInt(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Location
            </label>
            <select className="input-field" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <button onClick={fetchInsights} disabled={loading} className="btn-primary mt-4">
          {loading ? 'Calculating...' : 'Get Salary Insights'}
        </button>
      </div>

      {insights && (
        <>
          {/* Main salary card */}
          <div className="card bg-gradient-to-br from-green-600 to-emerald-700 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-200 text-sm">{insights.role} • {insights.location} • {insights.experience_level.charAt(0).toUpperCase() + insights.experience_level.slice(1)} Level</p>
                <div className="mt-3">
                  <p className="text-4xl font-bold">{formatSalary(insights.salary_min)} — {formatSalary(insights.salary_max)}</p>
                  <p className="text-green-200 mt-1">Average: {formatSalary(insights.salary_avg)} per year</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-200 text-xs">Based on {form.years} years exp</p>
                {insights.skill_bonus_pct > 0 && (
                  <div className="mt-2 bg-white/20 rounded-lg px-3 py-2">
                    <p className="text-sm font-semibold">+{insights.skill_bonus_pct}% skill premium</p>
                    <p className="text-xs text-green-200">for {insights.premium_skills.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Salary by Experience Level</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => formatSalary(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatSalary(value)} />
                <Bar dataKey="avg" name="Average Salary" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.isCurrentLevel ? '#10b981' : LEVEL_COLORS[entry.level.toLowerCase()] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 justify-center">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" /> Your Level</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm inline-block" /> Other Levels</span>
            </div>
          </div>

          {/* All levels breakdown */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Detailed Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(insights.all_levels).map(([level, data]) => (
                <div key={level} className={`p-4 rounded-lg border ${level === insights.experience_level ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 capitalize">{level}</span>
                      {level === insights.experience_level && (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Your Level</span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{formatSalary(data.min)} — {formatSalary(data.max)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(data.avg / insights.all_levels.senior.max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">Avg: {formatSalary(data.avg)}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">{insights.note}</p>
          </div>
        </>
      )}
    </div>
  )
}
