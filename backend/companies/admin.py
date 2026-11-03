from django.contrib import admin
from .models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'recruiter', 'industry', 'location', 'company_size', 'job_count', 'created_at']
    search_fields = ['name', 'recruiter__email', 'industry']
    list_filter = ['industry']
    readonly_fields = ['created_at']

    def job_count(self, obj):
        return obj.jobs.count()
    job_count.short_description = 'Jobs'
