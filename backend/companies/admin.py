from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'recruiter', 'industry', 'location', 'created_at']
    search_fields = ['name', 'recruiter__email']
