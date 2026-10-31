def calculate_job_match(user, job):
    try:
        from candidates.models import CandidateProfile
        profile = CandidateProfile.objects.prefetch_related('candidate_skills__skill').get(user=user)
        candidate_skills = set(cs.skill.name.lower() for cs in profile.candidate_skills.all())
    except Exception:
        candidate_skills = set()

    required_skills = set(s.lower() for s in (job.required_skills or []))
    preferred_skills = set(s.lower() for s in (job.preferred_skills or []))

    # Skills score
    if required_skills:
        matched_required = candidate_skills & required_skills
        skill_score = (len(matched_required) / len(required_skills)) * 100
    else:
        matched_required = set()
        skill_score = 50

    # Experience score
    try:
        candidate_exp = profile.years_of_experience
        exp_min = job.experience_min or 0
        exp_max = job.experience_max or exp_min + 5
        if candidate_exp >= exp_min:
            exp_score = min(100, ((candidate_exp - exp_min) / max(exp_max - exp_min, 1)) * 100 + 60)
        else:
            exp_score = max(0, (candidate_exp / max(exp_min, 1)) * 60)
    except Exception:
        exp_score = 50

    missing_skills = list(required_skills - candidate_skills)
    matched_skills = list(matched_required)

    overall = round((skill_score * 0.6) + (exp_score * 0.4))

    return {
        "overall_score": overall,
        "skill_score": round(skill_score),
        "experience_score": round(exp_score),
        "education_score": 70,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "explanation": f"{len(matched_skills)}/{len(required_skills)} required skills matched"
    }
