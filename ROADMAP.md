# HireHub - Complete Project Roadmap
> AI-Powered Smart Job Portal | Major Project

---

## Current Status (What's Already Built ~40%)

### Backend (Django REST API) ✅
- User auth (JWT login/register/logout)
- Candidate profile, skills, education, experience
- Jobs CRUD (recruiter side)
- Job applications (apply, withdraw, status update)
- Resume upload + basic AI parsing (PDF/DOCX)
- Basic AI job matcher (skill score + experience score)
- Basic recommendation engine
- Messaging system (models + API)
- Notifications system (models + API)
- Companies module

### Frontend (React + Tailwind) ✅
- Public pages: Home, Jobs listing, Job detail, Login, Register, About
- Candidate layout with sidebar navigation
- Recruiter layout
- Candidate Dashboard (stats + charts)
- Candidate Profile page
- Candidate Resume upload page
- Recruiter Dashboard, Jobs, Create Job, Applications, Company pages

### What's "Coming Soon" (Placeholder only) ❌
- Candidate Applications page
- Candidate Recommendations page
- Candidate Skill Gap page
- Candidate Messages page
- Candidate Notifications page
- Candidate Settings page
- Recruiter Messages, Notifications, Settings pages

---

## What Needs to Be Built (60% remaining)

---

## PHASE 1 — Complete Existing Features (Priority: HIGH)
> These pages exist but show "Coming soon". Backend APIs are ready.

### 1.1 Candidate Applications Page
**File:** `frontend/src/pages/candidate/Applications.jsx`
- Show all applied jobs with status badges
- Real-time status timeline (Applied → Review → Shortlisted → Interview → Selected/Rejected)
- AI match score display per application
- Withdraw application button
- Filter by status

### 1.2 Candidate Recommendations Page
**File:** `frontend/src/pages/candidate/Recommendations.jsx`
- AI-matched jobs list with match percentage
- Skill match breakdown (matched vs missing skills)
- One-click apply from recommendations
- "Why this job?" explanation card

### 1.3 Skill Gap Analyzer Page
**File:** `frontend/src/pages/candidate/SkillGap.jsx`
- Select a job → see skill gap analysis
- Visual progress bars for each skill
- Missing skills highlighted in red
- Learning resource links for each missing skill (Coursera, YouTube, Udemy)
- Overall match percentage donut chart

### 1.4 Candidate Messages Page
**File:** `frontend/src/pages/candidate/Messages.jsx`
- Conversation list (left panel)
- Chat window (right panel)
- Send/receive messages with recruiters

### 1.5 Candidate Notifications Page
**File:** `frontend/src/pages/candidate/Notifications.jsx`
- List all notifications
- Mark as read / mark all read
- Different icons for different notification types

### 1.6 Candidate Settings Page
**File:** `frontend/src/pages/candidate/Settings.jsx`
- Change password
- Email notification preferences
- Account deletion option

### 1.7 Recruiter Messages, Notifications, Settings
**Files:** `frontend/src/pages/recruiter/Messages.jsx`, `Notifications.jsx`, `Settings.jsx`
- Same as candidate side but recruiter context

---

## PHASE 2 — Unique AI Features (Priority: HIGH — These make it stand out)

### 2.1 AI Career Coach (Chat Agent)
**What it does:** A chat-based AI assistant that answers career questions
- "Which skills should I learn for a Data Scientist role?"
- "How do I improve my resume?"
- "What salary should I expect with 3 years of Python experience?"
- "Prepare me for a React developer interview"

**Backend:**
- New app: `ai_coach/`
- `ai_coach/views.py` → POST `/api/ai-coach/chat/` endpoint
- Uses rule-based + keyword matching engine (no paid API needed)
- Pre-built responses for: resume tips, skill advice, salary ranges, interview prep

**Frontend:**
- New page: `frontend/src/pages/candidate/AICoach.jsx`
- Chat UI with message bubbles
- Quick suggestion chips (pre-built questions)
- Add to sidebar nav + routes

### 2.2 Resume Score + AI Improvement Suggestions
**What it does:** After uploading resume, give a score (0-100) with specific improvement tips
- Score based on: skills count, experience, education, contact info, keywords
- Tips like: "Add more technical skills", "Include GitHub link", "Add project descriptions"
- Compare resume against a specific job description

**Backend:**
- New endpoint in `resumes/views.py` → GET `/api/resumes/{id}/score/`
- Scoring logic in `ai_services/resume_scorer.py`

**Frontend:**
- Add score card to `frontend/src/pages/candidate/Resume.jsx`
- Show improvement checklist

### 2.3 Interview Prep AI
**What it does:** Generate interview questions based on a specific job
- Technical questions based on required skills
- HR/behavioral questions
- Company-specific questions
- "Practice Mode" — show question, user types answer, get feedback

**Backend:**
- New endpoint: GET `/api/jobs/{id}/interview-prep/`
- Logic in `ai_services/interview_prep.py`
- Pre-built question bank by skill/technology

**Frontend:**
- New page: `frontend/src/pages/candidate/InterviewPrep.jsx`
- Add route `/candidate/interview-prep`
- Card-flip style question display

### 2.4 Salary Insights
**What it does:** Show salary ranges based on skills, experience, location
- "Python Developer with 3 years exp in Bangalore → ₹8-15 LPA"
- Comparison chart: your expected salary vs market
- Salary trend by skill

**Backend:**
- New endpoint: GET `/api/salary-insights/`
- Static salary data JSON (India market data)
- `ai_services/salary_insights.py`

**Frontend:**
- New page: `frontend/src/pages/candidate/SalaryInsights.jsx`
- Bar charts using Recharts (already installed)

### 2.5 Career Roadmap Generator
**What it does:** Based on current skills → show path to target role
- "I know HTML/CSS → I want to become Full Stack Developer"
- Step-by-step skill learning path
- Estimated time for each step
- Progress tracking (mark skills as learned)

**Backend:**
- New endpoint: POST `/api/career-roadmap/`
- Predefined roadmaps for 10+ roles in `ai_services/career_roadmap.py`

**Frontend:**
- New page: `frontend/src/pages/candidate/CareerRoadmap.jsx`
- Visual timeline/stepper UI

---

## PHASE 3 — Recruiter Unique Features (Priority: MEDIUM)

### 3.1 AI Candidate Ranking Dashboard
**What it does:** Recruiter sees all applicants ranked by AI match score
- Sort by: AI score, experience, skills match
- Quick view: matched skills, missing skills, experience
- Bulk status update (shortlist top 10)
- Export applicants to CSV

**Backend:**
- Already has `ai_match_score` in JobApplication model ✅
- Add bulk status update endpoint in `applications/views.py`
- Add CSV export endpoint

**Frontend:**
- Enhance `frontend/src/pages/recruiter/Applications.jsx`
- Add ranking table with AI scores
- Bulk action buttons

### 3.2 Job Post AI Assistant
**What it does:** Help recruiter write better job descriptions
- Auto-suggest required skills based on job title
- Auto-fill salary range based on role + location
- Warn if job description is too short/vague

**Frontend:**
- Enhance `frontend/src/pages/recruiter/CreateJob.jsx`
- Add AI suggestion panel on the right side

### 3.3 Recruiter Analytics Dashboard
**What it does:** Show hiring funnel metrics
- Applications per job over time
- Conversion rates (Applied → Shortlisted → Selected)
- Average time to hire
- Top skills among applicants

**Frontend:**
- Enhance `frontend/src/pages/recruiter/Dashboard.jsx`
- Add more charts using Recharts

---

## PHASE 4 — Real-time Features (Priority: MEDIUM)

### 4.1 Real-time Application Status Updates
**What it does:** When recruiter changes status, candidate gets instant notification
- Uses Django Channels (WebSocket)
- Toast notification on candidate dashboard
- Status change animation on Applications page

**Backend:**
- Add `channels` to requirements.txt
- `config/asgi.py` already exists ✅
- Create WebSocket consumer in `notifications/consumers.py`

**Frontend:**
- WebSocket connection in `frontend/src/hooks/useWebSocket.js`
- Toast notifications using react-hot-toast

### 4.2 Real-time Chat
**What it does:** Live messaging between candidate and recruiter
- WebSocket-based chat
- Online/offline status
- Message read receipts

**Backend:**
- WebSocket consumer in `messaging/consumers.py`

**Frontend:**
- Enhance Messages pages with WebSocket

---

## PHASE 5 — Polish & Production Ready (Priority: LOW)

### 5.1 Admin Panel
- User management
- Job moderation
- Analytics overview
- `frontend/src/pages/admin/` (currently empty)

### 5.2 Email Notifications
- Application received email
- Status change email
- Job recommendation email (weekly digest)
- Django email backend in settings

### 5.3 Mobile Responsive Polish
- Test all pages on mobile
- Fix sidebar for mobile (hamburger menu)

### 5.4 Search & Filter Enhancement
- Advanced job search with multiple filters
- Save search preferences
- Job alert (notify when matching job posted)

---

## ✅ COMPLETED (Phase 1 + 2 + 3)

### Phase 1 — All "Coming Soon" Pages ✅
- Candidate: Applications, Recommendations, SkillGap, Profile, Resume, SavedJobs, Messages, Notifications, Settings
- Recruiter: Jobs, CreateJob, Applications, Company, Messages, Notifications, Settings
- Public: JobDetail page

### Phase 2 — Unique AI Features ✅
- AI Career Coach (chat agent) — `/candidate/ai-coach`
- Resume Scorer (AI score + improvement tips) — in Resume page
- Interview Prep AI (job-specific questions) — `/candidate/interview-prep`
- Salary Insights (market data + charts) — `/candidate/salary-insights`
- Career Roadmap Generator — `/candidate/career-roadmap`
- Backend: ai_coach app, salary_insights, interview_prep, career_roadmap services
- New API endpoints: `/api/ai/chat/`, `/api/ai/interview-prep/`, `/api/ai/salary-insights/`, `/api/ai/career-roadmap/`
- Skill Gap + Recommendations endpoints added to candidates API

### Phase 3 — Recruiter Unique Features ✅
- AI Candidate Ranking (sort by AI score) — in Applications page
- Job Post AI Assistant (auto-suggest skills) — in CreateJob page
- Recruiter Analytics Dashboard — `/recruiter/analytics`
- Change Password endpoint added

---

## Implementation Order (Remaining)

```
Week 1:  Phase 1 (1.1 → 1.7) — Complete all "Coming Soon" pages
Week 2:  Phase 2.1 + 2.2 — AI Career Coach + Resume Scorer
Week 3:  Phase 2.3 + 2.4 + 2.5 — Interview Prep + Salary + Roadmap
Week 4:  Phase 3 — Recruiter features
Week 5:  Phase 4 — Real-time features
Week 6:  Phase 5 — Polish + Admin
```

---

## New Files to Create

### Backend
```
backend/ai_services/resume_scorer.py        ← Resume scoring logic
backend/ai_services/interview_prep.py       ← Interview question generator
backend/ai_services/salary_insights.py      ← Salary range data + logic
backend/ai_services/career_roadmap.py       ← Career path data + logic
backend/ai_services/ai_coach.py             ← AI chat agent logic
backend/ai_coach/                           ← New Django app
  __init__.py, apps.py, views.py, urls.py
backend/notifications/consumers.py          ← WebSocket consumer
backend/messaging/consumers.py              ← WebSocket consumer
```

### Frontend
```
frontend/src/pages/candidate/AICoach.jsx
frontend/src/pages/candidate/InterviewPrep.jsx
frontend/src/pages/candidate/SalaryInsights.jsx
frontend/src/pages/candidate/CareerRoadmap.jsx
frontend/src/hooks/useWebSocket.js
frontend/src/hooks/useNotifications.js
```

### Routes to Add (AppRoutes.jsx)
```
/candidate/ai-coach
/candidate/interview-prep
/candidate/salary-insights
/candidate/career-roadmap
```

### Sidebar Items to Add (CandidateLayout.jsx)
```
AI Career Coach  → /candidate/ai-coach
Interview Prep   → /candidate/interview-prep
Salary Insights  → /candidate/salary-insights
Career Roadmap   → /candidate/career-roadmap
```

---

## Tech Stack Summary
- **Backend:** Django 4.2 + DRF + PostgreSQL + JWT Auth
- **AI:** Custom Python logic (no paid APIs) — spaCy, scikit-learn already in requirements
- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Real-time:** Django Channels + WebSocket
- **File Storage:** Local (Django MEDIA_ROOT)

---

## How to Start Each Feature
> Tell me: "Start Phase X.Y" and I will implement it completely.

Example:
- "Start Phase 1.1" → I'll build the Applications page
- "Start Phase 2.1" → I'll build the AI Career Coach
- "Start all of Phase 1" → I'll complete all Coming Soon pages

---
*Last Updated: Project Roadmap v1.0*
