import re
import io

def extract_text_from_pdf(file):
    try:
        import PyPDF2
        if hasattr(file, 'seek'):
            file.seek(0)
        reader = PyPDF2.PdfReader(file)
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t)
        return "\n".join(pages_text)
    except Exception:
        return ""

def extract_text_from_docx(file):
    try:
        from docx import Document
        if hasattr(file, 'seek'):
            file.seek(0)
        doc = Document(file)
        lines = []
        # Paragraphs
        for p in doc.paragraphs:
            if p.text and p.text.strip():
                lines.append(p.text.strip())
        # Tables (common in resume headers/layouts)
        for table in doc.tables:
            for row in table.rows:
                row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_texts:
                    lines.append(" | ".join(row_texts))
        return "\n".join(lines)
    except Exception:
        return ""

def extract_text_from_txt(file):
    try:
        if hasattr(file, 'seek'):
            file.seek(0)
        content = file.read()
        if isinstance(content, bytes):
            return content.decode('utf-8', errors='ignore')
        return str(content)
    except Exception:
        return ""

def extract_email(text):
    if not text:
        return ""
    match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', text)
    return match.group(0).strip(' .,;:)') if match else ""

def extract_phone(text):
    if not text:
        return ""
    # 1. Look for explicit keyword labels: Phone: ..., Mob: ..., No: ...
    keyword_pat = r'(?:phone|mobile|mob|contact|tel(?:ephone)?|whatsapp|cell|call|no\.?)\s*(?:no\.?|number)?\s*[:\-=]?\s*(\+?[\d\s\-\(\)]{8,20}\d)'
    m = re.search(keyword_pat, text, re.IGNORECASE)
    if m:
        num = m.group(1).strip(' -.,')
        digits = re.sub(r'\D', '', num)
        if 8 <= len(digits) <= 15:
            return num

    # 2. Standard Indian Mobile (+91 or 0 or plain 10 digits starting with 6-9)
    ind_pat = r'(?:(?:\+91|91|0)[\s\-]?)?([6-9]\d{4}[\s\-]?\d{5}|[6-9]\d{9})'
    m2 = re.search(ind_pat, text)
    if m2:
        return m2.group(0).strip(' -.,')

    # 3. Standard international / generic phone format
    gen_pat = r'(\+?\d{1,3}[\s\-]?)?\(?\d{3,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}'
    m3 = re.search(gen_pat, text)
    if m3:
        digits = re.sub(r'\D', '', m3.group(0))
        if 8 <= len(digits) <= 15:
            return m3.group(0).strip(' -.,')

    return ""

def extract_name(text):
    if not text:
        return ""
    # 1. Explicit 'Name: ...'
    m = re.search(r'(?:full\s*name|candidate\s*name|applicant\s*name|my\s*name\s*is|name)\s*[:\-=]\s*([A-Za-z\.\'\s]{2,40})', text, re.IGNORECASE)
    if m:
        name = m.group(1).split('\n')[0].strip(' ,-.:|')
        words = name.split()
        if 1 <= len(words) <= 4 and not re.search(r'(?:phone|email|skills|experience|education|mobile|contact)', name, re.IGNORECASE):
            return name

    # 2. Line by line from the top
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    skip_headers = {
        'resume', 'curriculum vitae', 'cv', 'biodata', 'bio-data', 'bio data',
        'profile', 'personal details', 'contact', 'contact details', 'about me',
        'personal profile', 'applicant'
    }
    
    for raw_line in lines[:8]:
        line = raw_line.strip()
        # Cut off email, phone or symbols like |, -, ,
        line_clean = re.split(r'[:|,\(\)]|[\d\+]{5,}|@', line)[0].strip(' -.:|')
        lower = line_clean.lower()
        if lower in skip_headers or not line_clean:
            continue
        
        words = line_clean.split()
        if 1 <= len(words) <= 4 and re.match(r'^[A-Za-z\.\'\s]+$', line_clean):
            if not any(k in lower for k in ['education', 'experience', 'skills', 'objective', 'summary', 'address', 'phone', 'email', 'mobile', 'projects', 'declaration', 'qualification']):
                return line_clean

    return ""

COMMON_SKILLS = [
    # Programming & Tech
    "python", "django", "flask", "fastapi", "javascript", "typescript", "react", "vue", "angular",
    "node.js", "nodejs", "express", "java", "spring", "kotlin", "swift", "c++", "c#", "go", "rust",
    "php", "laravel", "ruby", "rails", "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible", "linux", "git", "github",
    "rest api", "graphql", "html", "css", "tailwind", "bootstrap", "machine learning", "deep learning",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "data analysis", "power bi", "tableau",
    "figma", "photoshop", "agile", "scrum", "jira", "ci/cd", "jenkins", "nginx", "celery", "rabbitmq",
    # Universal, Office, Business & Communication
    "ms excel", "excel", "ms word", "word", "ms office", "powerpoint", "data entry", "tally", "accounting",
    "sales", "marketing", "customer support", "customer service", "communication", "teamwork",
    "leadership", "management", "time management", "problem solving", "english", "hindi",
    "content writing", "graphic design", "seo", "computer operator", "typing"
]

def extract_skills(text):
    if not text:
        return []
    text_lower = text.lower()
    found_map = {}

    # 1. Match from COMMON_SKILLS using word boundaries
    for skill in COMMON_SKILLS:
        pattern = r'(?:\b|_)' + re.escape(skill) + r'(?:\b|_)'
        if re.search(pattern, text_lower):
            label = skill.upper() if skill in ['html', 'css', 'sql', 'aws', 'gcp', 'seo', 'php', 'jira'] else skill.title()
            found_map[skill.lower()] = label

    # 2. Dynamic extraction from 'Skills: ...' lines
    skills_headers = re.findall(
        r'(?:skills|technical\s*skills|key\s*skills|core\s*competencies|expertise)\s*[:\-]\s*([^\n\r]+)',
        text, re.IGNORECASE
    )
    for line in skills_headers:
        items = re.split(r'[,|•·\/\t;]', line)
        for item in items:
            cleaned = item.strip(' -*•\t.')
            if 2 <= len(cleaned) <= 35 and not any(k in cleaned.lower() for k in ['experience', 'education', 'hobbies', 'declaration', 'phone', 'email', 'contact']):
                label = cleaned.upper() if len(cleaned) <= 4 and cleaned.isupper() else cleaned.title()
                found_map[cleaned.lower()] = label

    return sorted(list(found_map.values()))

def extract_education(text):
    if not text:
        return []
    degrees = [
        'b.tech', 'btech', 'b.e', 'bca', 'mca', 'm.tech', 'mtech', 'b.sc', 'bsc', 'm.sc', 'msc',
        'b.com', 'bcom', 'm.com', 'mcom', 'b.a', 'ba', 'm.a', 'ma', 'mba', 'bba',
        'diploma', '12th', '10th', 'high school', 'intermediate', 'matriculation', 'ph.d', 'phd'
    ]
    found = []
    lines = text.split('\n')
    for line in lines:
        line_lower = line.lower()
        for deg in degrees:
            pattern = r'\b' + re.escape(deg) + r'\b'
            if re.search(pattern, line_lower):
                cleaned = line.strip(' -*•\t|')
                if 3 <= len(cleaned) <= 80 and cleaned not in found:
                    found.append(cleaned)
                break
    return found[:5]

def extract_experience(text):
    if not text:
        return []
    found = []
    exp_matches = re.findall(r'(\b\d+(?:\.\d+)?\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)?\b)', text, re.IGNORECASE)
    for m in exp_matches:
        c = m.strip()
        if c not in found:
            found.append(c)
    if re.search(r'\bfresher\b', text, re.IGNORECASE):
        if 'Fresher' not in found:
            found.append('Fresher')
    return found[:3]

def parse_resume(file, filename):
    filename_lower = filename.lower()
    if filename_lower.endswith('.pdf'):
        text = extract_text_from_pdf(file)
    elif filename_lower.endswith('.docx') or filename_lower.endswith('.doc'):
        text = extract_text_from_docx(file)
    elif filename_lower.endswith('.txt'):
        text = extract_text_from_txt(file)
    else:
        # Fallback: attempt to read as plain text
        text = extract_text_from_txt(file)
        if not text:
            return {"error": "Unsupported file format"}

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "raw_text": text[:5000]
    }
