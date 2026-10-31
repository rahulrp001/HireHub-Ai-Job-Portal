from django.db import models
from users.models import User


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'skills'
        ordering = ['name']

    def __str__(self):
        return self.name


class CandidateProfile(models.Model):
    class Availability(models.TextChoices):
        IMMEDIATE = 'IMMEDIATE', 'Immediate'
        TWO_WEEKS = 'TWO_WEEKS', '2 Weeks'
        ONE_MONTH = 'ONE_MONTH', '1 Month'
        NOT_LOOKING = 'NOT_LOOKING', 'Not Looking'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    current_job_title = models.CharField(max_length=200, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    expected_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability = models.CharField(max_length=20, choices=Availability.choices, default=Availability.IMMEDIATE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'candidate_profiles'

    def __str__(self):
        return f"{self.user.full_name} - Profile"

    @property
    def completion_percentage(self):
        fields = [self.headline, self.bio, self.location, self.current_job_title,
                  self.linkedin_url, self.github_url, self.portfolio_url]
        filled = sum(1 for f in fields if f)
        has_skills = self.candidate_skills.exists()
        has_education = self.education.exists()
        has_experience = self.experience.exists()
        total = len(fields) + 3
        filled += sum([has_skills, has_education, has_experience])
        return round((filled / total) * 100)


class CandidateSkill(models.Model):
    class Proficiency(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'
        EXPERT = 'EXPERT', 'Expert'

    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='candidate_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices, default=Proficiency.INTERMEDIATE)
    years_of_experience = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'candidate_skills'
        unique_together = ['candidate', 'skill']

    def __str__(self):
        return f"{self.candidate.user.full_name} - {self.skill.name}"


class Education(models.Model):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='education')
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    grade = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'education'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Experience(models.Model):
    candidate = models.ForeignKey(CandidateProfile, on_delete=models.CASCADE, related_name='experience')
    company = models.CharField(max_length=255)
    job_title = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    currently_working = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        db_table = 'experience'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.job_title} at {self.company}"
