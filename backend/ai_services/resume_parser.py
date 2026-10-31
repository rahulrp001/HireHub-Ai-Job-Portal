import re
import io

def extract_text_from_pdf(file):
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(file)
        return " ".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""

def extract_text_from_docx(file):
    try:
        from docx import Document
        doc = Document(file)
        return " ".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""

def extract_phone(text):
    match = re.search(r'(\+?\d[\d\s\-\(\)]{8,15}\d)', text)
    return match.group(0).strip() if match else ""

def extract_name(text):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        if len(line.split()) in [2, 3] and line.replace(' ', '').isalpha():
            return line
    return ""

COMMON_SKILLS = [
    "python", "django", "flask", "fastapi", "javascript", "typescript", "react", "vue", "angular",
    "node.js", "nodejs", "express", "java", "spring", "kotlin", "swift", "c++", "c#", "go", "rust",
    "php", "laravel", "ruby", "rails", "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "linux", "git", "github",
    "rest api", "graphql", "html", "css", "tailwind", "bootstrap", "machine learning", "deep learning",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "data analysis", "power bi", "tableau",
    "figma", "photoshop", "agile", "scrum", "jira", "ci/cd", "jenkins", "nginx", "celery", "rabbitmq"
]

def extract_skills(text):
    text_lower = text.lower()
    return [skill for skill in COMMON_SKILLS if skill in text_lower]

def parse_resume(file, filename):
    filename_lower = filename.lower()
    if filename_lower.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    elif filename_lower.endswith('.docx'):
        text = extract_text_from_docx(file)
    else:
        return {"error": "Unsupported file format"}

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": [],
        "experience": [],
        "raw_text": text[:5000]
    }
