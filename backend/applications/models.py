from django.db import models
from users.models import User
from jobs.models import Job


class JobApplication(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'APPLIED', 'Applied'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW = 'INTERVIEW', 'Interview'
        SELECTED = 'SELECTED', 'Selected'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    class InterviewMode(models.TextChoices):
        VIRTUAL = 'VIRTUAL', 'Virtual (Online Video Call)'
        OFFLINE = 'OFFLINE', 'Offline (In-Person / Office)'

    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey('resumes.Resume', on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='applications')
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    ai_match_score = models.FloatField(null=True, blank=True)
    recruiter_score = models.FloatField(null=True, blank=True)

    # Interview Scheduling & Location Details
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_mode = models.CharField(
        max_length=20,
        choices=InterviewMode.choices,
        default=InterviewMode.VIRTUAL,
        blank=True
    )
    interview_location = models.TextField(
        blank=True,
        default='',
        help_text='Meeting URL for virtual or Office address for offline'
    )
    interview_round = models.CharField(max_length=120, blank=True, default='')
    interview_notes = models.TextField(blank=True, default='')

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_applications'
        unique_together = ['candidate', 'job']
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.candidate.full_name} → {self.job.title}"
