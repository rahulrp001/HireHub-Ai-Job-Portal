import sqlite3
import json
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# 1. Ensure Recruiter User exists
cur.execute("SELECT id FROM users WHERE role = 'RECRUITER' LIMIT 1")
recruiter_row = cur.fetchone()
if recruiter_row:
    default_recruiter_id = recruiter_row[0]
else:
    cur.execute("""
        INSERT INTO users (password, is_superuser, email, username, first_name, last_name, role, phone, is_active, is_staff, created_at, updated_at)
        VALUES ('pbkdf2_sha256$600000$dummy$hash', 0, 'recruiter@hirehub.in', 'hirehub_recruiter', 'HireHub', 'HR', 'RECRUITER', '9876543210', 1, 0, datetime('now'), datetime('now'))
    """)
    default_recruiter_id = cur.lastrowid
    conn.commit()

# 2. Top Indian Employer Companies
COMPANIES_DATA = [
    {
        "name": "Google India",
        "industry": "Technology & Internet",
        "company_size": "10,000+ employees",
        "location": "Bangalore, India",
        "website": "https://careers.google.com",
        "founded_year": 1998,
        "description": "Google India is a global leader in technology, cloud infrastructure, AI, search, and enterprise tools."
    },
    {
        "name": "Tata Consultancy Services (TCS)",
        "industry": "IT Services & Consulting",
        "company_size": "500,000+ employees",
        "location": "Mumbai, India",
        "website": "https://www.tcs.com",
        "founded_year": 1968,
        "description": "TCS is an IT services, consulting, and business solutions organisation partnering with the world's largest businesses."
    },
    {
        "name": "Infosys",
        "industry": "IT Services & Software",
        "company_size": "300,000+ employees",
        "location": "Bangalore, India",
        "website": "https://www.infosys.com",
        "founded_year": 1981,
        "description": "Infosys is a global leader in next-generation digital services and consulting, enabling clients across 50 countries."
    },
    {
        "name": "Wipro",
        "industry": "IT & Consulting",
        "company_size": "240,000+ employees",
        "location": "Bangalore, India",
        "website": "https://www.wipro.com",
        "founded_year": 1945,
        "description": "Wipro Limited is a leading technology services and consulting company focused on building innovative solutions."
    },
    {
        "name": "Amazon India",
        "industry": "E-Commerce & Cloud Computing",
        "company_size": "100,000+ employees",
        "location": "Hyderabad, India",
        "website": "https://amazon.jobs",
        "founded_year": 1994,
        "description": "Amazon is guided by four principles: customer obsession, passion for invention, commitment to operational excellence, and long-term thinking."
    },
    {
        "name": "Microsoft India",
        "industry": "Software & Cloud",
        "company_size": "15,000+ employees",
        "location": "Hyderabad, India",
        "website": "https://careers.microsoft.com",
        "founded_year": 1975,
        "description": "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge."
    },
    {
        "name": "Flipkart",
        "industry": "E-Commerce",
        "company_size": "50,000+ employees",
        "location": "Bangalore, India",
        "website": "https://www.flipkartcareers.com",
        "founded_year": 2007,
        "description": "The Flipkart Group is one of India's leading digital commerce entities and tech innovators."
    },
    {
        "name": "Zomato",
        "industry": "Food Tech & Logistics",
        "company_size": "10,000+ employees",
        "location": "Gurugram, India",
        "website": "https://www.zomato.com/careers",
        "founded_year": 2008,
        "description": "Zomato connects customers, restaurant partners, and delivery partners across India and beyond."
    },
    {
        "name": "HCLTech",
        "industry": "IT & Engineering Services",
        "company_size": "220,000+ employees",
        "location": "Noida, India",
        "website": "https://www.hcltech.com",
        "founded_year": 1976,
        "description": "HCLTech is a global technology company home to 220,000+ people across 60 countries."
    },
    {
        "name": "Reliance Jio",
        "industry": "Telecommunications & Digital Services",
        "company_size": "70,000+ employees",
        "location": "Mumbai, India",
        "website": "https://www.jio.com",
        "founded_year": 2007,
        "description": "Jio is an Indian telecommunications company and subsidiary of Jio Platforms, building next-gen digital infrastructure."
    }
]

company_ids = []
for idx, cdata in enumerate(COMPANIES_DATA):
    # Check if company already exists by name
    cur.execute("SELECT id FROM companies WHERE name LIKE ?", (f"%{cdata['name'][:8]}%",))
    crow = cur.fetchone()
    if crow:
        company_ids.append(crow[0])
    else:
        # Check if we need a unique recruiter for this company
        u_email = f"recruiter_c{idx+10}@hirehub.in"
        u_name = f"recruiter_c{idx+10}"
        cur.execute("SELECT id FROM users WHERE email = ?", (u_email,))
        urow = cur.fetchone()
        if not urow:
            cur.execute("""
                INSERT INTO users (password, is_superuser, email, username, first_name, last_name, role, phone, is_active, is_staff, created_at, updated_at)
                VALUES ('pbkdf2_sha256$600000$dummy$hash', 0, ?, ?, ?, 'Recruiter', 'RECRUITER', '9876543210', 1, 0, datetime('now'), datetime('now'))
            """, (u_email, u_name, cdata['name'].split()[0]))
            c_recruiter_id = cur.lastrowid
        else:
            c_recruiter_id = urow[0]

        cur.execute("""
            INSERT INTO companies (recruiter_id, name, description, website, industry, company_size, location, founded_year, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """, (c_recruiter_id, cdata['name'], cdata['description'], cdata['website'], cdata['industry'], cdata['company_size'], cdata['location'], cdata['founded_year']))
        company_ids.append(cur.lastrowid)

conn.commit()

# Helper to get company id cyclically
def get_company_id(idx):
    if company_ids:
        return company_ids[idx % len(company_ids)]
    return None

# 3. Comprehensive Indian Locations & Minimum 5 High-Quality Jobs each
LOCATIONS_JOB_SPECS = {
    "Bangalore, India": [
        {
            "title": "Lead Full Stack Engineer (React & Node.js)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1800000, "salary_max": 2800000, "exp_min": 5, "exp_max": 10,
            "skills": ["React.js", "Node.js", "TypeScript", "AWS", "Docker", "PostgreSQL"],
            "pref": ["GraphQL", "Microservices", "Redis"],
            "desc": "Join our cutting-edge engineering hub in Bangalore to design and scale distributed cloud services handling millions of requests daily.",
            "reqs": "5+ years building scalable web architectures using React, Node, and SQL/NoSQL databases. Strong API design and CI/CD proficiency.",
            "resp": "Architect core microservices, lead frontend performance tuning, mentor junior engineers, and participate in sprint planning."
        },
        {
            "title": "Senior Cloud DevOps Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1500000, "salary_max": 2400000, "exp_min": 4, "exp_max": 8,
            "skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
            "pref": ["Prometheus", "Helm", "Go"],
            "desc": "Responsible for managing multi-cluster Kubernetes deployments, infrastructure as code, and automated deployment pipelines.",
            "reqs": "Experience with AWS multi-region setups, EKS, Terraform, and zero-downtime blue/green deployment strategies.",
            "resp": "Optimize cloud infrastructure costs, automate observability alarms, and maintain 99.99% system availability."
        },
        {
            "title": "AI / Machine Learning Engineer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 2000000, "salary_max": 3200000, "exp_min": 3, "exp_max": 7,
            "skills": ["Python", "Machine Learning", "PyTorch", "NLP", "TensorFlow", "FastAPI"],
            "pref": ["LLMs", "LangChain", "Vector Databases"],
            "desc": "Work on state-of-the-art predictive recommendation algorithms, semantic search, and generative AI features.",
            "reqs": "Deep understanding of deep learning models, transformer architectures, and production model serving.",
            "resp": "Train, fine-tune, and deploy ML models into high-throughput inference endpoints with low latency."
        },
        {
            "title": "Senior Frontend Developer (Next.js & UI/UX)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1400000, "salary_max": 2200000, "exp_min": 3, "exp_max": 6,
            "skills": ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "REST API"],
            "pref": ["Figma", "WebSockets", "Jest"],
            "desc": "Build responsive, high-speed user interfaces for enterprise dashboards and candidate portal workflows.",
            "reqs": "Mastery of React hooks, component lifecycle, Core Web Vitals optimization, and modern CSS/Tailwind design systems.",
            "resp": "Collaborate with UI/UX designers to translate Figma prototypes into pixel-perfect, accessible interactive interfaces."
        },
        {
            "title": "Staff Backend Engineer (Python / Django)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 2200000, "salary_max": 3500000, "exp_min": 6, "exp_max": 12,
            "skills": ["Python", "Django", "PostgreSQL", "Redis", "Celery", "REST API"],
            "pref": ["Docker", "Kafka", "System Design"],
            "desc": "Own high-traffic transactional endpoints, asynchronous job workers, and database query optimization.",
            "reqs": "Extensive experience in Django REST framework, database query tuning, indexing, and distributed caching.",
            "resp": "Design resilient database schemas, build secure API integrations, and guide system architecture decisions."
        },
        {
            "title": "Product Analyst & Growth Specialist",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 900000, "salary_max": 1600000, "exp_min": 2, "exp_max": 5,
            "skills": ["SQL", "Data Analysis", "Python", "Tableau", "Excel", "Problem Solving"],
            "pref": ["Power BI", "Mixpanel", "A/B Testing"],
            "desc": "Analyze user conversion funnels, onboarding retention, and candidate application trends across the platform.",
            "reqs": "Proven ability to craft complex SQL queries, build executive BI dashboards, and conduct statistical A/B tests.",
            "resp": "Deliver actionable data insights to product managers to boost candidate placement conversion rates."
        }
    ],

    "Mumbai, India": [
        {
            "title": "FinTech Backend Engineer (Java / Spring Boot)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1600000, "salary_max": 2600000, "exp_min": 4, "exp_max": 8,
            "skills": ["Java", "Spring Boot", "MySQL", "Kafka", "Microservices", "REST API"],
            "pref": ["AWS", "Docker", "Redis"],
            "desc": "Join our financial services platform in Mumbai building high-throughput payment gateways and ledger reconciliation systems.",
            "reqs": "Solid foundation in Java 17+, Spring Cloud, distributed transactions, and financial security compliance.",
            "resp": "Implement payment settlement APIs, handle concurrency locks, and ensure 100% data integrity."
        },
        {
            "title": "Senior Cybersecurity Specialist",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1800000, "salary_max": 2900000, "exp_min": 5, "exp_max": 9,
            "skills": ["Cybersecurity", "Networking", "Linux", "Ethical Hacking", "CI/CD"],
            "pref": ["OWASP", "SOC 2", "Cloud Security"],
            "desc": "Lead vulnerability assessments, penetration testing, and zero-trust security postures across our infrastructure.",
            "reqs": "Experience defending large-scale corporate networks, identifying web application vulnerabilities, and incident response.",
            "resp": "Conduct regular security audits, oversee SIEM alerts, and implement OAuth/JWT authentication safeguards."
        },
        {
            "title": "Full Stack Web Developer (Node.js & React)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1200000, "salary_max": 2000000, "exp_min": 3, "exp_max": 6,
            "skills": ["JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
            "pref": ["TypeScript", "Docker", "Git"],
            "desc": "Develop consumer-facing entertainment and media streaming applications with high responsiveness.",
            "reqs": "Hands-on experience developing end-to-end full stack web applications with modern JavaScript/React toolchains.",
            "resp": "Build reusable UI components, implement server-side logic, and optimize asset delivery."
        },
        {
            "title": "Investment Banking Technical Analyst",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1400000, "salary_max": 2300000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "SQL", "Excel", "Data Analysis", "Communication"],
            "pref": ["Financial Modeling", "Power BI", "Pandas"],
            "desc": "Build quantitative financial data models, risk assessment calculators, and regulatory reporting scripts.",
            "reqs": "Strong analytical problem-solving skills with proficiency in Python data pipelines and relational databases.",
            "resp": "Automate equity and portfolio reporting processes and deliver executive analytics briefings."
        },
        {
            "title": "Mobile App Engineer (iOS & React Native)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1300000, "salary_max": 2100000, "exp_min": 3, "exp_max": 6,
            "skills": ["React Native", "Swift", "iOS Development", "JavaScript", "REST API"],
            "pref": ["Redux", "Firebase", "App Store Deployment"],
            "desc": "Build smooth, intuitive mobile user experiences for over 2 million active banking and shopping app users.",
            "reqs": "Experience publishing mobile apps on the Apple App Store with native Swift modules and bridge optimization.",
            "resp": "Maintain offline cache synchronization, push notifications, and biometric authentication security."
        }
    ],

    "Delhi, India": [
        {
            "title": "Senior Python & Django Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1400000, "salary_max": 2300000, "exp_min": 4, "exp_max": 8,
            "skills": ["Python", "Django", "PostgreSQL", "REST API", "Docker", "Git"],
            "pref": ["Celery", "Redis", "Elasticsearch"],
            "desc": "Power our public API ecosystem, search indexing, and real-time candidate notification delivery in Delhi NCR.",
            "reqs": "4+ years of backend web engineering in Python with deep knowledge of Django ORM, query optimization, and test automation.",
            "resp": "Create clean RESTful endpoints, orchestrate celery background tasks, and refactor monolithic services."
        },
        {
            "title": "Cloud Infrastructure & DevOps Lead",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1700000, "salary_max": 2700000, "exp_min": 5, "exp_max": 10,
            "skills": ["AWS", "Google Cloud (GCP)", "Kubernetes", "Linux", "Terraform", "CI/CD"],
            "pref": ["Ansible", "Nginx", "Jenkins"],
            "desc": "Manage multi-cloud high-availability environments and maintain containerized microservices deployments.",
            "reqs": "Expertise in Linux system administration, network topology, firewall security, and CI/CD automation pipelines.",
            "resp": "Maintain 99.99% uptime, conduct automated disaster recovery drills, and manage infrastructure budgets."
        },
        {
            "title": "UI/UX Product Designer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1000000, "salary_max": 1800000, "exp_min": 3, "exp_max": 6,
            "skills": ["Figma", "UI/UX Design", "HTML", "CSS", "Problem Solving", "Communication"],
            "pref": ["Adobe XD", "Design Systems", "Prototyping"],
            "desc": "Craft world-class candidate and recruiter user experiences from wireframes and user testing to high-fidelity designs.",
            "reqs": "Solid design portfolio showcasing intuitive web and mobile interfaces, design tokens, and user flow architectures.",
            "resp": "Conduct user research sessions, build responsive design systems, and collaborate with frontend developers."
        },
        {
            "title": "Data Scientist & Analytics Consultant",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1300000, "salary_max": 2200000, "exp_min": 3, "exp_max": 6,
            "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Pandas", "Scikit-learn"],
            "pref": ["Power BI", "Tableau", "Statistics"],
            "desc": "Extract meaningful trends from labor market datasets and build machine learning ranking models for candidates.",
            "reqs": "Proficiency with statistical modelling, predictive classification, and data wrangling in Python and SQL.",
            "resp": "Deliver predictive job market analytics to government and enterprise leadership teams."
        },
        {
            "title": "QA Automation Lead Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1900000, "exp_min": 4, "exp_max": 7,
            "skills": ["Selenium", "Unit Testing", "Jest", "Postman", "JavaScript", "Python"],
            "pref": ["Cypress", "JMeter", "GitHub Actions"],
            "desc": "Lead end-to-end regression testing suites, load stress tests, and API validation for core applications.",
            "reqs": "Experience designing automated test frameworks, writing comprehensive test cases, and managing defect lifecycles.",
            "resp": "Integrate automated smoke and regression tests into GitHub Actions pipelines to prevent release bugs."
        }
    ],

    "Noida, India": [
        {
            "title": "Senior Frontend React Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1300000, "salary_max": 2100000, "exp_min": 4, "exp_max": 7,
            "skills": ["React.js", "TypeScript", "Redux", "Tailwind CSS", "HTML", "CSS"],
            "pref": ["Vite", "Jest", "Next.js"],
            "desc": "Build scalable and performant enterprise cloud platforms in Noida Sector 62 tech zone.",
            "reqs": "4+ years in modern React, state management with Redux Toolkit, modular component design, and unit testing.",
            "resp": "Deliver feature modules on time, participate in code reviews, and optimize bundle sizes."
        },
        {
            "title": "Java Microservices Backend Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1200000, "salary_max": 2000000, "exp_min": 3, "exp_max": 6,
            "skills": ["Java", "Spring Boot", "MySQL", "Docker", "REST API", "Microservices"],
            "pref": ["Kafka", "Kubernetes", "JUnit"],
            "desc": "Develop resilient enterprise backend microservices powering global telecom and logistics clients.",
            "reqs": "Strong grasp of Object-Oriented Programming, Spring Boot, REST APIs, and relational database schema design.",
            "resp": "Implement business logic services, integrate third-party webhooks, and write automated unit tests."
        },
        {
            "title": "DevOps & Cloud Systems Engineer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1400000, "salary_max": 2200000, "exp_min": 3, "exp_max": 7,
            "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform"],
            "pref": ["Jenkins", "Prometheus", "Bash"],
            "desc": "Automate containerized build pipelines and manage multi-tenant cloud infrastructure for international accounts.",
            "reqs": "Demonstrated hands-on experience with cloud providers, container orchestration, and server configuration automation.",
            "resp": "Maintain continuous deployment pipelines and optimize server infrastructure utilization."
        },
        {
            "title": "Data Analyst (SQL & Business Intelligence)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 700000, "salary_max": 1300000, "exp_min": 1, "exp_max": 4,
            "skills": ["SQL", "Power BI", "Excel", "Data Analysis", "Communication"],
            "pref": ["Tableau", "Python", "Problem Solving"],
            "desc": "Transform raw business metrics into actionable operational dashboards for executive decision makers.",
            "reqs": "Experience writing complex SQL queries (CTEs, window functions) and creating interactive Power BI dashboards.",
            "resp": "Generate weekly KPI reports, investigate data anomalies, and assist product managers with data insights."
        },
        {
            "title": "QA Automation Engineer (Web & Mobile)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 800000, "salary_max": 1400000, "exp_min": 2, "exp_max": 5,
            "skills": ["Selenium", "Postman", "JavaScript", "Unit Testing", "Git"],
            "pref": ["Appium", "Cypress", "JIRA"],
            "desc": "Execute automated API and web UI test suites to guarantee flaw-free enterprise software deployments.",
            "reqs": "Solid knowledge of testing frameworks, automated regression scripts, and defect tracking systems.",
            "resp": "Validate REST API payloads, create automated test scenarios, and participate in sprint demo verifications."
        }
    ],

    "Gurugram, India": [
        {
            "title": "Staff Backend Engineer (Golang & Distributed Systems)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 2200000, "salary_max": 3600000, "exp_min": 5, "exp_max": 10,
            "skills": ["Go", "Microservices", "PostgreSQL", "Redis", "Kafka", "Docker"],
            "pref": ["Kubernetes", "System Design", "gRPC"],
            "desc": "Scale our ultra-fast logistics routing engine handling 100k requests/second in Cyber City, Gurugram.",
            "reqs": "Proven experience in Go concurrent routines, channels, event-driven architectures, and distributed caching.",
            "resp": "Own the core matching engine, minimize P99 latency, and participate in high-level architectural design."
        },
        {
            "title": "Senior Full Stack MERN Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1500000, "salary_max": 2500000, "exp_min": 4, "exp_max": 8,
            "skills": ["React.js", "Node.js", "MongoDB", "Express.js", "TypeScript", "Tailwind CSS"],
            "pref": ["Next.js", "AWS", "WebSockets"],
            "desc": "Build lightning-fast merchant and partner portals with real-time order tracking and analytics dashboards.",
            "reqs": "Strong proficiency across React, Node, Express, MongoDB aggregation pipelines, and TypeScript.",
            "resp": "Build end-to-end features, lead code reviews, and integrate payment and notification systems."
        },
        {
            "title": "AI / GenAI Research Engineer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 2000000, "salary_max": 3400000, "exp_min": 3, "exp_max": 7,
            "skills": ["Python", "Machine Learning", "NLP", "PyTorch", "REST API"],
            "pref": ["LangChain", "Vector Databases", "Prompt Engineering"],
            "desc": "Develop autonomous AI agents and conversational resume scoring assistants for candidate recruitment.",
            "reqs": "Experience fine-tuning foundational models, prompt chaining, and evaluating generative AI reliability.",
            "resp": "Design prompt engineering pipelines, implement vector similarity search, and measure accuracy metrics."
        },
        {
            "title": "Technical Product Manager (B2B SaaS)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1800000, "salary_max": 2800000, "exp_min": 4, "exp_max": 8,
            "skills": ["Product Management", "Agile", "Scrum", "Communication", "Data Analysis"],
            "pref": ["JIRA", "System Design", "Figma"],
            "desc": "Define product roadmaps, user stories, and feature prioritization for enterprise hiring software.",
            "reqs": "Demonstrated success shipping enterprise B2B software products with high user engagement.",
            "resp": "Gather feedback from recruiters, manage product backlogs, and collaborate closely with engineering leads."
        },
        {
            "title": "Mobile App Developer (Flutter & Dart)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 2, "exp_max": 5,
            "skills": ["Flutter", "Dart", "Android Development", "iOS Development", "REST API"],
            "pref": ["Bloc", "Firebase", "State Management"],
            "desc": "Build cross-platform mobile apps for Android and iOS providing seamless candidate job search and application tracking.",
            "reqs": "2+ years developing Flutter applications with clean state management (Bloc/Provider) and offline storage.",
            "resp": "Implement responsive mobile screens, optimize animations, and publish updates to Play Store and App Store."
        }
    ],

    "Hyderabad, India": [
        {
            "title": "Principal Cloud Solution Architect",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 2600000, "salary_max": 4200000, "exp_min": 8, "exp_max": 15,
            "skills": ["AWS", "Azure", "Kubernetes", "System Design", "Microservices", "Docker"],
            "pref": ["Security", "Multi-Cloud", "Cost Optimization"],
            "desc": "Lead cloud strategy and architectural modernization for enterprise cloud clients in HITEC City, Hyderabad.",
            "reqs": "Deep architectural expertise in multi-region failover, container orchestration, and enterprise compliance.",
            "resp": "Advise enterprise executives on cloud migration roadmaps and govern engineering implementation standards."
        },
        {
            "title": "Senior Data Platform Engineer (Spark & Python)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1600000, "salary_max": 2600000, "exp_min": 4, "exp_max": 8,
            "skills": ["Python", "SQL", "Data Analysis", "AWS", "PostgreSQL"],
            "pref": ["PySpark", "Airflow", "Snowflake"],
            "desc": "Build petabyte-scale data lakes and streaming ETL pipelines powering machine learning insights.",
            "reqs": "Experience building resilient data pipelines using distributed computing (Spark, Airflow) and columnar warehouses.",
            "resp": "Maintain data lake reliability, build automated data quality checks, and reduce query execution latency."
        },
        {
            "title": "Full Stack Java & Angular Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1300000, "salary_max": 2100000, "exp_min": 3, "exp_max": 7,
            "skills": ["Java", "Spring Boot", "Angular", "TypeScript", "MySQL", "REST API"],
            "pref": ["Docker", "Hibernate", "CI/CD"],
            "desc": "Develop internal corporate workflows, employee onboarding portals, and resource management tools.",
            "reqs": "Strong experience connecting Angular frontend applications to Spring Boot REST backends.",
            "resp": "Develop new features, implement responsive UI views, and participate in sprint planning meetings."
        },
        {
            "title": "Embedded Software Engineer (C / C++)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1400000, "salary_max": 2300000, "exp_min": 3, "exp_max": 6,
            "skills": ["C", "C++", "Linux", "IoT", "Networking"],
            "pref": ["RTOS", "Device Drivers", "ARM"],
            "desc": "Develop low-level firmware and device driver software for smart IoT devices and telecommunication hardware.",
            "reqs": "Strong background in C/C++, memory management, hardware interrupts, and Linux kernel fundamentals.",
            "resp": "Write and debug firmware code, perform board bring-up, and interface with sensor protocols."
        },
        {
            "title": "Site Reliability Engineer (SRE)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1500000, "salary_max": 2400000, "exp_min": 4, "exp_max": 8,
            "skills": ["Linux", "Kubernetes", "AWS", "Python", "CI/CD"],
            "pref": ["Grafana", "Prometheus", "Incident Response"],
            "desc": "Ensure high availability, low latency, and zero unexpected outages across mission-critical services.",
            "reqs": "Experience with telemetry tools (Prometheus, Grafana), chaos engineering, and incident management.",
            "resp": "Automate self-healing infrastructure, run blameless postmortems, and eliminate repetitive toil."
        }
    ],

    "Pune, India": [
        {
            "title": "Senior Java Microservices Architect",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1800000, "salary_max": 2800000, "exp_min": 5, "exp_max": 10,
            "skills": ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL", "Docker"],
            "pref": ["Kubernetes", "GCP", "Redis"],
            "desc": "Lead backend engineering in Pune Hinjawadi IT Park for next-generation automated banking and lending platforms.",
            "reqs": "5+ years developing event-driven microservices in Java/Spring Boot with high transaction throughput.",
            "resp": "Design event streaming architectures with Apache Kafka, conduct technical reviews, and mentor developers."
        },
        {
            "title": "DevOps & Infrastructure Automation Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1300000, "salary_max": 2100000, "exp_min": 3, "exp_max": 7,
            "skills": ["Terraform", "AWS", "Docker", "Linux", "CI/CD", "Git"],
            "pref": ["Ansible", "Kubernetes", "Jenkins"],
            "desc": "Automate cloud infrastructure provisioning and enforce continuous security compliance.",
            "reqs": "Strong command of Infrastructure as Code with Terraform, bash scripting, and cloud security policies.",
            "resp": "Write automated provisioning modules, maintain deployment pipelines, and optimize server configurations."
        },
        {
            "title": "Automotive Embedded Software Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1200000, "salary_max": 2000000, "exp_min": 3, "exp_max": 6,
            "skills": ["C", "C++", "Linux", "IoT", "Problem Solving"],
            "pref": ["AUTOSAR", "CAN Bus", "Embedded Systems"],
            "desc": "Develop software for electric vehicle battery management, digital instrument clusters, and telemetry units.",
            "reqs": "Experience in embedded C development, automotive protocols, and safety-critical software standards.",
            "resp": "Implement firmware modules, execute unit and integration testing, and validate against hardware simulators."
        },
        {
            "title": "Machine Learning Engineer (NLP & Computer Vision)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1500000, "salary_max": 2500000, "exp_min": 3, "exp_max": 7,
            "skills": ["Python", "Machine Learning", "PyTorch", "NLP", "Data Analysis"],
            "pref": ["Computer Vision", "TensorFlow", "FastAPI"],
            "desc": "Build automated document parsing algorithms and visual recognition models for manufacturing quality checks.",
            "reqs": "Solid grounding in computer vision, OCR text extraction, deep neural networks, and model containerization.",
            "resp": "Train custom OCR models, optimize inference speed, and deliver microservice endpoints."
        },
        {
            "title": "Frontend React & TypeScript Specialist",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 6,
            "skills": ["React.js", "TypeScript", "Tailwind CSS", "HTML", "CSS", "REST API"],
            "pref": ["Redux", "Jest", "Webpack"],
            "desc": "Deliver sleek, high-performance web dashboards for enterprise customers and candidates.",
            "reqs": "Strong grasp of modern React (hooks, context, Suspense), TypeScript type safety, and clean UI design.",
            "resp": "Build interactive charts, maintain component libraries, and optimize web app loading times."
        }
    ],

    "Chennai, India": [
        {
            "title": "Senior SaaS Platform Architect (Python & Cloud)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 2000000, "salary_max": 3200000, "exp_min": 6, "exp_max": 11,
            "skills": ["Python", "Django", "PostgreSQL", "AWS", "Microservices", "Redis"],
            "pref": ["Kafka", "Docker", "System Design"],
            "desc": "Lead platform architecture in Chennai OMR IT Corridor for a globally recognized customer engagement SaaS product.",
            "reqs": "Experience scaling multitenant SaaS databases, distributed caching, and zero-downtime database migrations.",
            "resp": "Design multi-region architecture, guide engineering standards, and troubleshoot deep performance bottlenecks."
        },
        {
            "title": "Full Stack Developer (Zoho / Python Ecosystem)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 2, "exp_max": 5,
            "skills": ["JavaScript", "Python", "React.js", "MySQL", "REST API", "Git"],
            "pref": ["Django", "Tailwind CSS", "Redis"],
            "desc": "Develop innovative business productivity applications used by over 50 million global business users.",
            "reqs": "Strong problem-solving skills with practical expertise in web development and database optimization.",
            "resp": "Implement end-to-end features, ensure cross-browser compatibility, and participate in code reviews."
        },
        {
            "title": "Big Data Engineer (Hadoop & PySpark)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1400000, "salary_max": 2300000, "exp_min": 3, "exp_max": 7,
            "skills": ["Python", "SQL", "Data Analysis", "AWS", "Linux"],
            "pref": ["PySpark", "Kafka", "Hadoop"],
            "desc": "Process massive event clickstream datasets to power real-time personalization algorithms.",
            "reqs": "Experience building distributed data pipelines with Spark, Kafka, and columnar data storage formats.",
            "resp": "Build streaming ingestion pipelines, monitor batch jobs, and optimize SQL cluster queries."
        },
        {
            "title": "Database Administrator (PostgreSQL & MySQL)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1200000, "salary_max": 2000000, "exp_min": 4, "exp_max": 8,
            "skills": ["PostgreSQL", "MySQL", "Linux", "SQL", "Problem Solving"],
            "pref": ["Replication", "Performance Tuning", "AWS RDS"],
            "desc": "Oversee enterprise database clusters, query index optimization, backup verification, and high availability.",
            "reqs": "Hands-on experience in PostgreSQL replication, write-ahead logging, vacuum tuning, and failover management.",
            "resp": "Perform regular performance profiling, tune slow SQL queries, and implement zero-data-loss backup strategies."
        },
        {
            "title": "Automation Test Lead (API & Performance Testing)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1000000, "salary_max": 1700000, "exp_min": 3, "exp_max": 6,
            "skills": ["Postman", "Selenium", "JavaScript", "Unit Testing", "Git"],
            "pref": ["JMeter", "Cypress", "CI/CD"],
            "desc": "Design automated API performance benchmarks and end-to-end integration test suites.",
            "reqs": "Experience testing RESTful endpoints with Postman/Newman and executing JMeter load tests under heavy traffic.",
            "resp": "Write automated test scripts, monitor response times, and prevent performance regressions."
        }
    ],

    "Kolkata, India": [
        {
            "title": "Senior Full Stack Web Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 4, "exp_max": 7,
            "skills": ["JavaScript", "React.js", "Node.js", "PostgreSQL", "HTML", "CSS"],
            "pref": ["TypeScript", "AWS", "Docker"],
            "desc": "Join our growing engineering team in Kolkata Sector V, Salt Lake, building global enterprise web applications.",
            "reqs": "4+ years building full stack web platforms with modern JavaScript libraries and relational databases.",
            "resp": "Develop client portals, lead code reviews, and integrate REST microservices."
        },
        {
            "title": "Python & Django Backend Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 900000, "salary_max": 1600000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "Django", "MySQL", "REST API", "Git"],
            "pref": ["Docker", "Redis", "Linux"],
            "desc": "Develop robust backend services and business logic APIs for financial consulting and tax automation portals.",
            "reqs": "Strong experience in Django, ORM queries, data validation, and building authenticated API endpoints.",
            "resp": "Write clean, modular code, implement database migrations, and maintain comprehensive test coverage."
        },
        {
            "title": "Cloud Systems Administrator (Linux & AWS)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1000000, "salary_max": 1600000, "exp_min": 3, "exp_max": 6,
            "skills": ["Linux", "AWS", "Docker", "Networking", "CI/CD"],
            "pref": ["Bash", "Nginx", "Kubernetes"],
            "desc": "Maintain cloud server fleets, monitor system health, and automate system backups and security patches.",
            "reqs": "Deep familiarity with Linux command line, AWS EC2/S3/VPC configurations, and system troubleshooting.",
            "resp": "Provision servers, maintain uptime alerts, and assist developers with staging and production deployments."
        },
        {
            "title": "Data Analyst (Power BI & SQL Analytics)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 650000, "salary_max": 1100000, "exp_min": 1, "exp_max": 4,
            "skills": ["SQL", "Power BI", "Excel", "Data Analysis", "Communication"],
            "pref": ["Python", "Tableau", "Business Analysis"],
            "desc": "Help banking and retail clients understand operational metrics through interactive executive dashboards.",
            "reqs": "Solid SQL querying abilities, expertise in DAX and Power BI dashboard creation, and strong presentation skills.",
            "resp": "Extract business data, build dynamic reports, and present insights to regional leadership."
        },
        {
            "title": "Frontend React.js Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 850000, "salary_max": 1450000, "exp_min": 2, "exp_max": 5,
            "skills": ["React.js", "JavaScript", "Tailwind CSS", "HTML", "CSS", "Git"],
            "pref": ["Redux", "TypeScript", "REST API"],
            "desc": "Build responsive and elegant web interfaces for candidate recruitment and talent management portals.",
            "reqs": "2+ years working with React.js, modern CSS/Tailwind, component state management, and API integrations.",
            "resp": "Create clean user experiences, fix layout bugs, and optimize web page load times."
        }
    ],

    "Ahmedabad, India": [
        {
            "title": "Senior Full Stack PHP & React Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1000000, "salary_max": 1700000, "exp_min": 3, "exp_max": 7,
            "skills": ["PHP", "React.js", "MySQL", "JavaScript", "HTML", "CSS"],
            "pref": ["Laravel", "Tailwind CSS", "REST API"],
            "desc": "Join our fast-growing fintech and supply chain hub in Ahmedabad SG Highway.",
            "reqs": "Hands-on experience developing enterprise web solutions using Laravel and modern React frontends.",
            "resp": "Build secure payment modules, design normalized database schemas, and deploy web applications."
        },
        {
            "title": "Python & Machine Learning Specialist",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1200000, "salary_max": 2000000, "exp_min": 3, "exp_max": 6,
            "skills": ["Python", "Machine Learning", "Data Analysis", "SQL", "Pandas"],
            "pref": ["Scikit-learn", "FastAPI", "NLP"],
            "desc": "Build predictive models and business automation tools for commodity trading and pharmaceutical logistics.",
            "reqs": "Solid grasp of machine learning algorithms, statistical data analysis, and Python API development.",
            "resp": "Clean and preprocess large datasets, train regression and classification models, and deploy endpoints."
        },
        {
            "title": "Cloud DevOps Engineer (AWS & Docker)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 6,
            "skills": ["AWS", "Docker", "Linux", "CI/CD", "Git"],
            "pref": ["Kubernetes", "Terraform", "Nginx"],
            "desc": "Manage cloud deployments, implement automated CI/CD pipelines, and secure cloud networks.",
            "reqs": "Strong experience configuring AWS cloud services, containerizing applications with Docker, and bash scripting.",
            "resp": "Manage production deployments, configure load balancers, and maintain zero-downtime releases."
        },
        {
            "title": "UI/UX Mobile App Designer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 750000, "salary_max": 1300000, "exp_min": 2, "exp_max": 5,
            "skills": ["Figma", "UI/UX Design", "Communication", "Problem Solving"],
            "pref": ["Adobe XD", "Prototyping", "HTML"],
            "desc": "Design delightful user journeys, icons, and visual interfaces for mobile and web products.",
            "reqs": "Strong design portfolio, deep understanding of mobile interaction guidelines (Material Design / iOS Human Interface).",
            "resp": "Create wireframes, build high-fidelity interactive prototypes, and collaborate with engineering teams."
        },
        {
            "title": "QA Manual & Automation Tester",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 650000, "salary_max": 1100000, "exp_min": 1, "exp_max": 4,
            "skills": ["Unit Testing", "Postman", "Selenium", "JavaScript"],
            "pref": ["JIRA", "Test Cases", "Git"],
            "desc": "Perform comprehensive functional, integration, and regression testing across web and mobile platforms.",
            "reqs": "Experience writing detailed test cases, identifying edge-case bugs, and performing API sanity checks with Postman.",
            "resp": "Document software defects, execute test runs, and verify bug fixes before production releases."
        }
    ],

    "Jaipur, India": [
        {
            "title": "Senior Frontend Developer (React & TypeScript)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 7,
            "skills": ["React.js", "TypeScript", "Tailwind CSS", "JavaScript", "HTML", "CSS"],
            "pref": ["Next.js", "Redux", "REST API"],
            "desc": "Join our modern software engineering campus in Jaipur Mahindra World City tech SEZ.",
            "reqs": "3+ years developing production React web applications with clean TypeScript code and responsive layouts.",
            "resp": "Deliver user interface features, optimize frontend rendering speed, and maintain code quality."
        },
        {
            "title": "Full Stack MERN Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 950000, "salary_max": 1600000, "exp_min": 2, "exp_max": 5,
            "skills": ["MongoDB", "Express.js", "React.js", "Node.js", "JavaScript"],
            "pref": ["Docker", "REST API", "Git"],
            "desc": "Build scalable e-commerce and automotive marketplace portals with high user engagement.",
            "reqs": "Demonstrated full stack engineering experience using Node, Express, React, and MongoDB.",
            "resp": "Develop REST APIs, implement search filters, and integrate third-party payment gateways."
        },
        {
            "title": "Python & Django Backend Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 900000, "salary_max": 1500000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "Django", "PostgreSQL", "REST API", "Git"],
            "pref": ["Redis", "Celery", "Docker"],
            "desc": "Design and build secure API endpoints, background workers, and business reporting tools.",
            "reqs": "Strong understanding of Python, relational database schemas, and Django REST framework.",
            "resp": "Write modular backend services, maintain test suites, and deploy server updates."
        },
        {
            "title": "Mobile App Developer (Flutter)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 800000, "salary_max": 1400000, "exp_min": 2, "exp_max": 5,
            "skills": ["Flutter", "Dart", "Android Development", "REST API", "Git"],
            "pref": ["Firebase", "iOS Development", "State Management"],
            "desc": "Build cross-platform applications with smooth animations, local caching, and offline support.",
            "reqs": "Experience building Flutter applications with clean state management and REST API integrations.",
            "resp": "Develop new mobile screens, fix platform-specific UI issues, and publish updates."
        },
        {
            "title": "Cloud & Linux Support Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 650000, "salary_max": 1100000, "exp_min": 1, "exp_max": 4,
            "skills": ["Linux", "AWS", "Networking", "Git", "Problem Solving"],
            "pref": ["Docker", "Bash", "Apache"],
            "desc": "Provide 24/7 technical monitoring, infrastructure troubleshooting, and system maintenance for global clients.",
            "reqs": "Understanding of Linux networking, shell commands, web servers (Nginx/Apache), and cloud hosting.",
            "resp": "Monitor server alerts, resolve infrastructure support tickets, and perform software patch updates."
        }
    ],

    "Lucknow, India": [
        {
            "title": "Senior Software Engineer (Java / Spring Boot)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 7,
            "skills": ["Java", "Spring Boot", "MySQL", "REST API", "Git"],
            "pref": ["Microservices", "Docker", "Hibernate"],
            "desc": "Join our state-of-the-art campus at HCL IT City, Lucknow, working on high-impact digital transformation systems.",
            "reqs": "3+ years of enterprise Java development experience with Spring Boot, JPA/Hibernate, and relational databases.",
            "resp": "Develop business logic services, participate in technical code reviews, and build robust RESTful APIs."
        },
        {
            "title": "Full Stack Web Developer (Python & React)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 900000, "salary_max": 1500000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "Django", "React.js", "JavaScript", "PostgreSQL"],
            "pref": ["Tailwind CSS", "Docker", "REST API"],
            "desc": "Develop candidate and recruiter portal capabilities, resume parsing pipelines, and communication features.",
            "reqs": "Solid hands-on experience in both frontend React development and backend Python/Django architectures.",
            "resp": "Build end-to-end features, implement reactive UI interfaces, and maintain clean database models."
        },
        {
            "title": "Data Analyst & Business Reporting Specialist",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 600000, "salary_max": 1050000, "exp_min": 1, "exp_max": 4,
            "skills": ["SQL", "Excel", "Data Analysis", "Power BI", "Communication"],
            "pref": ["Python", "Tableau", "Problem Solving"],
            "desc": "Analyze employment, placement, and corporate hiring trends across northern India.",
            "reqs": "Strong proficiency in writing SQL queries, building analytical reports, and communicating insights clearly.",
            "resp": "Prepare weekly business reviews, generate automated data visualizations, and track key recruitment KPIs."
        },
        {
            "title": "Frontend Developer (React.js & Tailwind)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 750000, "salary_max": 1300000, "exp_min": 2, "exp_max": 5,
            "skills": ["React.js", "JavaScript", "Tailwind CSS", "HTML", "CSS"],
            "pref": ["TypeScript", "REST API", "Git"],
            "desc": "Build intuitive and responsive interfaces for candidates applying to jobs and recruiters reviewing resumes.",
            "reqs": "Proficiency with modern JavaScript (ES6+), React hooks, responsive web design, and Tailwind CSS.",
            "resp": "Implement UI components according to Figma design specs and ensure smooth mobile-first responsiveness."
        },
        {
            "title": "DevOps & Cloud Systems Administrator",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 850000, "salary_max": 1450000, "exp_min": 2, "exp_max": 5,
            "skills": ["Linux", "AWS", "Docker", "CI/CD", "Networking"],
            "pref": ["Bash", "Git", "Security"],
            "desc": "Manage cloud server instances, maintain database backups, and ensure strict cybersecurity standards.",
            "reqs": "Experience administering Linux servers, configuring AWS cloud infrastructure, and managing deployment pipelines.",
            "resp": "Maintain server uptime, implement regular security updates, and assist development teams with releases."
        }
    ],

    "Chandigarh, India": [
        {
            "title": "Senior Full Stack Developer (MERN Stack)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1200000, "salary_max": 1900000, "exp_min": 4, "exp_max": 7,
            "skills": ["React.js", "Node.js", "MongoDB", "Express.js", "TypeScript"],
            "pref": ["AWS", "Docker", "Next.js"],
            "desc": "Develop scalable SaaS applications at Chandigarh Rajiv Gandhi IT Park for North American enterprise clients.",
            "reqs": "4+ years of full stack development experience with React, Node, Express, and MongoDB/SQL databases.",
            "resp": "Architect core platform modules, write clean REST APIs, and review junior developer code."
        },
        {
            "title": "DevOps & Cloud Engineer (AWS / Terraform)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 6,
            "skills": ["AWS", "Terraform", "Docker", "Linux", "CI/CD"],
            "pref": ["Kubernetes", "Ansible", "Git"],
            "desc": "Automate cloud deployment pipelines and maintain robust multi-tier cloud environments.",
            "reqs": "Hands-on experience writing Infrastructure as Code (Terraform), managing container builds, and configuring CI/CD.",
            "resp": "Build automated deployment workflows, monitor production health, and lower cloud hosting costs."
        },
        {
            "title": "Python & AI Solutions Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1000000, "salary_max": 1700000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "Machine Learning", "FastAPI", "Data Analysis", "SQL"],
            "pref": ["PyTorch", "NLP", "Docker"],
            "desc": "Implement machine learning classification, predictive forecasting, and automated data processing tools.",
            "reqs": "Strong Python programming skills with practical experience deploying ML models via REST APIs.",
            "resp": "Train and evaluate models, build high-speed inference endpoints, and collaborate with product teams."
        },
        {
            "title": "Mobile App Engineer (iOS & Swift)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 900000, "salary_max": 1550000, "exp_min": 2, "exp_max": 5,
            "skills": ["Swift", "iOS Development", "REST API", "Git", "Problem Solving"],
            "pref": ["SwiftUI", "CocoaPods", "App Store"],
            "desc": "Build elegant native iOS applications with smooth animations and responsive gesture navigation.",
            "reqs": "Experience building and shipping native iOS applications in Swift with UIKit and SwiftUI.",
            "resp": "Develop new features, maintain code quality, and release updates to the Apple App Store."
        },
        {
            "title": "QA Automation & Performance Tester",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 700000, "salary_max": 1200000, "exp_min": 2, "exp_max": 5,
            "skills": ["Selenium", "Postman", "Unit Testing", "JavaScript"],
            "pref": ["Cypress", "JMeter", "Git"],
            "desc": "Develop and maintain automated end-to-end regression suites and perform API stress testing.",
            "reqs": "Experience in test automation frameworks, writing automated scripts in JavaScript/Python, and API verification.",
            "resp": "Execute test cycles, log actionable defect reports, and verify production release candidates."
        }
    ],

    "Indore, India": [
        {
            "title": "Senior Java Enterprise Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 7,
            "skills": ["Java", "Spring Boot", "MySQL", "REST API", "Microservices"],
            "pref": ["Docker", "Hibernate", "Git"],
            "desc": "Work at the prestigious Super Corridor IT campus in Indore on large-scale banking and insurance software.",
            "reqs": "Strong command of core Java, Spring Boot microservices, multithreading, and relational database queries.",
            "resp": "Develop core business services, optimize SQL transaction queries, and participate in technical design reviews."
        },
        {
            "title": "Full Stack React & Node.js Developer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 950000, "salary_max": 1600000, "exp_min": 2, "exp_max": 5,
            "skills": ["React.js", "Node.js", "JavaScript", "PostgreSQL", "HTML"],
            "pref": ["TypeScript", "Tailwind CSS", "Docker"],
            "desc": "Build next-generation talent acquisition tools, applicant tracking systems, and interactive recruiter dashboards.",
            "reqs": "Experience building scalable web applications with React frontend and Node.js backend services.",
            "resp": "Implement responsive web components, build secure REST APIs, and optimize page load performance."
        },
        {
            "title": "Python & Django Backend Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 850000, "salary_max": 1450000, "exp_min": 2, "exp_max": 5,
            "skills": ["Python", "Django", "MySQL", "REST API", "Git"],
            "pref": ["Redis", "Celery", "Linux"],
            "desc": "Design and maintain high-volume transactional APIs and background data processing workflows.",
            "reqs": "Proficiency in Python, Django REST Framework, database migrations, and clean code principles.",
            "resp": "Develop robust backend endpoints, write unit tests, and integrate third-party webhooks."
        },
        {
            "title": "Mobile App Developer (Flutter & Android)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 750000, "salary_max": 1300000, "exp_min": 2, "exp_max": 5,
            "skills": ["Flutter", "Dart", "Android Development", "REST API"],
            "pref": ["Firebase", "State Management", "Git"],
            "desc": "Build modern cross-platform mobile apps for millions of users with clean UX and offline synchronization.",
            "reqs": "Experience with Flutter app lifecycle, asynchronous programming in Dart, and REST API integration.",
            "resp": "Design mobile screens, implement client-side caching, and publish application builds."
        },
        {
            "title": "DevOps & Cloud Engineer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 900000, "salary_max": 1500000, "exp_min": 2, "exp_max": 5,
            "skills": ["AWS", "Linux", "Docker", "CI/CD", "Git"],
            "pref": ["Terraform", "Bash", "Kubernetes"],
            "desc": "Oversee cloud server deployments, configure automated CI/CD builds, and ensure 99.9% application uptime.",
            "reqs": "Hands-on experience in AWS cloud infrastructure, Docker containerization, and shell automation scripts.",
            "resp": "Automate build deployments, monitor server metrics, and troubleshoot production issues."
        }
    ],

    "Kochi, India": [
        {
            "title": "Senior Cloud Software Engineer (Go & Kubernetes)",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1400000, "salary_max": 2300000, "exp_min": 4, "exp_max": 8,
            "skills": ["Go", "Kubernetes", "Docker", "Microservices", "Linux"],
            "pref": ["AWS", "gRPC", "CI/CD"],
            "desc": "Join our innovative tech hub at Infopark Kochi, developing cloud-native distributed microservices.",
            "reqs": "Strong experience writing efficient, concurrent Go code and deploying containerized services on Kubernetes.",
            "resp": "Architect high-performance microservices, optimize network throughput, and manage container deployments."
        },
        {
            "title": "Full Stack Python & React Developer",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 1100000, "salary_max": 1800000, "exp_min": 3, "exp_max": 6,
            "skills": ["Python", "Django", "React.js", "PostgreSQL", "JavaScript"],
            "pref": ["TypeScript", "Tailwind CSS", "Docker"],
            "desc": "Build global airline and hospitality management solutions with real-time booking and analytics.",
            "reqs": "Experience with full stack architectures, Django REST API development, and modern React component design.",
            "resp": "Develop new application features, optimize database queries, and participate in agile sprints."
        },
        {
            "title": "AI & Computer Vision Research Engineer",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 1300000, "salary_max": 2200000, "exp_min": 3, "exp_max": 6,
            "skills": ["Python", "Machine Learning", "PyTorch", "Data Analysis"],
            "pref": ["Computer Vision", "TensorFlow", "FastAPI"],
            "desc": "Develop smart camera analytics and automated inspection models at the Maker Village tech incubation centre.",
            "reqs": "Strong background in computer vision, image processing, deep neural networks, and model deployment.",
            "resp": "Train object detection models, optimize inference on edge devices, and build REST integration services."
        },
        {
            "title": "Mobile App Developer (Flutter & React Native)",
            "job_type": "FULL_TIME", "work_mode": "ON_SITE",
            "salary_min": 850000, "salary_max": 1500000, "exp_min": 2, "exp_max": 5,
            "skills": ["Flutter", "React Native", "JavaScript", "Dart", "REST API"],
            "pref": ["iOS Development", "Android Development", "Git"],
            "desc": "Build engaging mobile applications for travel, logistics, and enterprise internal collaboration.",
            "reqs": "2+ years building and deploying mobile applications with Flutter or React Native frameworks.",
            "resp": "Implement custom UI widgets, handle background location services, and deploy production builds."
        },
        {
            "title": "QA Automation & Security Tester",
            "job_type": "FULL_TIME", "work_mode": "HYBRID",
            "salary_min": 800000, "salary_max": 1350000, "exp_min": 2, "exp_max": 5,
            "skills": ["Selenium", "Postman", "Unit Testing", "Cybersecurity"],
            "pref": ["OWASP", "Cypress", "Python"],
            "desc": "Execute automated integration testing suites and conduct vulnerability scans on cloud applications.",
            "reqs": "Experience designing automated test scripts and conducting basic security and penetration checks.",
            "resp": "Write automated end-to-end tests, identify security regressions, and document verification reports."
        }
    ],

    "Remote, India": [
        {
            "title": "Senior Remote Full Stack Architect (React / Node.js)",
            "job_type": "FULL_TIME", "work_mode": "REMOTE",
            "salary_min": 2000000, "salary_max": 3200000, "exp_min": 6, "exp_max": 12,
            "skills": ["React.js", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
            "pref": ["Microservices", "GraphQL", "Redis"],
            "desc": "100% remote role based anywhere in India. Lead the architecture of our high-volume candidate job matching platform.",
            "reqs": "Demonstrated track record of working effectively in distributed, remote-first engineering teams with deep architecture skills.",
            "resp": "Architect core platform systems, establish code quality standards, and coordinate cross-timezone product launches."
        },
        {
            "title": "Remote Python AI / LLM Engineer",
            "job_type": "FULL_TIME", "work_mode": "REMOTE",
            "salary_min": 2200000, "salary_max": 3600000, "exp_min": 4, "exp_max": 8,
            "skills": ["Python", "Machine Learning", "NLP", "FastAPI", "PostgreSQL"],
            "pref": ["LangChain", "Vector Databases", "PyTorch"],
            "desc": "Work remotely from anywhere in India to build AI Resume Parsers, candidate-job matching scores, and automated interview prep.",
            "reqs": "Extensive experience using large language models, prompt engineering, vector embeddings, and building FastAPI backends.",
            "resp": "Develop semantic search algorithms, benchmark match score precision, and build production inference services."
        },
        {
            "title": "Remote Senior DevOps & SRE Engineer",
            "job_type": "FULL_TIME", "work_mode": "REMOTE",
            "salary_min": 1800000, "salary_max": 2900000, "exp_min": 5, "exp_max": 9,
            "skills": ["AWS", "Kubernetes", "Terraform", "Docker", "Linux", "CI/CD"],
            "pref": ["Grafana", "Prometheus", "Cost Optimization"],
            "desc": "Manage cloud reliability, automated deployment pipelines, and zero-downtime infrastructure in a flexible remote setting.",
            "reqs": "Deep expertise in Infrastructure as Code, Kubernetes cluster operations, and proactive incident response.",
            "resp": "Automate deployment pipelines, lead on-call incident resolution, and continuously optimize cloud compute spend."
        },
        {
            "title": "Remote Lead UI/UX Product Designer",
            "job_type": "FULL_TIME", "work_mode": "REMOTE",
            "salary_min": 1400000, "salary_max": 2400000, "exp_min": 4, "exp_max": 8,
            "skills": ["Figma", "UI/UX Design", "Communication", "Problem Solving"],
            "pref": ["Design Systems", "Prototyping", "HTML/CSS"],
            "desc": "Design modern, accessible, and delightful digital experiences for job seekers and hiring managers across India.",
            "reqs": "Strong portfolio illustrating end-to-end design thinking, user research, wireframing, and component design systems.",
            "resp": "Create Figma prototypes, conduct usability research interviews, and collaborate with remote frontend engineers."
        },
        {
            "title": "Remote Frontend Engineer (Next.js & Tailwind)",
            "job_type": "FULL_TIME", "work_mode": "REMOTE",
            "salary_min": 1300000, "salary_max": 2100000, "exp_min": 3, "exp_max": 6,
            "skills": ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "REST API"],
            "pref": ["Redux", "Jest", "WebSockets"],
            "desc": "Build responsive, high-performance web applications with server-side rendering and interactive maps.",
            "reqs": "Solid experience in Next.js, React state management, Tailwind CSS styling, and responsive design principles.",
            "resp": "Implement new candidate portal pages, optimize web performance metrics, and fix UI responsiveness bugs."
        }
    ]
}

# 4. Insert Jobs into Database
total_added = 0
deadline_date = (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d')

for loc_name, jobs_list in LOCATIONS_JOB_SPECS.items():
    print(f"\nProcessing Location: {loc_name} ({len(jobs_list)} jobs configured)...")
    for idx, spec in enumerate(jobs_list):
        # Check if job title and location already exists
        cur.execute("SELECT id FROM jobs WHERE title = ? AND location = ?", (spec["title"], loc_name))
        existing = cur.fetchone()
        if existing:
            # Update to ensure status is PUBLISHED and company is linked
            comp_id = get_company_id(idx + hash(loc_name) % 10)
            cur.execute("""
                UPDATE jobs 
                SET status = 'PUBLISHED', company_id = ?, salary_min = ?, salary_max = ?, updated_at = datetime('now')
                WHERE id = ?
            """, (comp_id, spec["salary_min"], spec["salary_max"], existing[0]))
            print(f"  [Updated] {spec['title']}")
        else:
            comp_id = get_company_id(idx + hash(loc_name) % 10)
            cur.execute("""
                INSERT INTO jobs (
                    recruiter_id, company_id, title, description, requirements, responsibilities,
                    required_skills, preferred_skills, location, job_type, work_mode,
                    salary_min, salary_max, experience_min, experience_max, education_required,
                    application_deadline, status, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', datetime('now'), datetime('now')
                )
            """, (
                default_recruiter_id,
                comp_id,
                spec["title"],
                spec["desc"],
                spec["reqs"],
                spec["resp"],
                json.dumps(spec["skills"]),
                json.dumps(spec["pref"]),
                loc_name,
                spec["job_type"],
                spec["work_mode"],
                spec["salary_min"],
                spec["salary_max"],
                spec["exp_min"],
                spec["exp_max"],
                "Bachelor's / Master's in Computer Science, Engineering, or Equivalent",
                deadline_date
            ))
            total_added += 1
            print(f"  [Inserted] {spec['title']}")

conn.commit()

# Print Final Summary of Jobs per Location
print("\n===============================")
print(f"[SUCCESS] Seeding Complete! Total new jobs added: {total_added}")
print("===============================\n")

cur.execute("""
    SELECT location, COUNT(*) as cnt 
    FROM jobs 
    WHERE status = 'PUBLISHED' 
    GROUP BY location 
    ORDER BY cnt DESC
""")
summary = cur.fetchall()
print("CURRENT PUBLISHED JOBS PER LOCATION:")
for loc, cnt in summary:
    print(f"  * {loc}: {cnt} jobs")

conn.close()
