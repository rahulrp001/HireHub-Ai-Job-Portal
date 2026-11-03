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
  createSkill: (data) => api.post('/candidates/skills/', data),
  getEducation: () => api.get('/candidates/education/'),
  addEducation: (data) => api.post('/candidates/education/', data),
  updateEducation: (id, data) => api.put(`/candidates/education/${id}/`, data),
  deleteEducation: (id) => api.delete(`/candidates/education/${id}/`),
  getExperience: () => api.get('/candidates/experience/'),
  addExperience: (data) => api.post('/candidates/experience/', data),
  updateExperience: (id, data) => api.put(`/candidates/experience/${id}/`, data),
  deleteExperience: (id) => api.delete(`/candidates/experience/${id}/`),
}

const SEED_JOBS = [
  { title: 'Senior React Developer', description: 'Build scalable frontend applications using React and TypeScript.', requirements: '3+ years React experience', responsibilities: 'Develop UI components, code reviews', required_skills: ['React', 'TypeScript', 'CSS', 'Git'], preferred_skills: ['Next.js', 'GraphQL'], location: 'Bangalore, India', job_type: 'FULL_TIME', work_mode: 'HYBRID', salary_min: 1200000, salary_max: 2000000, experience_min: 3, experience_max: 6, education_required: 'B.Tech in CS or equivalent', status: 'PUBLISHED' },
  { title: 'Backend Engineer - Python/Django', description: 'Design and maintain REST APIs for our core platform.', requirements: '2+ years Django/FastAPI', responsibilities: 'API development, DB optimization', required_skills: ['Python', 'Django', 'PostgreSQL', 'REST API'], preferred_skills: ['Docker', 'Redis'], location: 'Mumbai, India', job_type: 'FULL_TIME', work_mode: 'REMOTE', salary_min: 1000000, salary_max: 1800000, experience_min: 2, experience_max: 5, education_required: 'B.Tech / MCA', status: 'PUBLISHED' },
  { title: 'DevOps Engineer', description: 'Manage CI/CD pipelines and cloud infrastructure on AWS.', requirements: 'Experience with Docker, Kubernetes, AWS', responsibilities: 'Infrastructure automation, monitoring', required_skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], preferred_skills: ['GCP', 'Ansible'], location: 'Hyderabad, India', job_type: 'FULL_TIME', work_mode: 'ON_SITE', salary_min: 1400000, salary_max: 2400000, experience_min: 3, experience_max: 7, education_required: 'B.Tech in CS/IT', status: 'PUBLISHED' },
  { title: 'Data Scientist', description: 'Build ML models to improve product recommendations and analytics.', requirements: 'Strong Python, ML frameworks', responsibilities: 'Model training, A/B testing, data pipelines', required_skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'], preferred_skills: ['PyTorch', 'Spark'], location: 'Pune, India', job_type: 'FULL_TIME', work_mode: 'HYBRID', salary_min: 1500000, salary_max: 2800000, experience_min: 2, experience_max: 6, education_required: 'M.Tech / M.Sc in Data Science', status: 'PUBLISHED' },
  { title: 'Full Stack Developer', description: 'Work across frontend and backend to ship product features end-to-end.', requirements: 'React + Node.js or Django', responsibilities: 'Feature development, bug fixes, deployments', required_skills: ['React', 'Node.js', 'SQL', 'Git'], preferred_skills: ['TypeScript', 'Docker'], location: 'Chennai, India', job_type: 'FULL_TIME', work_mode: 'REMOTE', salary_min: 900000, salary_max: 1600000, experience_min: 1, experience_max: 4, education_required: 'B.Tech or equivalent', status: 'PUBLISHED' },
  { title: 'UI/UX Designer', description: 'Design intuitive user experiences for web and mobile products.', requirements: 'Proficiency in Figma, user research skills', responsibilities: 'Wireframing, prototyping, design systems', required_skills: ['Figma', 'HTML', 'CSS'], preferred_skills: ['Photoshop', 'Framer'], location: 'Delhi, India', job_type: 'FULL_TIME', work_mode: 'HYBRID', salary_min: 800000, salary_max: 1400000, experience_min: 2, experience_max: 5, education_required: 'B.Des or equivalent', status: 'PUBLISHED' },
  { title: 'Mobile Developer - React Native', description: 'Build cross-platform mobile apps for iOS and Android.', requirements: 'React Native, REST API integration', responsibilities: 'App development, performance optimization', required_skills: ['React Native', 'JavaScript', 'REST API', 'Git'], preferred_skills: ['TypeScript', 'Firebase'], location: 'Bangalore, India', job_type: 'FULL_TIME', work_mode: 'REMOTE', salary_min: 1000000, salary_max: 1800000, experience_min: 2, experience_max: 5, education_required: 'B.Tech in CS or equivalent', status: 'PUBLISHED' },
  { title: 'QA Engineer', description: 'Ensure product quality through manual and automated testing.', requirements: 'Selenium, API testing, test planning', responsibilities: 'Test case writing, regression testing, bug reporting', required_skills: ['Selenium', 'Python', 'REST API', 'SQL'], preferred_skills: ['Cypress', 'Postman'], location: 'Noida, India', job_type: 'FULL_TIME', work_mode: 'ON_SITE', salary_min: 700000, salary_max: 1200000, experience_min: 1, experience_max: 4, education_required: 'B.Tech / BCA', status: 'PUBLISHED' },
  { title: 'Product Manager', description: 'Drive product strategy and roadmap for our SaaS platform.', requirements: 'Experience in B2B SaaS product management', responsibilities: 'Roadmap planning, stakeholder management, sprint grooming', required_skills: ['Product Strategy', 'Agile', 'SQL', 'Figma'], preferred_skills: ['JIRA', 'Mixpanel'], location: 'Mumbai, India', job_type: 'FULL_TIME', work_mode: 'HYBRID', salary_min: 1800000, salary_max: 3200000, experience_min: 4, experience_max: 8, education_required: 'MBA or B.Tech', status: 'PUBLISHED' },
  { title: 'Cloud Solutions Architect', description: 'Design and implement scalable cloud architectures on AWS/GCP.', requirements: 'AWS Solutions Architect certification preferred', responsibilities: 'Architecture design, cost optimization, security reviews', required_skills: ['AWS', 'GCP', 'Terraform', 'Docker', 'Kubernetes'], preferred_skills: ['Azure', 'Python'], location: 'Hyderabad, India', job_type: 'FULL_TIME', work_mode: 'REMOTE', salary_min: 2500000, salary_max: 4500000, experience_min: 6, experience_max: 12, education_required: 'B.Tech in CS/IT', status: 'PUBLISHED' },
]

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
  seedJobs: (count = 1000) => api.post('/jobs/recruiter/jobs/seed_bulk/', { count }),
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
  updateCompany: (data) => api.patch(
    '/companies/my-company/',
    data,
    data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
  ),
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

export const adminService = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (params) => api.get('/admin/users/', { params }),
  toggleUser: (id, is_active) => api.patch(`/admin/users/${id}/`, { is_active }),
  deleteUser: (id) => api.delete(`/admin/users/${id}/`),
  getJobs: (params) => api.get('/admin/jobs/', { params }),
  updateJobStatus: (id, status) => api.patch(`/admin/jobs/${id}/`, { status }),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}/`),
  getApplications: (params) => api.get('/admin/applications/', { params }),
  getCompanies: () => api.get('/admin/companies/'),
}

export const aiService = {
  chat: (message) => api.post('/ai/chat/', { message }),
  getInterviewPrep: (jobId) => api.get(`/ai/interview-prep/${jobId}/`),
  getSalaryInsights: (params) => api.get('/ai/salary-insights/', { params }),
  getCareerRoadmap: (targetRole) => api.post('/ai/career-roadmap/', { target_role: targetRole }),
}
