import { useState, useEffect } from 'react'
import { 
  X, Calendar, Clock, Video, MapPin, Mail, CheckCircle2, 
  Sparkles, Building2, Send, Eye, AlertCircle, ExternalLink, User 
} from 'lucide-react'

export default function ScheduleInterviewModal({ 
  isOpen, 
  onClose, 
  application, 
  onUpdateSuccess 
}) {
  if (!isOpen || !application) return null

  const candidate = application.candidate_detail || {}
  const job = application.job_detail || {}
  const companyName = job.company?.name || 'Your Company'
  const companyLocation = job.location || job.company?.location || 'Bangalore, India'

  const [status, setStatus] = useState(application.status || 'INTERVIEW')
  const [interviewMode, setInterviewMode] = useState(application.interview_mode || 'VIRTUAL')
  const [interviewDate, setInterviewDate] = useState(() => {
    if (application.interview_date) {
      try {
        const d = new Date(application.interview_date)
        return d.toISOString().slice(0, 16)
      } catch {
        return ''
      }
    }
    // Default tomorrow at 11:00 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(11, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  })
  
  const [interviewRound, setInterviewRound] = useState(
    application.interview_round || 'Round 1: Technical & Live Coding'
  )
  const [interviewLocation, setInterviewLocation] = useState(
    application.interview_location || (
      application.interview_mode === 'OFFLINE' ? companyLocation : 'https://meet.google.com/hirehub-room'
    )
  )
  const [interviewNotes, setInterviewNotes] = useState(
    application.interview_notes || ''
  )
  const [sendEmail, setSendEmail] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Adjust default location when mode switches
  const handleModeChange = (mode) => {
    setInterviewMode(mode)
    if (mode === 'VIRTUAL' && (!interviewLocation || interviewLocation === companyLocation)) {
      setInterviewLocation('https://meet.google.com/hirehub-room')
    } else if (mode === 'OFFLINE' && (!interviewLocation || interviewLocation.startsWith('http'))) {
      setInterviewLocation(companyLocation)
    }
  }

  // Quick chips for interview date
  const setQuickDate = (daysFromNow, hour) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    d.setHours(hour, 0, 0, 0)
    setInterviewDate(d.toISOString().slice(0, 16))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      status,
      send_email: sendEmail,
    }

    if (status === 'INTERVIEW' || status === 'SHORTLISTED') {
      payload.interview_date = interviewDate ? new Date(interviewDate).toISOString() : null
      payload.interview_mode = interviewMode
      payload.interview_location = interviewLocation
      payload.interview_round = interviewRound
      payload.interview_notes = interviewNotes
    } else if (status === 'SELECTED') {
      payload.interview_notes = interviewNotes || 'Congratulations on your job selection! Our HR team will reach out with your appointment letter.'
    }

    try {
      await onUpdateSuccess(application.id, payload)
      onClose()
    } catch (err) {
      console.error(err)
      setError(err?.response?.data?.message || err?.message || 'Failed to update application status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0a1f44] via-[#0f2851] to-[#1e3a8a] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute right-5 top-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-bold px-3 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
              <Mail className="h-3 w-3 text-amber-300" /> Automated Candidate Email Integration
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            Update Status & Interview Details
          </h2>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-blue-100">
            <span className="flex items-center gap-1 font-semibold text-white">
              <User className="h-3.5 w-3.5 text-blue-300" /> {candidate.full_name || 'Candidate'}
            </span>
            <span>•</span>
            <span className="text-blue-200">{candidate.email}</span>
            <span>•</span>
            <span className="font-medium text-amber-300">{job.title}</span>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Status Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Decision / Application Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'INTERVIEW', label: '📅 Schedule Interview', color: 'border-blue-500 bg-blue-50 text-blue-700' },
                { key: 'SELECTED', label: '🎉 Select (Confirm Job)', color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
                { key: 'SHORTLISTED', label: '⭐ Shortlist Profile', color: 'border-purple-500 bg-purple-50 text-purple-700' },
                { key: 'REJECTED', label: '❌ Not Moving Forward', color: 'border-rose-500 bg-rose-50 text-rose-700' },
              ].map(st => (
                <button
                  type="button"
                  key={st.key}
                  onClick={() => setStatus(st.key)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                    status === st.key 
                      ? `${st.color} shadow-sm ring-2 ring-blue-500/30 font-black`
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Selection Offer Banner (If Selected) */}
          {status === 'SELECTED' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Job Confirmation Notification
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Candidate ko instant email dispatch hoga: <b>"Job Offer Confirmed: Selection for {job.title} at {companyName}"</b> jisme hiring confirmation and onboarding details shamil rahengi.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1 mt-2">
                  Hiring Note / Next Steps for Candidate
                </label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  placeholder="Welcome to the team! Our HR manager will reach out with the formal appointment letter..."
                  className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          )}

          {/* 3. Interview Scheduling Section (If Interview or Shortlisted) */}
          {(status === 'INTERVIEW' || status === 'SHORTLISTED') && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-600" /> Interview Mode & Schedule
                </span>
                <span className="text-[11px] text-slate-500">
                  Candidate will be informed whether it is <b>Virtual</b> or <b>Offline</b>.
                </span>
              </div>

              {/* Mode Toggle: Virtual vs Offline */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Interview Location / Mode:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleModeChange('VIRTUAL')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      interviewMode === 'VIRTUAL'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="h-4 w-4" /> 💻 Virtual (Online Video Call)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('OFFLINE')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      interviewMode === 'OFFLINE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="h-4 w-4" /> 🏢 Offline (In-Person / Office)
                  </button>
                </div>
              </div>

              {/* Date & Time Picker + Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Interview Date & Time (IST)
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickDate(1, 11)}
                      className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium"
                    >
                      Tomorrow 11 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1, 15)}
                      className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium"
                    >
                      Tomorrow 3 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(2, 11)}
                      className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-medium"
                    >
                      +2 Days
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Round Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Interview Round / Stage
                </label>
                <input
                  type="text"
                  value={interviewRound}
                  onChange={e => setInterviewRound(e.target.value)}
                  placeholder="e.g. Technical Round 1, System Design, HR Discussion"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Location Value: Meeting Link or Office Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {interviewMode === 'VIRTUAL' ? 'Video Meeting Link (Google Meet / Zoom)' : 'Office Venue & Address'}
                  </label>
                  {interviewMode === 'OFFLINE' && (
                    <button
                      type="button"
                      onClick={() => setInterviewLocation(companyLocation)}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Use Company Office Address
                    </button>
                  )}
                  {interviewMode === 'VIRTUAL' && (
                    <button
                      type="button"
                      onClick={() => setInterviewLocation('https://meet.google.com/hirehub-' + Math.random().toString(36).substring(7))}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Generate Meet Link
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={e => setInterviewLocation(e.target.value)}
                  placeholder={interviewMode === 'VIRTUAL' ? 'https://meet.google.com/xyz-abc' : 'Building No, Floor, Street, City, Pincode'}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Preparation / Instructions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Candidate Instructions & Preparation Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  placeholder={
                    interviewMode === 'VIRTUAL' 
                      ? 'Please join with high-speed internet and code editor ready.' 
                      : 'Please carry 2 copies of your resume and a government photo ID at the reception.'
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          {/* 4. Instant Email Checkbox & Preview Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input 
                type="checkbox" 
                checked={sendEmail} 
                onChange={e => setSendEmail(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Send instant confirmation email to <b>{candidate.email}</b></span>
            </label>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" /> {showPreview ? 'Hide Preview' : 'Email Preview'}
            </button>
          </div>

          {/* 5. Live Email Preview */}
          {showPreview && (
            <div className="border border-slate-300 rounded-2xl p-4 bg-white text-xs space-y-3 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">Recipient: {candidate.email}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 font-mono">
                  Subject: {status === 'SELECTED' 
                    ? `🎉 Job Offer Confirmed: Selection for ${job.title} at ${companyName}`
                    : `📅 Interview Scheduled: ${job.title} at ${companyName} [${interviewMode === 'VIRTUAL' ? 'Virtual Video Call' : 'In-Person / Office'}]`}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <p><b>Dear {candidate.full_name || 'Candidate'},</b></p>
                {status === 'SELECTED' ? (
                  <p className="text-emerald-700 font-medium">
                    We are thrilled to inform you that you have been <b>SELECTED</b> for the position of <b>{job.title}</b> at <b>{companyName}</b>!
                  </p>
                ) : (
                  <p>
                    The hiring team at <b>{companyName}</b> has scheduled your interview for <b>{job.title}</b>.
                  </p>
                )}

                {(status === 'INTERVIEW' || status === 'SHORTLISTED') && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 my-2">
                    <div><b>Mode:</b> {interviewMode === 'VIRTUAL' ? '💻 Virtual Video Call' : '🏢 Offline / Office'}</div>
                    <div><b>Date & Time:</b> {interviewDate ? new Date(interviewDate).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }) : 'To be coordinated'}</div>
                    <div><b>Round:</b> {interviewRound}</div>
                    <div><b>{interviewMode === 'VIRTUAL' ? 'Meeting Link' : 'Venue'}:</b> <span className="text-blue-600">{interviewLocation}</span></div>
                    {interviewNotes && <div><b>Instructions:</b> {interviewNotes}</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Updating & Dispatching...</span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Confirm Status & Send Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

