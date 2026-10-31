from django.db import models
from users.models import User
from companies.models import Company


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        CONTRACT = 'CONTRACT', 'Contract'
        FREELANCE = 'FREELANCE', 'Freelance'

    class WorkMode(models.TextChoices):
        REMOTE = 'REMOTE', 'Remote'
        HYBRID = 'HYBRID', 'Hybrid'
        ON_SITE = 'ON_SITE', 'On Site'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PUBLISHED = 'PUBLISHED', 'Published'
        CLOSED = 'CLOSED', 'Closed'

    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='jobs')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    required_skills = models.JSONField(default=list)
    preferred_skills = models.JSONField(default=list)
    location = models.CharField(max_length=200, blank=True)
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices, default=WorkMode.ON_SITE)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    experience_min = models.PositiveIntegerField(default=0)
    experience_max = models.PositiveIntegerField(null=True, blank=True)
    education_required = models.CharField(max_length=200, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['job_type']),
            models.Index(fields=['work_mode']),
            models.Index(fields=['location']),
        ]

    def __str__(self):
        return f"{self.title} - {self.company.name if self.company else 'N/A'}"


class SavedJob(models.Model):
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'saved_jobs'
        unique_together = ['candidate', 'job']
