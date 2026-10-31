AI_COACH_RESPONSES = {
    "resume": {
        "keywords": ["resume", "cv", "improve resume", "resume tips", "resume score"],
        "response": """Here are key tips to improve your resume:

📝 **Structure:**
- Keep it to 1-2 pages max
- Use clear section headings: Summary, Skills, Experience, Education
- Use bullet points, not paragraphs

🎯 **Content:**
- Start each bullet with an action verb (Built, Developed, Led, Improved)
- Add numbers/metrics: "Improved performance by 40%" not just "Improved performance"
- Tailor skills section to match the job description

⚡ **Technical Resume:**
- List your GitHub profile and portfolio link
- Include tech stack for each project
- Mention tools, frameworks, and languages clearly

🚫 **Avoid:**
- Generic objectives like "Seeking a challenging role"
- Spelling/grammar errors
- Irrelevant personal info (age, photo in most countries)"""
    },
    "salary": {
        "keywords": ["salary", "ctc", "package", "pay", "compensation", "how much", "salary range"],
        "response": """Here are approximate salary ranges in India (2024):

💻 **Software Development:**
- Fresher (0-1 yr): ₹3-8 LPA
- Junior (1-3 yrs): ₹6-15 LPA
- Mid-level (3-6 yrs): ₹12-25 LPA
- Senior (6+ yrs): ₹20-50 LPA

📊 **Data Science / ML:**
- Fresher: ₹5-10 LPA
- Mid-level: ₹15-30 LPA
- Senior: ₹25-60 LPA

☁️ **DevOps / Cloud:**
- Fresher: ₹4-8 LPA
- Mid-level: ₹12-25 LPA
- Senior: ₹20-45 LPA

🎨 **UI/UX Design:**
- Fresher: ₹3-6 LPA
- Mid-level: ₹8-18 LPA
- Senior: ₹15-35 LPA

💡 **Tip:** Always negotiate! Most companies have 10-20% flexibility. Research on Glassdoor, AmbitionBox, and Levels.fyi."""
    },
    "interview": {
        "keywords": ["interview", "interview tips", "prepare interview", "interview questions", "hr round", "technical interview"],
        "response": """Here's how to ace your interview:

🎯 **Before the Interview:**
- Research the company (products, culture, recent news)
- Review the job description and match your experience
- Prepare 3-5 stories using STAR method (Situation, Task, Action, Result)
- Practice coding on LeetCode/HackerRank for technical roles

💬 **Common HR Questions:**
- "Tell me about yourself" → 2-min pitch: background, skills, why this role
- "Why this company?" → Show you've researched them
- "Weakness?" → Real weakness + how you're improving it
- "Where do you see yourself in 5 years?" → Align with company growth

💻 **Technical Interview Tips:**
- Think out loud — explain your approach before coding
- Ask clarifying questions
- Start with brute force, then optimize
- Test your code with edge cases

✅ **After the Interview:**
- Send a thank-you email within 24 hours
- Follow up after 5-7 days if no response"""
    },
    "skills": {
        "keywords": ["skills", "learn", "what to learn", "which skill", "skill gap", "upskill", "course"],
        "response": """Most in-demand skills in 2024:

🔥 **Highest Demand:**
- Python (AI/ML, Backend, Automation)
- React.js / Next.js (Frontend)
- Node.js (Backend)
- SQL + PostgreSQL (Databases)
- Docker + Kubernetes (DevOps)
- AWS / Azure / GCP (Cloud)

📈 **Emerging Skills:**
- LLM / Prompt Engineering
- LangChain / RAG systems
- Rust (Systems programming)
- TypeScript (replacing plain JS)

🎓 **Free Learning Resources:**
- freeCodeCamp.org — Web dev, Python, Data
- CS50 (Harvard) — cs50.harvard.edu
- The Odin Project — Full stack web dev
- fast.ai — Deep learning
- Kaggle — Data science + ML

💡 **Tip:** Use the Skill Gap Analyzer in your dashboard to see exactly which skills you need for specific jobs!"""
    },
    "linkedin": {
        "keywords": ["linkedin", "linkedin profile", "linkedin tips", "networking"],
        "response": """LinkedIn profile optimization tips:

📸 **Profile Basics:**
- Professional photo (clear face, good lighting)
- Banner image related to your field
- Headline: "Software Engineer | Python | React | Open to Work"
- Location: Set to your target city

✍️ **About Section:**
- 3-5 sentences: who you are, what you do, what you're looking for
- Include keywords recruiters search for

💼 **Experience:**
- Add all relevant work, internships, freelance projects
- Use bullet points with metrics

🔗 **Connections:**
- Connect with 500+ people in your field
- Engage with posts (like, comment, share)
- Post your projects and learnings

📬 **Getting Noticed:**
- Turn on "Open to Work" (visible to recruiters)
- Message recruiters directly with a short, personalized note
- Join relevant LinkedIn groups"""
    },
    "career": {
        "keywords": ["career", "career advice", "career path", "career switch", "career change", "roadmap"],
        "response": """Career guidance for tech professionals:

🗺️ **Popular Career Paths:**
- Frontend → Full Stack → Tech Lead
- Backend → System Design → Architect
- Data Analyst → Data Scientist → ML Engineer
- QA → SDET → DevOps
- Developer → Product Manager

📅 **Career Timeline (typical):**
- 0-2 yrs: Learn fundamentals, build projects
- 2-5 yrs: Specialize, lead small features
- 5-8 yrs: Senior role, mentor juniors
- 8+ yrs: Lead/Principal/Architect or Management

🔄 **Career Switch Tips:**
- Build 2-3 projects in the new domain
- Get a relevant certification
- Network with people in the target role
- Apply for junior roles in the new domain

💡 **Use the Career Roadmap feature** in your dashboard to get a personalized step-by-step path to your target role!"""
    },
    "default": {
        "response": """I'm your AI Career Coach! I can help you with:

🎯 **Ask me about:**
- **Resume tips** — "How to improve my resume?"
- **Salary info** — "What salary should I expect as a Python developer?"
- **Interview prep** — "How to prepare for a technical interview?"
- **Skills to learn** — "Which skills are most in demand?"
- **LinkedIn tips** — "How to optimize my LinkedIn profile?"
- **Career advice** — "How to switch to data science?"

Just type your question and I'll help! 💪"""
    }
}


def get_ai_coach_response(message: str) -> str:
    message_lower = message.lower()

    for category, data in AI_COACH_RESPONSES.items():
        if category == "default":
            continue
        if any(kw in message_lower for kw in data.get("keywords", [])):
            return data["response"]

    # Check for specific role questions
    roles = {
        "python developer": "Python Developer salary range: ₹4-8 LPA (fresher), ₹10-20 LPA (3 yrs), ₹20-40 LPA (senior). Key skills: Python, Django/FastAPI, SQL, Docker, AWS.",
        "react developer": "React Developer salary: ₹4-8 LPA (fresher), ₹10-20 LPA (3 yrs), ₹18-35 LPA (senior). Key skills: React, TypeScript, Node.js, REST APIs, Git.",
        "data scientist": "Data Scientist salary: ₹5-10 LPA (fresher), ₹15-30 LPA (3 yrs), ₹25-60 LPA (senior). Key skills: Python, ML, TensorFlow, SQL, Statistics.",
        "full stack": "Full Stack Developer salary: ₹5-10 LPA (fresher), ₹12-25 LPA (3 yrs), ₹20-45 LPA (senior). Key skills: React, Node.js/Python, SQL, Docker.",
        "devops": "DevOps Engineer salary: ₹5-10 LPA (fresher), ₹12-25 LPA (3 yrs), ₹20-45 LPA (senior). Key skills: Docker, Kubernetes, AWS, Terraform, Linux.",
    }

    for role, response in roles.items():
        if role in message_lower:
            return response

    return AI_COACH_RESPONSES["default"]["response"]
