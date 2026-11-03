from django.contrib import admin
from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job', 'status', 'ai_match_score', 'applied_at']
    list_filter = ['status']
    search_fields = ['candidate__email', 'candidate__first_name', 'job__title']
    ordering = ['-applied_at']
    list_per_page = 25
    readonly_fields = ['applied_at', 'updated_at']
    actions = ['shortlist', 'reject', 'mark_interview']

    @admin.action(description='Shortlist selected applications')
    def shortlist(self, request, queryset):
        queryset.update(status='SHORTLISTED')

    @admin.action(description='Reject selected applications')
    def reject(self, request, queryset):
        queryset.update(status='REJECTED')

    @admin.action(description='Mark as Interview')
    def mark_interview(self, request, queryset):
        queryset.update(status='INTERVIEW')
