from django.contrib import admin
from .models import Job, SavedJob

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'work_mode', 'status', 'created_at']
    list_filter = ['status', 'job_type', 'work_mode']
    search_fields = ['title', 'company__name']
    ordering = ['-created_at']

@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'created_at']
