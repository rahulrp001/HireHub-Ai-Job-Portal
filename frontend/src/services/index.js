import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  me: () => api.get('/auth/me/'),
  dashboardStats: () => api.get('/auth/dashboard-stats/'),
}

export const candidateService = {
  getProfile: () => api.get('/candidates/profile/'),
  updateProfile: (data) => api.patch('/candidates/profile/', data),
  getSkills: () => api.get('/candidates/my-skills/'),
  addSkill: (data) => api.post('/candidates/my-skills/', data),
  removeSkill: (id) => api.delete(`/candidates/my-skills/${id}/`),
  getAllSkills: () => api.get('/candidates/skills/'),
  getEducation: () => api.get('/candidates/education/'),
  addEducation: (data) => api.post('/candidates/education/', data),
  updateEducation: (id, data) => api.put(`/candidates/education/${id}/`, data),
  deleteEducation: (id) => api.delete(`/candidates/education/${id}/`),
  getExperience: () => api.get('/candidates/experience/'),
  addExperience: (data) => api.post('/candidates/experience/', data),
  updateExperience: (id, data) => api.put(`/candidates/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/candidates/experience/${id}/`),
}

export const jobService = {
  getJobs: (params) => api.get('/jobs/', { params }),
  getJob: (id) => api.get(`/jobs/${id}/`),
  saveJob: (id) => api.post(`/jobs/${id}/save/`),
  getSavedJobs: () => api.get('/jobs/saved/'),
  // Recruiter
  getMyJobs: () => api.get('/jobs/recruiter/jobs/'),
  createJob: (data) => api.post('/jobs/recruiter/jobs/', data),
  updateJob: (id, data) => api.patch(`/jobs/recruiter/jobs/${id}/`, data),
  deleteJob: (id) => api.delete(`/jobs/recruiter/jobs/${id}/`),
}

export const applicationService = {
  apply: (jobId, data) => api.post(`/applications/apply/${jobId}/`, data),
  getMyApplications: () => api.get('/applications/'),
  withdrawApplication: (id) => api.delete(`/applications/${id}/`),
  // Recruiter
  getRecruiterApplications: (jobId) =>
    jobId ? api.get(`/applications/recruiter/job/${jobId}/`) : api.get('/applications/recruiter/'),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status/`, data),
}

export const resumeService = {
  getResumes: () => api.get('/resumes/'),
  uploadResume: (formData) => api.post('/resumes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteResume: (id) => api.delete(`/resumes/${id}/`),
}

export const companyService = {
  getMyCompany: () => api.get('/companies/my-company/'),
  updateCompany: (data) => api.patch('/companies/my-company/', data),
}

export const messageService = {
  getConversations: () => api.get('/messages/'),
  getMessages: (userId) => api.get(`/messages/${userId}/`),
  sendMessage: (userId, data) => api.post(`/messages/${userId}/`, data),
}

export const notificationService = {
  getNotifications: () => api.get('/notifications/'),
  markAllRead: () => api.post('/notifications/mark-read/'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`),
}

export const aiService = {
  chat: (message) => api.post('/ai/chat/', { message }),
  getInterviewPrep: (jobId) => api.get(`/ai/interview-prep/${jobId}/`),
  getSalaryInsights: (params) => api.get('/ai/salary-insights/', { params }),
  getCareerRoadmap: (targetRole) => api.post('/ai/career-roadmap/', { target_role: targetRole }),
}
