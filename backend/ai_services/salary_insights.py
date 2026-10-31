SALARY_DATA = {
    "software engineer": {"fresher": (300000, 800000), "junior": (600000, 1500000), "mid": (1200000, 2500000), "senior": (2000000, 5000000)},
    "frontend developer": {"fresher": (300000, 700000), "junior": (600000, 1400000), "mid": (1000000, 2200000), "senior": (1800000, 4000000)},
    "backend developer": {"fresher": (350000, 800000), "junior": (700000, 1500000), "mid": (1200000, 2500000), "senior": (2000000, 4500000)},
    "full stack developer": {"fresher": (400000, 900000), "junior": (700000, 1600000), "mid": (1300000, 2800000), "senior": (2200000, 5000000)},
    "data scientist": {"fresher": (500000, 1000000), "junior": (800000, 1800000), "mid": (1500000, 3000000), "senior": (2500000, 6000000)},
    "data analyst": {"fresher": (300000, 700000), "junior": (600000, 1200000), "mid": (1000000, 2000000), "senior": (1800000, 3500000)},
    "machine learning engineer": {"fresher": (600000, 1200000), "junior": (1000000, 2000000), "mid": (1800000, 3500000), "senior": (3000000, 7000000)},
    "devops engineer": {"fresher": (400000, 900000), "junior": (800000, 1600000), "mid": (1400000, 2800000), "senior": (2200000, 5000000)},
    "cloud engineer": {"fresher": (400000, 900000), "junior": (800000, 1700000), "mid": (1500000, 3000000), "senior": (2500000, 5500000)},
    "mobile developer": {"fresher": (350000, 800000), "junior": (700000, 1500000), "mid": (1200000, 2500000), "senior": (2000000, 4500000)},
    "ui ux designer": {"fresher": (250000, 600000), "junior": (500000, 1200000), "mid": (1000000, 2000000), "senior": (1800000, 3500000)},
    "product manager": {"fresher": (500000, 1000000), "junior": (900000, 1800000), "mid": (1500000, 3500000), "senior": (3000000, 8000000)},
    "qa engineer": {"fresher": (250000, 600000), "junior": (500000, 1100000), "mid": (900000, 1800000), "senior": (1500000, 3000000)},
    "cybersecurity engineer": {"fresher": (400000, 900000), "junior": (800000, 1600000), "mid": (1400000, 2800000), "senior": (2500000, 5500000)},
    "blockchain developer": {"fresher": (500000, 1000000), "junior": (900000, 2000000), "mid": (1800000, 4000000), "senior": (3500000, 8000000)},
}

LOCATION_MULTIPLIERS = {
    "bangalore": 1.2, "mumbai": 1.15, "delhi": 1.1, "hyderabad": 1.1,
    "pune": 1.0, "chennai": 1.0, "gurgaon": 1.1, "noida": 1.05,
    "remote": 1.0, "other": 0.85,
}

SKILL_PREMIUM = {
    "kubernetes": 0.15, "aws": 0.12, "azure": 0.10, "gcp": 0.10,
    "machine learning": 0.20, "deep learning": 0.25, "llm": 0.30,
    "blockchain": 0.20, "rust": 0.15, "golang": 0.12,
    "react": 0.08, "typescript": 0.08, "docker": 0.08,
}


def get_experience_level(years: int) -> str:
    if years <= 1:
        return "fresher"
    elif years <= 3:
        return "junior"
    elif years <= 6:
        return "mid"
    else:
        return "senior"


def get_salary_insights(role: str, years_experience: int, location: str = "other", skills: list = None) -> dict:
    role_lower = role.lower().strip()
    location_lower = location.lower().strip()

    # Find matching role
    matched_role = None
    for key in SALARY_DATA:
        if key in role_lower or role_lower in key or any(word in role_lower for word in key.split()):
            matched_role = key
            break

    if not matched_role:
        matched_role = "software engineer"

    exp_level = get_experience_level(years_experience)
    base_min, base_max = SALARY_DATA[matched_role][exp_level]

    # Apply location multiplier
    loc_multiplier = LOCATION_MULTIPLIERS.get(location_lower, LOCATION_MULTIPLIERS["other"])
    adj_min = int(base_min * loc_multiplier)
    adj_max = int(base_max * loc_multiplier)

    # Apply skill premiums
    skill_bonus = 0
    premium_skills = []
    if skills:
        for skill in skills:
            skill_lower = skill.lower()
            for premium_skill, bonus in SKILL_PREMIUM.items():
                if premium_skill in skill_lower:
                    skill_bonus = max(skill_bonus, bonus)
                    premium_skills.append(skill)

    final_min = int(adj_min * (1 + skill_bonus))
    final_max = int(adj_max * (1 + skill_bonus))

    # All levels for comparison chart
    all_levels = {}
    for level, (lmin, lmax) in SALARY_DATA[matched_role].items():
        all_levels[level] = {
            "min": int(lmin * loc_multiplier),
            "max": int(lmax * loc_multiplier),
            "avg": int((lmin + lmax) / 2 * loc_multiplier),
        }

    return {
        "role": matched_role.title(),
        "experience_level": exp_level,
        "location": location,
        "salary_min": final_min,
        "salary_max": final_max,
        "salary_avg": (final_min + final_max) // 2,
        "premium_skills": premium_skills,
        "skill_bonus_pct": int(skill_bonus * 100),
        "all_levels": all_levels,
        "currency": "INR",
        "note": "Salary ranges are approximate and based on Indian market data (2024)."
    }
