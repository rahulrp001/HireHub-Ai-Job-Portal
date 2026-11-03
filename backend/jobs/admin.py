from django.contrib import admin
from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'recruiter', 'job_type', 'work_mode', 'status', 'application_count', 'created_at']
    list_filter = ['status', 'job_type', 'work_mode']
    search_fields = ['title', 'company__name', 'recruiter__email']
    ordering = ['-created_at']
    list_per_page = 25
    actions = ['publish_jobs', 'close_jobs']
    readonly_fields = ['created_at', 'updated_at']

    def application_count(self, obj):
        return obj.applications.count()
    application_count.short_description = 'Applications'

    @admin.action(description='Publish selected jobs')
    def publish_jobs(self, request, queryset):
        queryset.update(status='PUBLISHED')

    @admin.action(description='Close selected jobs')
    def close_jobs(self, request, queryset):
        queryset.update(status='CLOSED')


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'created_at']
    search_fields = ['candidate__email', 'job__title']
    ordering = ['-created_at']
