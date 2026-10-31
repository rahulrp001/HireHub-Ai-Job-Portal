from django.db import models
from users.models import User


class Resume(models.Model):
    class ParsingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    original_filename = models.CharField(max_length=255)
    parsed_text = models.TextField(blank=True)
    extracted_name = models.CharField(max_length=200, blank=True)
    extracted_email = models.EmailField(blank=True)
    extracted_phone = models.CharField(max_length=50, blank=True)
    extracted_skills = models.JSONField(default=list)
    extracted_education = models.JSONField(default=list)
    extracted_experience = models.JSONField(default=list)
    parsing_status = models.CharField(max_length=20, choices=ParsingStatus.choices, default=ParsingStatus.PENDING)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'resumes'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.candidate.full_name} - {self.original_filename}"
