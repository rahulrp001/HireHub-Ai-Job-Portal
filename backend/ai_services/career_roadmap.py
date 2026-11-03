import os
import re
import json

# Comprehensive resource dictionary for high-demand skills
SKILL_RESOURCES = {
    "python": {"name": "Python.org Official Tutorial", "url": "https://docs.python.org/3/tutorial/"},
    "javascript": {"name": "JavaScript.info - Modern Tutorial", "url": "https://javascript.info"},
    "typescript": {"name": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/"},
    "react": {"name": "React.dev Official Documentation", "url": "https://react.dev"},
    "react.js": {"name": "React.dev Official Documentation", "url": "https://react.dev"},
    "next.js": {"name": "Next.js Learn Course", "url": "https://nextjs.org/learn"},
    "node.js": {"name": "Node.js Official Documentation", "url": "https://nodejs.org/en/docs"},
    "vue.js": {"name": "Vue.js Official Guide", "url": "https://vuejs.org/guide/introduction.html"},
    "angular": {"name": "Angular Official Tutorial", "url": "https://angular.dev"},
    "django": {"name": "Django Official Documentation", "url": "https://docs.djangoproject.com/en/stable/"},
    "fastapi": {"name": "FastAPI Interactive Docs", "url": "https://fastapi.tiangolo.com/tutorial/"},
    "flask": {"name": "Flask Quickstart", "url": "https://flask.palletsprojects.com/quickstart/"},
    "java": {"name": "Oracle Java Tutorials", "url": "https://docs.oracle.com/javase/tutorial/"},
    "spring boot": {"name": "Spring Boot Reference Guide", "url": "https://spring.io/guides/gs/spring-boot/"},
    "c++": {"name": "LearnCpp.com Free Tutorials", "url": "https://www.learncpp.com"},
    "c": {"name": "C Programming Language Guide", "url": "https://en.cppreference.com/w/c"},
    "c#": {"name": "Microsoft C# Documentation", "url": "https://learn.microsoft.com/en-us/dotnet/csharp/"},
    "go": {"name": "Go Tour & Official Docs", "url": "https://go.dev/tour/"},
    "golang": {"name": "Go Tour & Official Docs", "url": "https://go.dev/tour/"},
    "rust": {"name": "The Rust Programming Language Book", "url": "https://doc.rust-lang.org/book/"},
    "sql": {"name": "SQLZoo Interactive Practice", "url": "https://sqlzoo.net"},
    "postgresql": {"name": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com"},
    "mysql": {"name": "MySQL Tutorial", "url": "https://www.mysqltutorial.org"},
    "mongodb": {"name": "MongoDB University Free Courses", "url": "https://learn.mongodb.com"},
    "redis": {"name": "Redis Official University", "url": "https://university.redis.com"},
    "docker": {"name": "Docker Getting Started Guide", "url": "https://docs.docker.com/get-started/"},
    "kubernetes": {"name": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/"},
    "k8s": {"name": "Kubernetes Official Tutorials", "url": "https://kubernetes.io/docs/tutorials/"},
    "aws": {"name": "AWS Free Tier & Skill Builder", "url": "https://aws.amazon.com/training/"},
    "gcp": {"name": "Google Cloud Skills Boost", "url": "https://www.cloudskillsboost.google"},
    "azure": {"name": "Microsoft Learn for Azure", "url": "https://learn.microsoft.com/en-us/azure/"},
    "terraform": {"name": "HashiCorp Terraform Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials"},
    "ci/cd": {"name": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions"},
    "linux": {"name": "Linux Journey - Interactive Guide", "url": "https://linuxjourney.com"},
    "git": {"name": "Pro Git Book (Free)", "url": "https://git-scm.com/book/en/v2"},
    "github": {"name": "GitHub Skills Interactive Modules", "url": "https://skills.github.com"},
    "machine learning": {"name": "Coursera ML by Andrew Ng", "url": "https://www.coursera.org/learn/machine-learning"},
    "deep learning": {"name": "Fast.ai Practical Deep Learning", "url": "https://course.fast.ai"},
    "pytorch": {"name": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/"},
    "tensorflow": {"name": "TensorFlow Official Guides", "url": "https://www.tensorflow.org/tutorials"},
    "scikit-learn": {"name": "Scikit-Learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
    "pandas": {"name": "Pandas Getting Started Guide", "url": "https://pandas.pydata.org/docs/getting_started/index.html"},
    "numpy": {"name": "NumPy Absolute Beginner Guide", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html"},
    "nlp": {"name": "Hugging Face NLP Course", "url": "https://huggingface.co/learn/nlp-course/chapter1/1"},
    "computer vision": {"name": "OpenCV Official Tutorials", "url": "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html"},
    "flutter": {"name": "Flutter Official Documentation", "url": "https://docs.flutter.dev"},
    "react native": {"name": "React Native Official Docs", "url": "https://reactnative.dev/docs/getting-started"},
    "swift": {"name": "Swift.org Documentation & Tour", "url": "https://www.swift.org/documentation/"},
    "kotlin": {"name": "Kotlin Language Documentation", "url": "https://kotlinlang.org/docs/home.html"},
    "android": {"name": "Android Developers Codelabs", "url": "https://developer.android.com/courses"},
    "ios": {"name": "Apple iOS Developer Tutorials", "url": "https://developer.apple.com/tutorials/swiftui"},
    "cybersecurity": {"name": "OWASP Top 10 Security Risks", "url": "https://owasp.org/www-project-top-ten/"},
    "ethical hacking": {"name": "Hack The Box Academy", "url": "https://academy.hackthebox.com"},
    "networking": {"name": "Cloudflare Learning Center", "url": "https://www.cloudflare.com/learning/"},
    "blockchain": {"name": "Ethereum.org Developer Docs", "url": "https://ethereum.org/en/developers/docs/"},
    "solidity": {"name": "Solidity Language Documentation", "url": "https://docs.soliditylang.org"},
    "figma": {"name": "Figma Learn Hub & Tutorials", "url": "https://help.figma.com/hc/en-us/categories/360002051613"},
    "ui/ux": {"name": "Nielsen Norman Group UX Articles", "url": "https://www.nngroup.com/articles/"},
    "product management": {"name": "Product School Resources", "url": "https://productschool.com/resources"},
    "agile": {"name": "Atlassian Agile Coach", "url": "https://www.atlassian.com/agile"},
    "selenium": {"name": "Selenium WebDriver Documentation", "url": "https://www.selenium.dev/documentation/"},
    "cypress": {"name": "Cypress Official Docs", "url": "https://docs.cypress.io"},
    "power bi": {"name": "Microsoft Power BI Guided Learning", "url": "https://learn.microsoft.com/en-us/power-bi/guidance/"},
    "tableau": {"name": "Tableau Free Training Videos", "url": "https://www.tableau.com/learn/training"},
    "graphql": {"name": "GraphQL Official Tutorials", "url": "https://graphql.org/learn/"},
    "microservices": {"name": "Microservices.io Architectural Patterns", "url": "https://microservices.io/patterns/"},
    "system design": {"name": "System Design Primer by Donne Martin", "url": "https://github.com/donnemartin/system-design-primer"},
}

def get_resources_for_skills(skills):
    resources = []
    seen_urls = set()
    for s in skills:
        key = s.lower().strip()
        for k, res in SKILL_RESOURCES.items():
            if k in key or key in k:
                if res["url"] not in seen_urls:
                    resources.append(res)
                    seen_urls.add(res["url"])
                    break
        if len(resources) >= 3:
            break
            
    if not resources:
        resources = [
            {"name": "Roadmap.sh Developer Guides", "url": "https://roadmap.sh"},
            {"name": "freeCodeCamp Interactive Library", "url": "https://www.freecodecamp.org"},
        ]
    return resources

def has_term(text, terms):
    for term in terms:
        if len(term) <= 3:
            if re.search(r'\b' + re.escape(term) + r'\b', text):
                return True
        elif term in text:
            return True
    return False

def generate_dynamic_roadmap(target_role: str) -> dict:
    role = target_role.strip().title()
    role_lower = target_role.lower()

    # Domain classification
    if has_term(role_lower, ["artificial intelligence", "machine learning", "deep learning", "nlp", "computer vision", "data scientist", "ai engineer", "ai researcher", "ml engineer", "generative ai", "ai", "ml"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master modern data processing, machine learning models, and production AI engineering to become a successful {role}.",
            "total_months": 8,
            "steps": [
                {
                    "step": 1,
                    "title": "Mathematics, Probability & Python Fundamentals",
                    "duration": "4-5 weeks",
                    "skills": ["Python", "NumPy", "Pandas", "Linear Algebra", "Statistics", "Git"],
                    "project": "Build an exploratory data analysis (EDA) pipeline on a real-world Kaggle dataset with statistical visualizations.",
                    "resources": get_resources_for_skills(["python", "pandas", "numpy", "git"])
                },
                {
                    "step": 2,
                    "title": "Classical Machine Learning & Feature Engineering",
                    "duration": "5-6 weeks",
                    "skills": ["Scikit-Learn", "Regression", "Classification", "Clustering", "Feature Engineering", "SQL"],
                    "project": "Develop and tune an end-to-end customer churn or salary prediction model with cross-validation.",
                    "resources": get_resources_for_skills(["machine learning", "scikit-learn", "sql"])
                },
                {
                    "step": 3,
                    "title": "Deep Learning & Neural Architectures",
                    "duration": "6-7 weeks",
                    "skills": ["PyTorch", "TensorFlow", "Neural Networks", "CNN", "RNN", "Transformers"],
                    "project": "Train an image classification or sentiment analysis model using PyTorch transfer learning.",
                    "resources": get_resources_for_skills(["pytorch", "deep learning", "tensorflow"])
                },
                {
                    "step": 4,
                    "title": "Generative AI, LLMs & Vector Search",
                    "duration": "4-5 weeks",
                    "skills": ["NLP", "LLMs", "LangChain", "Vector Databases", "Prompt Engineering", "FastAPI"],
                    "project": "Build a Retrieval-Augmented Generation (RAG) assistant querying local documentation with semantic search.",
                    "resources": get_resources_for_skills(["nlp", "fastapi", "python"])
                },
                {
                    "step": 5,
                    "title": "MLOps, Containerization & Production Deployment",
                    "duration": "4 weeks",
                    "skills": ["Docker", "MLflow", "AWS", "CI/CD", "Model Serving", "Monitoring"],
                    "project": "Deploy your trained model as a containerized REST API with automated CI/CD and latency metrics.",
                    "resources": get_resources_for_skills(["docker", "aws", "ci/cd"])
                }
            ]
        }

    elif any(k in role_lower for k in ["devops", "cloud", "sre", "reliability", "infrastructure", "kubernetes", "aws", "platform"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master automated infrastructure provisioning, container orchestration, CI/CD, and high-availability cloud architecture for {role}.",
            "total_months": 7,
            "steps": [
                {
                    "step": 1,
                    "title": "Linux Operating Systems, Networking & Scripting",
                    "duration": "4 weeks",
                    "skills": ["Linux", "Bash", "Shell Scripting", "Networking", "Git", "SSH"],
                    "project": "Write automated shell scripts for system health auditing, log rotation, and server hardening.",
                    "resources": get_resources_for_skills(["linux", "networking", "git"])
                },
                {
                    "step": 2,
                    "title": "Containers & Microservices Architecture",
                    "duration": "4-5 weeks",
                    "skills": ["Docker", "Docker Compose", "Container Networking", "Nginx", "Microservices"],
                    "project": "Containerize a multi-service web application with database caching, reverse proxy, and environment management.",
                    "resources": get_resources_for_skills(["docker", "microservices"])
                },
                {
                    "step": 3,
                    "title": "Container Orchestration with Kubernetes",
                    "duration": "5-6 weeks",
                    "skills": ["Kubernetes", "Pods", "Deployments", "Services", "Helm", "Ingress"],
                    "project": "Deploy a multi-tier resilient application with auto-scaling (HPA) and ingress routing on a Kubernetes cluster.",
                    "resources": get_resources_for_skills(["kubernetes", "k8s"])
                },
                {
                    "step": 4,
                    "title": "Infrastructure as Code (IaC) & Cloud Engineering",
                    "duration": "5 weeks",
                    "skills": ["Terraform", "AWS", "VPC", "IAM", "S3", "EC2"],
                    "project": "Provision a secure multi-AZ AWS cloud infrastructure using modular Terraform templates.",
                    "resources": get_resources_for_skills(["terraform", "aws"])
                },
                {
                    "step": 5,
                    "title": "Automated CI/CD & Observability Monitoring",
                    "duration": "4 weeks",
                    "skills": ["CI/CD", "GitHub Actions", "Prometheus", "Grafana", "System Design"],
                    "project": "Set up a full GitOps pipeline that runs automated testing, builds Docker images, and deploys to cloud with Grafana alerts.",
                    "resources": get_resources_for_skills(["ci/cd", "system design"])
                }
            ]
        }

    elif any(k in role_lower for k in ["mobile", "android", "ios", "flutter", "react native", "swift", "kotlin"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Learn to architect, build, and publish high-performance, responsive native and cross-platform mobile apps as a {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": "Mobile Programming Languages & OOP",
                    "duration": "4 weeks",
                    "skills": ["JavaScript", "TypeScript", "Dart", "Swift", "OOP", "Git"],
                    "project": "Build an asynchronous mobile CLI or algorithm suite with solid unit test coverage.",
                    "resources": get_resources_for_skills(["flutter", "javascript", "swift", "git"])
                },
                {
                    "step": 2,
                    "title": "Mobile UI Components & State Management",
                    "duration": "5 weeks",
                    "skills": ["Flutter", "React Native", "State Management", "Navigation", "Responsive UI"],
                    "project": "Build a responsive mobile e-commerce or food delivery app with multi-screen navigation and shopping cart state.",
                    "resources": get_resources_for_skills(["flutter", "react native"])
                },
                {
                    "step": 3,
                    "title": "Device APIs & Offline Persistence",
                    "duration": "4-5 weeks",
                    "skills": ["Camera", "Location", "Push Notifications", "SQLite", "AsyncStorage", "REST API"],
                    "project": "Create a location-based mobile application with local database offline sync and push alert triggers.",
                    "resources": get_resources_for_skills(["android", "ios", "rest api"])
                },
                {
                    "step": 4,
                    "title": "Backend Integration, Auth & Performance Optimization",
                    "duration": "4 weeks",
                    "skills": ["REST API", "JWT Auth", "Firebase", "App Performance", "Animations"],
                    "project": "Integrate secure biometric authentication, payment gateway, and high-FPS smooth gesture animations.",
                    "resources": get_resources_for_skills(["react native", "flutter"])
                },
                {
                    "step": 5,
                    "title": "Testing, App Store & Play Store Deployment",
                    "duration": "3 weeks",
                    "skills": ["Jest", "App Store", "Play Store", "CI/CD", "Mobile Security"],
                    "project": "Prepare app release bundles, configure signing certificates, and publish a functional app build to stores.",
                    "resources": get_resources_for_skills(["android", "ios", "ci/cd"])
                }
            ]
        }

    elif any(k in role_lower for k in ["cyber", "security", "infosec", "penetration", "soc", "ethical"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Develop defensive and offensive security skills, threat detection, and vulnerability mitigation to excel as a {role}.",
            "total_months": 7,
            "steps": [
                {
                    "step": 1,
                    "title": "Computer Networks, Protocols & Operating Systems",
                    "duration": "5 weeks",
                    "skills": ["Networking", "TCP/IP", "DNS", "Linux", "Windows Security", "Wireshark"],
                    "project": "Conduct packet analysis on simulated network attacks and identify unencrypted credential leaks.",
                    "resources": get_resources_for_skills(["networking", "linux"])
                },
                {
                    "step": 2,
                    "title": "Web Application Security & OWASP Top 10",
                    "duration": "5-6 weeks",
                    "skills": ["Cybersecurity", "OWASP", "SQL Injection", "XSS", "CSRF", "Burp Suite"],
                    "project": "Perform a comprehensive black-box security audit on a vulnerable test web application and draft remediation fixes.",
                    "resources": get_resources_for_skills(["cybersecurity", "ethical hacking"])
                },
                {
                    "step": 3,
                    "title": "Security Automation & Python Scripting",
                    "duration": "4 weeks",
                    "skills": ["Python", "Bash", "API Security", "Vulnerability Scanning", "Nmap"],
                    "project": "Build an automated port scanner and SSL certificate expiry monitor with Discord/Slack webhook alerts.",
                    "resources": get_resources_for_skills(["python", "ethical hacking"])
                },
                {
                    "step": 4,
                    "title": "Cloud Security, IAM & Identity Governance",
                    "duration": "4-5 weeks",
                    "skills": ["AWS", "IAM", "Cloud Security", "OAuth", "Zero Trust", "Firewalls"],
                    "project": "Implement strict Least Privilege IAM policies and security groups on a multi-tier cloud deployment.",
                    "resources": get_resources_for_skills(["aws", "cybersecurity"])
                },
                {
                    "step": 5,
                    "title": "Incident Response, SIEM & Penetration Testing",
                    "duration": "4 weeks",
                    "skills": ["Ethical Hacking", "SIEM", "Splunk", "Incident Response", "Compliance"],
                    "project": "Simulate a live malware incident, trace log indicators of compromise (IoC), and author a formal post-incident report.",
                    "resources": get_resources_for_skills(["ethical hacking", "cybersecurity"])
                }
            ]
        }

    elif has_term(role_lower, ["data analyst", "data analytics", "data engineer", "business intelligence", "bi developer", "power bi", "tableau", "analytics", "big data"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master modern data querying, visual storytelling, business intelligence pipelines, and predictive analytics to thrive as a {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": "Advanced SQL, Relational Modeling & Data Warehousing",
                    "duration": "4 weeks",
                    "skills": ["SQL", "PostgreSQL", "Data Modeling", "Window Functions", "Joins", "CTE"],
                    "project": "Build an analytical data warehouse model with star schema and write complex analytical queries for sales cohort retention.",
                    "resources": get_resources_for_skills(["sql", "postgresql"])
                },
                {
                    "step": 2,
                    "title": "Python for Data Analysis & Exploratory Analytics",
                    "duration": "5 weeks",
                    "skills": ["Python", "Pandas", "NumPy", "Data Cleaning", "Matplotlib", "Seaborn"],
                    "project": "Perform comprehensive exploratory data analysis (EDA) on a messy multi-million row dataset and generate an automated cleaning pipeline.",
                    "resources": get_resources_for_skills(["python", "pandas", "numpy"])
                },
                {
                    "step": 3,
                    "title": "BI Dashboards, Power BI / Tableau & Visual Storytelling",
                    "duration": "4 weeks",
                    "skills": ["Power BI", "Tableau", "DAX", "Data Visualization", "Executive Reporting", "KPI Tracking"],
                    "project": "Design an executive C-suite KPI dashboard with interactive drill-downs, dynamic filters, and real-time database connection.",
                    "resources": get_resources_for_skills(["power bi", "tableau"])
                },
                {
                    "step": 4,
                    "title": "Statistical Testing, A/B Experiments & Predictive Insights",
                    "duration": "4 weeks",
                    "skills": ["Statistics", "Hypothesis Testing", "A/B Testing", "Scikit-Learn", "Regression Analysis"],
                    "project": "Design and analyze an end-to-end A/B test with p-value calculation, confidence intervals, and revenue impact forecast.",
                    "resources": get_resources_for_skills(["scikit-learn", "machine learning"])
                },
                {
                    "step": 5,
                    "title": "ETL Pipelines, Cloud Analytics & Capstone Portfolio",
                    "duration": "4 weeks",
                    "skills": ["ETL", "AWS", "BigQuery", "Data Pipelines", "Git", "Stakeholder Communication"],
                    "project": f"Build a production-grade automated analytics pipeline loading raw data into a cloud warehouse with scheduled dashboard refreshes.",
                    "resources": get_resources_for_skills(["aws", "sql", "git"])
                }
            ]
        }

    elif has_term(role_lower, ["product manager", "pm", "product owner", "scrum master", "business analyst"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master product discovery, agile execution, data-driven prioritization, and cross-functional leadership as a {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": "Product Discovery, User Research & Design Thinking",
                    "duration": "4 weeks",
                    "skills": ["Product Management", "User Research", "Wireframing", "Figma", "Problem Solving"],
                    "project": "Conduct user interviews, map customer journey funnels, and draft a Product Requirements Document (PRD).",
                    "resources": get_resources_for_skills(["product management", "figma", "ui/ux"])
                },
                {
                    "step": 2,
                    "title": "Data-Driven Decision Making & Product Analytics",
                    "duration": "5 weeks",
                    "skills": ["SQL", "Data Analysis", "Excel", "A/B Testing", "Mixpanel", "Tableau"],
                    "project": "Perform product retention cohort analysis and design an A/B test hypothesis with statistical significance metrics.",
                    "resources": get_resources_for_skills(["sql", "data analysis", "tableau"])
                },
                {
                    "step": 3,
                    "title": "Agile Delivery, Sprint Planning & Roadmapping",
                    "duration": "4 weeks",
                    "skills": ["Agile", "Scrum", "JIRA", "Roadmap Planning", "Backlog Grooming"],
                    "project": "Set up a complete Jira/Notion project board with epics, user stories, acceptance criteria, and story points.",
                    "resources": get_resources_for_skills(["agile", "product management"])
                },
                {
                    "step": 4,
                    "title": "Technical Literacy, System Architecture & APIs",
                    "duration": "4 weeks",
                    "skills": ["System Design", "REST API", "Database Design", "Cloud Basics"],
                    "project": "Map out an architectural flow diagram for an asynchronous checkout and notification system.",
                    "resources": get_resources_for_skills(["system design", "rest api"])
                },
                {
                    "step": 5,
                    "title": "Go-to-Market Strategy, Monetization & Growth",
                    "duration": "4 weeks",
                    "skills": ["Growth Strategy", "Monetization", "Product Marketing", "Stakeholder Management"],
                    "project": "Create a launch plan with pricing tiers, competitive matrix, and executive presentation deck.",
                    "resources": get_resources_for_skills(["product management", "communication"])
                }
            ]
        }

    elif has_term(role_lower, ["ui/ux", "ui designer", "ux designer", "graphic designer", "product designer", "interaction design", "ui", "ux"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master human-centered UI/UX design, visual systems, prototyping, and accessibility standards for {role}.",
            "total_months": 5,
            "steps": [
                {
                    "step": 1,
                    "title": "Design Principles, Typography & Color Theory",
                    "duration": "3-4 weeks",
                    "skills": ["UI/UX", "Visual Design", "Typography", "Color Theory", "Figma"],
                    "project": "Design high-contrast, accessible landing page layouts with disciplined typographic scale.",
                    "resources": get_resources_for_skills(["figma", "ui/ux"])
                },
                {
                    "step": 2,
                    "title": "Wireframing, User Flows & Information Architecture",
                    "duration": "4 weeks",
                    "skills": ["User Research", "Information Architecture", "Wireframing", "Prototyping"],
                    "project": "Create low-fidelity wireframes and click-through flows for a multi-step financial onboarding process.",
                    "resources": get_resources_for_skills(["ui/ux", "figma"])
                },
                {
                    "step": 3,
                    "title": "Design Systems & Component Libraries in Figma",
                    "duration": "4-5 weeks",
                    "skills": ["Figma", "Design Systems", "Auto-layout", "Variants", "Design Tokens"],
                    "project": "Build an exhaustive design system in Figma with auto-layout, interactive states, and responsive variants.",
                    "resources": get_resources_for_skills(["figma"])
                },
                {
                    "step": 4,
                    "title": "Usability Testing, Micro-interactions & Prototyping",
                    "duration": "4 weeks",
                    "skills": ["Micro-interactions", "User Testing", "Accessibility (WCAG)", "Prototyping"],
                    "project": "Build a high-fidelity interactive prototype featuring realistic micro-animations and validation feedback.",
                    "resources": get_resources_for_skills(["ui/ux", "figma"])
                },
                {
                    "step": 5,
                    "title": "Developer Handoff, Portfolio Case Studies & Presentation",
                    "duration": "3 weeks",
                    "skills": ["Developer Handoff", "HTML", "CSS", "Portfolio Building"],
                    "project": "Publish two end-to-end case studies detailing problem statements, research artifacts, and final designs.",
                    "resources": get_resources_for_skills(["ui/ux", "figma"])
                }
            ]
        }

    elif has_term(role_lower, ["blockchain", "web3", "crypto", "smart contract", "solidity", "ethereum"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Learn smart contract development, cryptographic security, decentralized apps (DApps), and Web3 protocols for {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": "Cryptography, Distributed Ledgers & Ethereum Basics",
                    "duration": "4 weeks",
                    "skills": ["Blockchain", "Cryptography", "Ethereum", "Consensus", "JavaScript"],
                    "project": "Simulate cryptographic hashing, asymmetric key signing, and proof-of-work mining in JavaScript.",
                    "resources": get_resources_for_skills(["blockchain", "javascript"])
                },
                {
                    "step": 2,
                    "title": "Solidity Smart Contract Development",
                    "duration": "5 weeks",
                    "skills": ["Solidity", "Smart Contracts", "Remix IDE", "EVM", "Token Standards (ERC-20/721)"],
                    "project": "Author, compile, and unit test an ERC-20 token and NFT smart contract with access controls.",
                    "resources": get_resources_for_skills(["solidity", "blockchain"])
                },
                {
                    "step": 3,
                    "title": "Smart Contract Testing, Security & Hardhat",
                    "duration": "4-5 weeks",
                    "skills": ["Hardhat", "TypeScript", "Unit Testing", "Reentrancy Protection", "Gas Optimization"],
                    "project": "Build a comprehensive automated test suite testing edge cases, reentrancy attacks, and gas savings.",
                    "resources": get_resources_for_skills(["solidity", "typescript"])
                },
                {
                    "step": 4,
                    "title": "Full Stack DApp Frontend & Web3 Providers",
                    "duration": "4 weeks",
                    "skills": ["React.js", "Next.js", "Ethers.js / Viem", "Wagmi", "MetaMask Integration"],
                    "project": "Build a decentralized web app interface connecting browser wallets to read/write from deployed contracts.",
                    "resources": get_resources_for_skills(["react", "next.js", "blockchain"])
                },
                {
                    "step": 5,
                    "title": "DeFi Protocols, Layer 2 Solutions & Mainnet Deployment",
                    "duration": "4 weeks",
                    "skills": ["DeFi", "Layer 2 (Arbitrum/Polygon)", "IPFS", "Smart Contract Auditing"],
                    "project": "Deploy a decentralized crowdfunding or automated market maker DApp to an Ethereum testnet.",
                    "resources": get_resources_for_skills(["blockchain", "solidity"])
                }
            ]
        }

    elif has_term(role_lower, ["qa", "sdet", "test automation", "automation tester", "quality assurance", "software tester"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master automated testing architectures, performance benchmarking, API validation, and CI/CD quality gates as a {role}.",
            "total_months": 5,
            "steps": [
                {
                    "step": 1,
                    "title": "Testing Fundamentals, Test Strategies & Methodologies",
                    "duration": "3-4 weeks",
                    "skills": ["Unit Testing", "Test Planning", "Bug Reporting", "Git", "Agile"],
                    "project": "Author a comprehensive test strategy, boundary value test cases, and bug reports for a live portal.",
                    "resources": get_resources_for_skills(["git", "agile"])
                },
                {
                    "step": 2,
                    "title": "Programming for Test Automation & Web Drivers",
                    "duration": "5 weeks",
                    "skills": ["Python", "JavaScript", "Selenium", "Page Object Model (POM)", "XPath"],
                    "project": "Build a clean Page Object Model test framework in Python/Selenium covering key user journeys.",
                    "resources": get_resources_for_skills(["selenium", "python", "javascript"])
                },
                {
                    "step": 3,
                    "title": "Modern Frontend Automation (Cypress / Playwright)",
                    "duration": "4 weeks",
                    "skills": ["Cypress", "Playwright", "TypeScript", "Headless Testing", "Assertions"],
                    "project": "Develop lightning-fast headless regression test suites running across Chromium, Firefox, and WebKit.",
                    "resources": get_resources_for_skills(["cypress", "typescript"])
                },
                {
                    "step": 4,
                    "title": "API Automation & Performance Load Testing",
                    "duration": "4 weeks",
                    "skills": ["Postman", "REST API", "JMeter", "Performance Testing", "Newman"],
                    "project": "Create automated Postman collections with assertions and execute 1000-user concurrent JMeter load stress tests.",
                    "resources": get_resources_for_skills(["rest api", "unit testing"])
                },
                {
                    "step": 5,
                    "title": "Continuous Testing in CI/CD Pipelines & Reporting",
                    "duration": "3 weeks",
                    "skills": ["CI/CD", "GitHub Actions", "Docker", "Test Reporting"],
                    "project": "Integrate automated smoke and regression tests into GitHub Actions triggers with HTML reporting dashboards.",
                    "resources": get_resources_for_skills(["ci/cd", "docker"])
                }
            ]
        }

    elif has_term(role_lower, ["frontend", "front-end", "react", "vue", "angular", "next.js", "web developer"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master modern component architecture, TypeScript, state management, and web performance optimization as a {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": "Modern JavaScript (ES6+), TypeScript & HTML/CSS Standards",
                    "duration": "4 weeks",
                    "skills": ["JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Git"],
                    "project": "Build an interactive responsive dashboard with vanilla TypeScript and semantic accessible markup.",
                    "resources": get_resources_for_skills(["javascript", "typescript", "git"])
                },
                {
                    "step": 2,
                    "title": "Component Frameworks (React / Vue / Next.js) & State Architecture",
                    "duration": "5 weeks",
                    "skills": ["React", "Next.js", "Redux", "Context API", "Hooks", "Component Design"],
                    "project": "Develop a multi-page interactive web app with client-side routing, modular components, and global state.",
                    "resources": get_resources_for_skills(["react", "next.js"])
                },
                {
                    "step": 3,
                    "title": "API Integration, Data Fetching & Caching",
                    "duration": "4 weeks",
                    "skills": ["REST API", "GraphQL", "React Query / TanStack", "Axios", "Error Handling"],
                    "project": "Integrate real-time third-party APIs with optimistic updates, pagination, and caching.",
                    "resources": get_resources_for_skills(["react", "graphql", "rest api"])
                },
                {
                    "step": 4,
                    "title": "Testing, Accessibility (a11y) & Core Web Vitals Optimization",
                    "duration": "4 weeks",
                    "skills": ["Jest", "Vitest", "Cypress", "Web Performance", "Lighthouse", "WCAG"],
                    "project": "Audit and achieve a 95+ Google Lighthouse score while implementing full unit and E2E test coverage.",
                    "resources": get_resources_for_skills(["cypress", "typescript"])
                },
                {
                    "step": 5,
                    "title": "Production Deployment, SSR / SSG & Portfolio Mastery",
                    "duration": "3 weeks",
                    "skills": ["Next.js", "Vercel", "CI/CD", "Docker", "Portfolio Architecture"],
                    "project": f"Architect and launch a production-grade full stack frontend application for {role} interview showcases.",
                    "resources": get_resources_for_skills(["next.js", "ci/cd"])
                }
            ]
        }

    elif has_term(role_lower, ["backend", "back-end", "python developer", "django", "fastapi", "java developer", "spring boot", "node.js developer", "golang", "go developer", "ruby", "c#", ".net"]):
        return {
            "title": f"{role} Career Roadmap",
            "description": f"Master scalable server-side architectures, database query optimization, asynchronous processing, and API design as a {role}.",
            "total_months": 6,
            "steps": [
                {
                    "step": 1,
                    "title": f"Backend Language Mastery & Data Structures ({role})",
                    "duration": "4 weeks",
                    "skills": ["Python", "Java", "Node.js", "Go", "Data Structures", "OOP", "Git"],
                    "project": "Build an algorithmic command-line service with OOP design patterns and comprehensive unit tests.",
                    "resources": get_resources_for_skills(["python", "java", "node.js", "go", "git"])
                },
                {
                    "step": 2,
                    "title": "RESTful & GraphQL API Design with Relational Databases",
                    "duration": "5 weeks",
                    "skills": ["Django", "Spring Boot", "FastAPI", "Express.js", "PostgreSQL", "SQL", "ORMs"],
                    "project": "Design and build a multi-resource REST API with JWT authentication, role permissions, and database indexing.",
                    "resources": get_resources_for_skills(["django", "spring boot", "postgresql", "sql"])
                },
                {
                    "step": 3,
                    "title": "Caching, Asynchronous Tasks & Message Brokers",
                    "duration": "5 weeks",
                    "skills": ["Redis", "Celery", "RabbitMQ", "Kafka", "WebSockets", "Background Workers"],
                    "project": "Implement real-time background task processing with Redis caching and rate-limiting middleware.",
                    "resources": get_resources_for_skills(["redis", "microservices"])
                },
                {
                    "step": 4,
                    "title": "Microservices Architecture & System Design",
                    "duration": "4 weeks",
                    "skills": ["System Design", "Microservices", "Docker", "Database Sharding", "Load Balancing"],
                    "project": "Decompose a monolithic application into event-driven containerized microservices communicating via message queues.",
                    "resources": get_resources_for_skills(["system design", "docker", "microservices"])
                },
                {
                    "step": 5,
                    "title": "Cloud Deployment, CI/CD & Production Capstone",
                    "duration": "4 weeks",
                    "skills": ["AWS", "Docker", "CI/CD", "Monitoring", "Security Best Practices"],
                    "project": f"Deploy a production-ready, highly available distributed backend service to AWS with automated CI/CD.",
                    "resources": get_resources_for_skills(["aws", "docker", "ci/cd"])
                }
            ]
        }

    # Universal Default for any other software/technical role (Backend, Frontend, Full Stack, Software Engineer, etc.)
    return {
        "title": f"{role} Career Roadmap",
        "description": f"Comprehensive, real-time step-by-step career acceleration pathway designed specifically to achieve mastery as a {role}.",
        "total_months": 6,
        "steps": [
            {
                "step": 1,
                "title": f"Core Foundations & Language Fundamentals for {role}",
                "duration": "4 weeks",
                "skills": ["Programming Fundamentals", "Data Structures", "Algorithms", "Git", "OOP"],
                "project": "Build an algorithmic command-line utility demonstrating clean modular architecture and unit tests.",
                "resources": get_resources_for_skills(["python", "javascript", "git"])
            },
            {
                "step": 2,
                "title": f"Primary Frameworks, Libraries & Modern Toolchains",
                "duration": "5 weeks",
                "skills": ["Core Frameworks", "API Integration", "State Management", "Relational Databases", "SQL"],
                "project": "Develop a multi-featured interactive web application with persistent storage and data validation.",
                "resources": get_resources_for_skills(["sql", "postgresql", "react", "django"])
            },
            {
                "step": 3,
                "title": f"Architecture, System Design & Clean Code Practices",
                "duration": "5 weeks",
                "skills": ["System Design", "Microservices", "REST API", "Caching", "Security Best Practices"],
                "project": "Design and implement a scalable distributed backend service with Redis caching and rate limiting.",
                "resources": get_resources_for_skills(["system design", "microservices", "redis"])
            },
            {
                "step": 4,
                "title": f"Cloud, Containers & Automated CI/CD Deployment",
                "duration": "4 weeks",
                "skills": ["Docker", "AWS", "CI/CD", "Linux", "Automated Testing"],
                "project": "Containerize your application and deploy it with zero-downtime automation to cloud infrastructure.",
                "resources": get_resources_for_skills(["docker", "aws", "ci/cd", "linux"])
            },
            {
                "step": 5,
                "title": f"Production Capstone Project & Technical Interview Mastery",
                "duration": "4 weeks",
                "skills": ["Full Stack Production", "Performance Tuning", "Monitoring", "Technical Communication"],
                "project": f"Architect and launch an end-to-end production capstone application tailored for {role} interview showcases.",
                "resources": get_resources_for_skills(["system design", "ci/cd"])
            }
        ]
    }


def get_career_roadmap(target_role: str, current_skills: list = None) -> dict:
    if not target_role or not target_role.strip():
        target_role = "Full Stack Developer"

    # Generate custom roadmap for target role
    roadmap = generate_dynamic_roadmap(target_role)

    # Personalize roadmap with the candidate's actual existing skills
    if current_skills:
        current_lower = [str(s).lower().strip() for s in current_skills if s]
        for step in roadmap["steps"]:
            step_skills = step.get("skills", [])
            completed = []
            remaining = []
            
            for s in step_skills:
                s_lower = s.lower().strip()
                # Check direct or partial match
                if any(s_lower == c or s_lower in c or c in s_lower for c in current_lower):
                    completed.append(s)
                else:
                    remaining.append(s)

            step["completed_skills"] = completed
            step["remaining_skills"] = remaining
            step["is_complete"] = len(remaining) == 0 and len(step_skills) > 0
    else:
        for step in roadmap["steps"]:
            step["completed_skills"] = []
            step["remaining_skills"] = step.get("skills", [])
            step["is_complete"] = False

    return roadmap
