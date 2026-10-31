INTERVIEW_QUESTION_BANK = {
    "python": {
        "technical": [
            "What is the difference between a list and a tuple in Python?",
            "Explain Python's GIL (Global Interpreter Lock).",
            "What are decorators in Python? Write a simple example.",
            "Explain the difference between *args and **kwargs.",
            "What is a generator in Python and when would you use it?",
            "How does Python's memory management work?",
            "What is the difference between deepcopy and shallow copy?",
            "Explain list comprehensions vs generator expressions.",
            "What are Python's dunder/magic methods?",
            "How do you handle exceptions in Python?",
        ],
        "practical": [
            "Write a function to find the second largest element in a list.",
            "Implement a decorator that logs function execution time.",
            "Write a Python script to read a CSV file and find duplicates.",
            "Implement a simple LRU cache using Python.",
            "Write a function to flatten a nested list.",
        ]
    },
    "javascript": {
        "technical": [
            "What is the difference between var, let, and const?",
            "Explain event bubbling and event capturing.",
            "What is a closure in JavaScript?",
            "Explain the difference between == and ===.",
            "What is the event loop in JavaScript?",
            "What are Promises and async/await?",
            "Explain prototypal inheritance in JavaScript.",
            "What is the difference between null and undefined?",
            "What are arrow functions and how do they differ from regular functions?",
            "Explain hoisting in JavaScript.",
        ],
        "practical": [
            "Write a debounce function.",
            "Implement a deep clone function without using JSON.parse/stringify.",
            "Write a function to flatten a nested array.",
            "Implement Promise.all from scratch.",
            "Write a function to group an array of objects by a key.",
        ]
    },
    "react": {
        "technical": [
            "What is the difference between state and props?",
            "Explain the React component lifecycle.",
            "What are React hooks? Name and explain 5 hooks.",
            "What is the virtual DOM and how does React use it?",
            "Explain the difference between controlled and uncontrolled components.",
            "What is React Context and when should you use it?",
            "What is useCallback and useMemo? When to use them?",
            "Explain React's reconciliation algorithm.",
            "What are Higher Order Components (HOC)?",
            "How does React handle forms?",
        ],
        "practical": [
            "Build a counter component with increment, decrement, and reset.",
            "Create a custom hook for fetching data from an API.",
            "Implement a debounced search input component.",
            "Build a simple todo list with add and delete functionality.",
            "Create a component that renders a list with pagination.",
        ]
    },
    "django": {
        "technical": [
            "What is Django's ORM and how does it work?",
            "Explain Django's MVT architecture.",
            "What are Django signals and when would you use them?",
            "What is the difference between select_related and prefetch_related?",
            "How does Django handle authentication and authorization?",
            "What are Django middleware and how do they work?",
            "Explain Django REST Framework serializers.",
            "What is the difference between ForeignKey and ManyToManyField?",
            "How do you optimize database queries in Django?",
            "What are Django migrations and how do they work?",
        ],
        "practical": [
            "Create a Django model for a blog with posts and comments.",
            "Write a DRF serializer with custom validation.",
            "Implement a custom Django middleware for request logging.",
            "Write a Django management command to import data from CSV.",
            "Create a Django view with pagination and filtering.",
        ]
    },
    "sql": {
        "technical": [
            "What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN?",
            "Explain database normalization (1NF, 2NF, 3NF).",
            "What are indexes and when should you use them?",
            "What is the difference between WHERE and HAVING?",
            "Explain ACID properties in databases.",
            "What are window functions in SQL?",
            "What is the difference between DELETE, TRUNCATE, and DROP?",
            "Explain database transactions.",
            "What are stored procedures and triggers?",
            "How do you optimize a slow SQL query?",
        ],
        "practical": [
            "Write a query to find the second highest salary in an employees table.",
            "Write a query to find duplicate records in a table.",
            "Write a query to get the top 3 products by sales in each category.",
            "Write a query to find employees who earn more than their manager.",
            "Write a query to calculate a running total using window functions.",
        ]
    },
    "docker": {
        "technical": [
            "What is Docker and how is it different from a virtual machine?",
            "Explain the difference between a Docker image and a container.",
            "What is a Dockerfile and what are its key instructions?",
            "What is Docker Compose and when would you use it?",
            "Explain Docker networking modes.",
            "What are Docker volumes and why are they important?",
            "What is a multi-stage Docker build?",
            "How do you reduce Docker image size?",
            "What is the difference between CMD and ENTRYPOINT?",
            "How do you handle secrets in Docker?",
        ],
        "practical": [
            "Write a Dockerfile for a Python Flask application.",
            "Write a docker-compose.yml for a web app with a database.",
            "How would you debug a running Docker container?",
            "How do you push a Docker image to Docker Hub?",
            "Explain how you would set up a CI/CD pipeline with Docker.",
        ]
    },
    "aws": {
        "technical": [
            "What is the difference between EC2, ECS, and Lambda?",
            "Explain S3 storage classes.",
            "What is VPC and why is it important?",
            "What is the difference between RDS and DynamoDB?",
            "Explain AWS IAM roles and policies.",
            "What is CloudFront and when would you use it?",
            "What is Auto Scaling and how does it work?",
            "Explain the difference between SQS and SNS.",
            "What is AWS CloudFormation?",
            "How do you secure an S3 bucket?",
        ],
        "practical": [
            "How would you host a static website on AWS?",
            "Design a highly available web application architecture on AWS.",
            "How would you set up a CI/CD pipeline using AWS services?",
            "How do you monitor an application on AWS?",
            "How would you migrate an on-premise database to AWS RDS?",
        ]
    },
    "machine learning": {
        "technical": [
            "What is the difference between supervised and unsupervised learning?",
            "Explain overfitting and how to prevent it.",
            "What is cross-validation and why is it important?",
            "Explain the bias-variance tradeoff.",
            "What is gradient descent and its variants?",
            "What is the difference between L1 and L2 regularization?",
            "Explain how a Random Forest works.",
            "What is the difference between precision and recall?",
            "What is a confusion matrix?",
            "Explain the concept of feature engineering.",
        ],
        "practical": [
            "How would you handle imbalanced datasets?",
            "Walk me through your process for building an ML model from scratch.",
            "How do you choose between different ML algorithms?",
            "How would you deploy an ML model to production?",
            "How do you handle missing data in a dataset?",
        ]
    }
}

HR_QUESTIONS = [
    "Tell me about yourself.",
    "Why do you want to work at our company?",
    "What are your greatest strengths?",
    "What is your biggest weakness?",
    "Where do you see yourself in 5 years?",
    "Why are you leaving your current job?",
    "Describe a challenging situation and how you handled it.",
    "How do you handle pressure and tight deadlines?",
    "What motivates you?",
    "Do you prefer working alone or in a team?",
    "Tell me about a time you failed and what you learned.",
    "What are your salary expectations?",
    "Do you have any questions for us?",
]


def get_interview_questions(job_title: str, required_skills: list) -> dict:
    import random

    questions = {"technical": [], "practical": [], "hr": []}

    # Get questions based on skills
    for skill in required_skills:
        skill_lower = skill.lower()
        for key, bank in INTERVIEW_QUESTION_BANK.items():
            if key in skill_lower or skill_lower in key:
                questions["technical"].extend(bank.get("technical", [])[:3])
                questions["practical"].extend(bank.get("practical", [])[:2])
                break

    # Deduplicate
    questions["technical"] = list(dict.fromkeys(questions["technical"]))[:10]
    questions["practical"] = list(dict.fromkeys(questions["practical"]))[:5]

    # Add HR questions
    questions["hr"] = random.sample(HR_QUESTIONS, min(5, len(HR_QUESTIONS)))

    # If no skill-specific questions found, add generic ones
    if not questions["technical"]:
        questions["technical"] = [
            f"Tell me about your experience with {skill}." for skill in required_skills[:5]
        ] + [
            "Describe a complex technical problem you solved.",
            "How do you stay updated with new technologies?",
            "Explain your approach to debugging a production issue.",
        ]

    return questions
