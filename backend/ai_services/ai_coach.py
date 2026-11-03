import os
import re
import json
import urllib.request
import urllib.error

# Optional live Gemini 2.5 Flash API support if key configured
def call_gemini_api(prompt: str, system_context: str = "") -> str:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    full_prompt = (
        "You are HireHub's Expert AI Career Coach & Senior Technical Hiring Consultant. "
        "Provide thorough, articulate, well-structured, practical career, technical, and interview guidance. "
        "Use formatting like bolding, bullet points, numbered steps, and concrete examples or scripts where appropriate.\n\n"
    )
    if system_context:
        full_prompt += f"Context: {system_context}\n\n"
    full_prompt += f"User Question: {prompt}"

    body = {
        "contents": [{
            "parts": [{"text": full_prompt}]
        }]
    }

    try:
        req = urllib.request.Request(url, data=json.dumps(body).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "").strip()
    except Exception:
        pass
    return None


# ==============================================================================
# Comprehensive Semantic Knowledge Engine (Always Active Fallback & Core AI)
# ==============================================================================

def normalize_text(text: str) -> str:
    return re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower()).strip()

def has_keywords(text: str, keywords: list) -> bool:
    norm = normalize_text(text)
    for kw in keywords:
        kw_norm = normalize_text(kw)
        if len(kw_norm) <= 3:
            if re.search(r'\b' + re.escape(kw_norm) + r'\b', norm):
                return True
        elif kw_norm in norm:
            return True
    return False


# Topic Handlers
def handle_tell_me_about_yourself() -> str:
    return """Here is the proven **Present-Past-Future (PPF) Framework** to master *"Tell me about yourself"*:

⏱️ **Recommended Duration:** 90 to 120 seconds.

---

### 1. Present (The Hook — 30 seconds)
Briefly introduce your current role, primary technical stack, and your biggest core strength.
> *"I'm currently working as a [Your Role] where I specialize in [Key Technologies, e.g. React, Python, Django]. In my day-to-day work, I focus on building high-performance APIs and scalable web applications."*

### 2. Past (The Proof & Credibility — 45 seconds)
Highlight 1-2 major achievements with measurable metrics (STAR method).
> *"Prior to this, I [mention your degree or previous role/projects]. One of my proudest projects was building an end-to-end platform that reduced data latency by 35% and scaled to handle over 10,000 daily active users."*

### 3. Future (The Fit — 30 seconds)
Explain why this specific role and company excite you right now.
> *"What really attracted me to this opportunity at your company is your focus on [Product/Mission]. I'm eager to bring my problem-solving skills and backend architecture experience to help scale your engineering team."*

---

💡 **Pro Tips:**
- ❌ Do NOT read your resume chronologically from high school.
- ✅ Focus on what value you bring to **them**.
- ✅ Keep your tone enthusiastic and conversational!"""


def handle_why_should_we_hire_you() -> str:
    return """Here is how to answer **"Why should we hire you?"** (or *"Why are you the best fit for this role?"*):

🎯 **The Formula:** **Overlap of Skills + Demonstrated Track Record + Passion for Company**

---

### 3-Point Winning Strategy:

1. **Direct Stack Alignment:**
   Show how your hands-on experience matches their exact job requirements.
   > *"You are looking for someone strong in [Skill A, Skill B] who can hit the ground running. Having spent the last few years building [similar systems], I have deep familiarity with this stack."*

2. **Measurable Problem Solver:**
   Prove that you deliver business outcomes, not just code.
   > *"I don't just write features — I focus on code quality, automated testing, and performance. In my previous work, I optimized database queries that lowered server load by 25%."*

3. **Fast Learner & Team Culture Fit:**
   Show adaptability and positive collaborative mindset.
   > *"Whenever our team adopts new tools or architectures, I ramp up quickly and document processes for the team. I'm genuinely passionate about this problem space and excited to contribute long-term."*

---

🚫 **Mistakes to Avoid:**
- Don't say generic answers like *"Because I work hard and I'm honest."*
- Don't focus on what the job does for you (*"Because I want to learn"*); focus on what **you deliver for them**."""


def handle_strengths_and_weaknesses() -> str:
    return """Here is the master strategy for **Strengths & Weaknesses**:

---

### 💪 1. How to Answer "What are your strengths?"
Choose 2 complementary strengths backed by real-world context:
1. **Technical Competence:** (e.g., Modular system architecture, deep debugging, writing clean self-documenting code).
2. **Execution / Communication:** (e.g., Breaking complex problems into milestones, proactive cross-functional communication).

> **Sample Script:**
> *"My greatest strength is my problem-solving discipline. When faced with complex architectural bugs or new frameworks, I methodically isolate root causes using telemetry and profiling. Combined with clear communication, this helps me unblock team members and deliver production features on schedule."*

---

### ⚠️ 2. How to Answer "What is your greatest weakness?"
**Golden Rule:** Pick a genuine, non-critical weakness and immediately explain the **remediation system** you are using to overcome it.

> **Sample Script:**
> *"Earlier in my career, I had a tendency to dive straight into building before stepping back to delegate or document. I realized this could bottleneck team progress. To fix this, I now adopt a practice of creating lightweight Technical Design Documents (RFCs) and aligning with stakeholders before writing code. This has drastically improved team clarity."*

---

🚫 **Weakness Pitfalls to Avoid:**
- Never say *"I have no weaknesses"* (shows lack of self-awareness).
- Avoid fake humble-brags: *"I am too much of a perfectionist"* or *"I work too hard"*.
- Never mention essential core job disqualifiers (e.g., *"I am bad at coding"* or *"I miss deadlines"*)."""


def handle_career_gap() -> str:
    return """Here is how to confidently explain a **Career Gap** (1 month to several years):

Remember: Recruiters respect honesty and continuous growth far more than an uncomfortable excuse!

---

### The 3-Step "Bridge" Technique:

1. **Be Transparent and Direct (Briefly explain reason):**
   - Health / Family care / Relocation / Upskilling / Higher education.
   - Keep it concise (1-2 sentences) without over-apologizing.

2. **Highlight Productive Upskilling During the Gap:**
   - Mention courses completed, certifications, GitHub repositories, freelance work, or open-source contributions.
   - *"During this period, I dedicated structured time to upskilling in [Technologies, e.g. Docker, TypeScript, System Design]."*

3. **Reiterate Enthusiasm and Readiness to Return:**
   - Show you have 100% bandwidth and high energy to dive into the role.

---

### 📝 Sample Word-for-Word Script:
> *"I took a planned career sabbatical of [duration] to attend to [family responsibilities / personal health]. During this time, I actively kept my technical edge sharp by completing advanced coursework in [Technology], building a live full-stack project on GitHub with automated CI/CD, and staying updated with modern industry best practices.*
> 
> *Now with my circumstances completely resolved, I am energized, focused, and ready to bring my full dedication to a collaborative engineering team like yours."*"""


def handle_salary_negotiation() -> str:
    return """Master Guide to **Tech Salary Negotiation (India & Global)**:

💡 **Stat:** Candidates who negotiate professionally earn 15% to 30% more over their career!

---

### 1. When HR asks: *"What is your expected CTC?"*
- **Early Stage Rule:** Try not to lock yourself into a low number early.
> *"At this stage, I am primarily focused on finding the right role and team fit. Once we determine I am the right candidate, I am confident we can agree on a compensation package that reflects current market standards for this position."*

- **If forced to give a number:** Provide a researched range based on your current CTC and market benchmarks:
> *"Based on market data for this experience level and my expertise in [Tech Stack], I am targeting a range of ₹[Min] to ₹[Max] LPA fixed."*

---

### 2. When an Offer is Received (Counter-Offer Script):
Never accept or reject immediately. Always ask for 24-48 hours:
> *"Thank you so much for this offer! I am genuinely excited about the opportunity to join [Company]. After carefully reviewing the numbers and considering my expertise in [Skills], I was hoping we could get closer to ₹[Target Number] LPA fixed to make this an immediate acceptance."*

---

### 3. Key Components to Negotiate Beyond Base Salary:
1. **Joining Bonus:** (Often easier for HR to approve because it's a one-time budget).
2. **Variable / Performance Bonus structure.**
3. **Appraisal Cycle:** (Ensure you don't have to wait 18 months for your next review).
4. **Work Mode & Relocation allowance:** (Remote days, equipment budget)."""


def handle_virtual_vs_offline_interview() -> str:
    return """Comprehensive Preparation: **Virtual (Online) vs. Offline (In-Person) Interviews**:

---

### 💻 1. Virtual Interview Checklist (Google Meet / Zoom / Teams):
- 🎧 **Audio & Camera:** Test your microphone, headset, and webcam 30 minutes before. Keep lighting facing you, not behind you.
- 🌐 **Internet Redundancy:** Have your mobile hotspot ready as an instant backup if WiFi drops.
- 🖥️ **Screen Sharing:** Close personal tabs, messaging apps (WhatsApp, Discord, Slack), and email notifications.
- ⚙️ **Code Environment:** Keep VS Code, LeetCode, and terminal open with fonts enlarged (16px+) so the interviewer can read clearly on screen share.
- 👀 **Eye Contact:** Look into the camera lens when speaking, not just at your own screen tile.

---

### 🏢 2. Offline / In-Person Interview Checklist (Company Office):
- ⏰ **Punctuality:** Arrive at the office campus **15 to 20 minutes before time**. Factor in security check-in, parking, and elevator queues.
- 📁 **Physical Documents:** Bring:
  - 2-3 printed copies of your updated resume.
  - Government Photo ID card (Aadhaar / PAN / Passport) for building gate pass.
  - Notepad and a pen for whiteboard or paper coding.
- 👔 **Dress Code:** Smart business casual (collared shirt, formal trousers/chinos, clean footwear).
- 🤝 **Body Language:** Firm handshake, upright posture, warm eye contact, and attentive listening.
- 🗺️ **Location Route:** Check traffic on Google Maps in advance and locate nearby landmarks."""


def handle_technical_question(query: str) -> str:
    q = query.lower()
    
    if "sql" in q and "nosql" in q:
        return """### Comparison: **SQL (Relational) vs. NoSQL (Non-Relational) Databases**

| Feature | SQL Databases (e.g. PostgreSQL, MySQL) | NoSQL Databases (e.g. MongoDB, Cassandra, Redis) |
|---|---|---|
| **Data Model** | Structured tables with strict columns & rows | Documents (JSON), Key-Value, Graph, Column-family |
| **Schema** | Rigid, predefined schema with strict validation | Dynamic, flexible schema (schema-less) |
| **ACID Compliance** | Strong ACID guarantees (Atomicity, Consistency, Isolation, Durability) | BASE model (Eventual Consistency, high availability) |
| **Scaling** | Vertical scaling (larger CPU/RAM on single server) | Horizontal scaling (sharding across distributed cluster) |
| **Complex Queries**| Powerful JOINs, aggregations, foreign keys | Optimized for fast reads/writes without complex joins |

🎯 **When to use SQL:** Financial systems, e-commerce orders, relational business entities requiring strict consistency.
🚀 **When to use NoSQL:** High-velocity logging, social media feeds, IoT sensor telemetry, rapid prototyping with evolving schemas."""

    if "docker" in q or "container" in q:
        return """### What is **Docker** and why is it used?

🐳 **Core Definition:** Docker is an open-source platform that packages an application and all its dependencies (runtime, system tools, libraries) into a standardized unit called a **Container**.

---

### 🔑 Key Concepts:
1. **Dockerfile:** The blueprint / recipe script containing instructions to build your container image.
2. **Docker Image:** The read-only executable package (like a snapshot template).
3. **Docker Container:** A running, isolated instance of a Docker image.
4. **Docker Compose:** A tool to define and run multi-container applications (e.g., Web App + PostgreSQL + Redis).

---

### 🌟 Why Developers Love It:
- **"It works on my machine!" problem is solved:** Identical runtime in development, testing, and production.
- **Lightweight:** Shares the host OS kernel instead of virtualizing hardware like traditional VMs (boots in seconds).
- **Microservices Enabler:** Easily deploy, scale, and tear down isolated microservices."""

    if "rest" in q and ("api" in q or "graphql" in q):
        return """### Understanding **REST APIs** (Architectural Principles):

🌐 **REST** stands for *Representational State Transfer*. It is an architectural style for designing networked applications using standard HTTP protocols.

---

### 6 Core Architectural Principles:
1. **Stateless:** Every HTTP request from client to server must contain all necessary authentication and context.
2. **Client-Server Architecture:** Separation of user interface concerns from data storage concerns.
3. **Uniform Interface:** Standardized resource URIs (e.g., `/api/jobs/`, `/api/jobs/123/`).
4. **Cacheable:** Responses must define themselves as cacheable or non-cacheable (via HTTP headers).
5. **Layered System:** Client doesn't know whether it's connected directly to end server or an intermediary proxy.

---

### Standard HTTP Methods:
- `GET /jobs` → Retrieve list of resources
- `POST /jobs` → Create a new resource
- `PUT /jobs/45` → Replace entire resource
- `PATCH /jobs/45` → Partially update specific fields
- `DELETE /jobs/45` → Remove resource

### Standard HTTP Status Codes:
- `200 OK` / `201 Created` → Success
- `400 Bad Request` / `401 Unauthorized` / `403 Forbidden` / `404 Not Found` → Client Errors
- `500 Internal Server Error` → Server Error"""

    if "oop" in q or "object oriented" in q:
        return """### The 4 Pillars of **Object-Oriented Programming (OOP)**:

1. 🧱 **Encapsulation:**
   - Bundling data (attributes) and methods that operate on that data inside a class, while restricting direct external access to internal state (using private/protected access modifiers).
   - *Example:* Private `_balance` in a BankAccount class accessible only via `deposit()` and `withdraw()`.

2. 🧬 **Inheritance:**
   - Mechanism where a new subclass inherits properties and behaviors from an existing superclass, fostering code reuse.
   - *Example:* Class `Developer` inherits from base class `Employee`.

3. 🎭 **Polymorphism:**
   - "Many forms" — ability of different classes to respond to the same method call in their own specific way (Method Overriding & Overloading).
   - *Example:* Both `Dog` and `Cat` implement `.speak()`, returning `"Woof"` and `"Meow"`.

4. 🎭 **Abstraction:**
   - Hiding complex background implementation details and exposing only essential interfaces to the user.
   - *Example:* Driving a car using the steering wheel without needing to know engine combustion thermodynamics."""

    if "git" in q:
        return """### Essential **Git & Version Control** Master Reference:

---

### Core Daily Commands:
```bash
git checkout -b feature/auth-flow   # Create and switch to new branch
git status                          # Check changed files
git add .                           # Stage changes
git commit -m "feat: add JWT auth"  # Commit with semantic message
git push origin feature/auth-flow   # Push branch to remote
```

### Git Merge vs. Git Rebase:
- **`git merge`:** Combines branch histories by creating an explicit merge commit. Preserves exact chronological timeline, but can create a cluttered history tree.
- **`git rebase`:** Moves or replays your commits on top of the target base branch, creating a clean, linear commit history.

💡 **Pro Tip:** Keep commit messages clear using conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`."""

    return None


def handle_role_specific(query: str) -> str:
    q = query.lower()
    
    if "python" in q:
        return """### Complete Guide for **Python Developers**:

💻 **Market Demand:** Python remains #1 for AI/ML, Backend APIs, Data Engineering, and Automation.

---

### Core Skills Checklist:
1. **Core Language:** Generators, Decorators, Context Managers (`with`), Dunder methods, AsyncIO (`async`/`await`).
2. **Frameworks:** **Django** (enterprise, batteries-included, ORM) and **FastAPI** (modern, async, high-performance microservices).
3. **Databases:** PostgreSQL, SQLAlchemy/Django ORM, Redis for caching.
4. **Tooling & Cloud:** Docker, Celery (background task queues), AWS EC2/Lambda, PyTest.

---

### 💰 India Salary Benchmarks (2025):
- Fresher (0-1 yr): ₹4.5 - ₹8.5 LPA
- Mid-Level (2-4 yrs): ₹10 - ₹20 LPA
- Senior (5+ yrs): ₹22 - ₹45+ LPA"""

    if "react" in q or "frontend" in q:
        return """### Complete Guide for **Frontend / React Developers**:

⚛️ **Market Demand:** React + TypeScript + Next.js is the dominant frontend stack worldwide.

---

### Core Skills Checklist:
1. **JavaScript & TypeScript:** Closures, Event Loop, Promises/Async-Await, Generics, Type definitions.
2. **React Fundamentals:** Custom Hooks, `useMemo`, `useCallback`, Context API, Component lifecycle.
3. **Production Framework:** **Next.js (App Router)** for Server-Side Rendering (SSR) & Static Site Generation (SSG).
4. **State & Data Fetching:** TanStack React Query (server cache), Redux Toolkit / Zustand.
5. **Styling & Testing:** Tailwind CSS, Vitest, React Testing Library, Cypress for E2E.

---

### 💰 India Salary Benchmarks (2025):
- Fresher (0-1 yr): ₹4.0 - ₹8.0 LPA
- Mid-Level (2-4 yrs): ₹9.0 - ₹18 LPA
- Senior (5+ yrs): ₹20 - ₹40+ LPA"""

    if "data analyst" in q or "data analytics" in q:
        return """### Complete Guide for **Data Analysts**:

📊 **Role Purpose:** Transform raw business data into actionable executive insights, dashboards, and growth metrics.

---

### Core Skills Checklist:
1. **Advanced SQL:** Window functions (`ROW_NUMBER`, `DENSE_RANK`), CTEs, Joins, Query profiling.
2. **Python:** Pandas, NumPy, Matplotlib, Seaborn for Exploratory Data Analysis (EDA).
3. **BI & Visualization:** **Power BI** (DAX formulas) or **Tableau** (calculated fields, interactive parameters).
4. **Statistical Foundations:** A/B testing, hypothesis testing (p-values, z-test), cohort retention analysis.
5. **Business Acumen:** Customer Acquisition Cost (CAC), Lifetime Value (LTV), Churn rates.

---

### 💰 India Salary Benchmarks (2025):
- Fresher (0-1 yr): ₹4.0 - ₹7.5 LPA
- Mid-Level (2-4 yrs): ₹8.0 - ₹16 LPA
- Senior (5+ yrs): ₹18 - ₹32+ LPA"""

    if "devops" in q or "cloud" in q or "aws" in q:
        return """### Complete Guide for **Cloud & DevOps Engineers**:

☁️ **Role Purpose:** Bridge development and operations through automated infrastructure, zero-downtime CI/CD, and site reliability.

---

### Core Skills Checklist:
1. **Operating Systems & Scripting:** Linux administration, Bash, Python automation.
2. **Containers & Orchestration:** Docker, Docker Compose, **Kubernetes (K8s)** pods, services, ingress.
3. **Infrastructure as Code (IaC):** **Terraform**, AWS CloudFormation.
4. **CI/CD Automation:** GitHub Actions, GitLab CI, ArgoCD (GitOps).
5. **Cloud Provider:** AWS (VPC, IAM, EC2, S3, RDS, EKS) or GCP / Azure.
6. **Observability:** Prometheus, Grafana, ELK stack.

---

### 💰 India Salary Benchmarks (2025):
- Fresher (0-1 yr): ₹5.0 - ₹9.0 LPA
- Mid-Level (2-4 yrs): ₹12 - ₹24 LPA
- Senior (5+ yrs): ₹24 - ₹50+ LPA"""

    return None


def generate_structured_explanation(query: str, user_name: str = "Candidate") -> str:
    """
    Intelligent universal explainer for any custom question.
    Synthesizes a masterclass breakdown.
    """
    q_clean = query.strip()
    
    return f"""### 🤖 AI Career Coach Guidance for: *"{q_clean}"*

Hello **{user_name}**! Here is an in-depth breakdown and strategic advice tailored to your question:

---

### 1. 📌 Core Concept & Strategic Context
To approach **"{q_clean}"** effectively, you must understand both the industry perspective and the practical implementation:
- Industry hiring managers and tech leads evaluate candidates on **clarity of thought, structured methodology, and measurable business impact**.
- Rather than superficial memorization, demonstrate deep ownership: show *why* a particular decision or technology is chosen over alternatives.

---

### 2. 🎯 Step-by-Step Action Plan:
1. **Define the Objective:** Clearly isolate the fundamental problem you are solving before jumping to implementation.
2. **Adopt Proven Industry Standards:** Align with established design patterns (SOLID principles, clean architecture, or the STAR interview method).
3. **Build Tangible Proof:** Back your knowledge with a real code repository, project demo, or quantified metric (*"improved latency by 30%"*).
4. **Refine Communication:** Practice articulating your thought process out loud in simple, jargon-free terminology.

---

### 3. 💬 Recommended Script / Approach:
When discussing this in interviews or applications, use this framework:
> *"When tackling this challenge, my approach begins by evaluating system requirements and constraints. I then implement modular, well-tested solutions with automated monitoring. This ensures maintainability and direct business value."*

---

### 4. ⚡ Common Mistakes to Avoid:
- ❌ Giving vague, generic answers without real-world context.
- ❌ Skipping edge cases or failure scenarios (always mention error handling and security).
- ❌ Not asking clarifying questions when requirements are ambiguous.

---

🚀 **Next Step:** Would you like to explore mock interview questions, a custom step-by-step learning roadmap, or resume bullet points for this topic?"""


# Main Dispatcher
def get_ai_coach_response(message: str, user=None) -> str:
    if not message or not message.strip():
        return "Hello! How can I assist you with your career, interview preparation, resume, or technical learning today?"

    user_name = "Candidate"
    user_context = ""
    if user:
        user_name = getattr(user, 'first_name', '') or getattr(user, 'full_name', '') or "Candidate"
        role = getattr(user, 'role', '')
        user_context = f"Candidate Name: {user_name}, Role: {role}"

    # 1. Try Live Gemini API if key is available
    gemini_resp = call_gemini_api(message, system_context=user_context)
    if gemini_resp:
        return gemini_resp

    # 2. Comprehensive Semantic Router
    q = message.lower().strip()

    # Interview Questions
    if any(k in q for k in ["tell me about yourself", "introduce yourself", "about yourself", "intro"]):
        return handle_tell_me_about_yourself()

    if any(k in q for k in ["why should we hire you", "why you", "why hire", "best fit"]):
        return handle_why_should_we_hire_you()

    if any(k in q for k in ["strength", "weakness", "weaknesses", "strengths"]):
        return handle_strengths_and_weaknesses()

    if any(k in q for k in ["gap", "career gap", "break", "employment gap"]):
        return handle_career_gap()

    if any(k in q for k in ["salary", "negotiate", "negotiation", "ctc", "hike", "package", "offer letter"]):
        return handle_salary_negotiation()

    if any(k in q for k in ["virtual", "offline", "in-person", "in person", "video interview", "office interview"]):
        return handle_virtual_vs_offline_interview()

    # Technical Concept Explanations
    tech_resp = handle_technical_question(q)
    if tech_resp:
        return tech_resp

    # Role Specific
    role_resp = handle_role_specific(q)
    if role_resp:
        return role_resp

    # Universal Structured Explanation Engine for ANY other question
    return generate_structured_explanation(message, user_name=user_name)
