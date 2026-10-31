import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/common/ProtectedRoute'
import PublicLayout from '../layouts/PublicLayout'
import CandidateLayout from '../layouts/CandidateLayout'
import RecruiterLayout from '../layouts/RecruiterLayout'

// Public pages
import Home from '../pages/public/Home'
import Login from '../pages/public/Login'
import Register from '../pages/public/Register'
import Jobs from '../pages/public/Jobs'
import JobDetail from '../pages/public/JobDetail'
import About from '../pages/public/About'

// Candidate pages
import CandidateDashboard from '../pages/candidate/Dashboard'
import Profile from '../pages/candidate/Profile'
import Resume from '../pages/candidate/Resume'
import Applications from '../pages/candidate/Applications'
import SavedJobs from '../pages/candidate/SavedJobs'
import Recommendations from '../pages/candidate/Recommendations'
import SkillGap from '../pages/candidate/SkillGap'
import AICoach from '../pages/candidate/AICoach'
import InterviewPrep from '../pages/candidate/InterviewPrep'
import SalaryInsights from '../pages/candidate/SalaryInsights'
import CareerRoadmap from '../pages/candidate/CareerRoadmap'
import MockInterview from '../pages/candidate/MockInterview'
import CandidateMessages from '../pages/candidate/Messages'
import CandidateNotifications from '../pages/candidate/Notifications'
import CandidateSettings from '../pages/candidate/Settings'

// Recruiter pages
import RecruiterDashboard from '../pages/recruiter/Dashboard'
import Company from '../pages/recruiter/Company'
import RecruiterJobs from '../pages/recruiter/Jobs'
import CreateJob from '../pages/recruiter/CreateJob'
import RecruiterApplications from '../pages/recruiter/Applications'
import RecruiterAnalytics from '../pages/recruiter/Analytics'
import RecruiterMessages from '../pages/recruiter/Messages'
import RecruiterNotifications from '../pages/recruiter/Notifications'
import RecruiterSettings from '../pages/recruiter/Settings'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Candidate */}
          <Route path="/candidate" element={
            <ProtectedRoute roles={['CANDIDATE']}>
              <CandidateLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CandidateDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="resume" element={<Resume />} />
            <Route path="applications" element={<Applications />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="recommendations" element={<Recommendations />} />
            <Route path="skill-gap" element={<SkillGap />} />
            <Route path="ai-coach" element={<AICoach />} />
            <Route path="interview-prep" element={<InterviewPrep />} />
            <Route path="mock-interview" element={<MockInterview />} />
            <Route path="salary-insights" element={<SalaryInsights />} />
            <Route path="career-roadmap" element={<CareerRoadmap />} />
            <Route path="messages" element={<CandidateMessages />} />
            <Route path="notifications" element={<CandidateNotifications />} />
            <Route path="settings" element={<CandidateSettings />} />
          </Route>

          {/* Recruiter */}
          <Route path="/recruiter" element={
            <ProtectedRoute roles={['RECRUITER']}>
              <RecruiterLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="company" element={<Company />} />
            <Route path="jobs" element={<RecruiterJobs />} />
            <Route path="jobs/create" element={<CreateJob />} />
            <Route path="applications" element={<RecruiterApplications />} />
            <Route path="analytics" element={<RecruiterAnalytics />} />
            <Route path="messages" element={<RecruiterMessages />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
            <Route path="settings" element={<RecruiterSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
