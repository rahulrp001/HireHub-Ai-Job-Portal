from django.contrib import admin
from .models import Resume

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'original_filename', 'parsing_status', 'uploaded_at']
    list_filter = ['parsing_status']
    search_fields = ['candidate__email', 'original_filename']
