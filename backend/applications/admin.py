from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'status', 'ai_match_score', 'applied_at']
    list_filter = ['status']
    search_fields = ['candidate__email', 'job__title']
    ordering = ['-applied_at']
