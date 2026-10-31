def analyze_skill_gap(user, job):
    try:
        from candidates.models import CandidateProfile
        profile = CandidateProfile.objects.prefetch_related('candidate_skills__skill').get(user=user)
        candidate_skills = set(cs.skill.name.lower() for cs in profile.candidate_skills.all())
    except Exception:
        candidate_skills = set()

    required_skills = set(s.lower() for s in (job.required_skills or []))
    matched = list(candidate_skills & required_skills)
    missing = list(required_skills - candidate_skills)
    match_pct = round((len(matched) / len(required_skills)) * 100) if required_skills else 100

    recommendations = [f"Learn {s.title()} to improve your chances" for s in missing[:5]]

    return {
        "required_skills": list(required_skills),
        "matched_skills": matched,
        "missing_skills": missing,
        "match_percentage": match_pct,
        "recommendations": recommendations
    }


def get_recommended_jobs(user, limit=10):
    try:
        from candidates.models import CandidateProfile
        from jobs.models import Job
        from ai_services.job_matcher import calculate_job_match

        profile = CandidateProfile.objects.prefetch_related('candidate_skills__skill').get(user=user)
        candidate_skills = set(cs.skill.name.lower() for cs in profile.candidate_skills.all())

        jobs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related('company')[:50]
        scored = []
        for job in jobs:
            required = set(s.lower() for s in (job.required_skills or []))
            if not required:
                continue
            score = len(candidate_skills & required) / len(required) * 100
            scored.append((job, round(score)))

        scored.sort(key=lambda x: x[1], reverse=True)
        return [{"job": j, "score": s} for j, s in scored[:limit]]
    except Exception:
        return []
