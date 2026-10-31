from django.db import models
from users.models import User


class Notification(models.Model):
    class Type(models.TextChoices):
        APPLICATION = 'APPLICATION', 'Application'
        STATUS_CHANGE = 'STATUS_CHANGE', 'Status Change'
        MESSAGE = 'MESSAGE', 'Message'
        JOB_RECOMMENDATION = 'JOB_RECOMMENDATION', 'Job Recommendation'
        GENERAL = 'GENERAL', 'General'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=Type.choices, default=Type.GENERAL)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.title}"
