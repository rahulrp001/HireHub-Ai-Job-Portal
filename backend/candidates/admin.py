from django.contrib import admin
from .models import CandidateProfile, Skill, CandidateSkill, Education, Experience

@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_job_title', 'years_of_experience', 'location']
    search_fields = ['user__email', 'user__first_name']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    search_fields = ['name']

@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'skill', 'proficiency']

admin.site.register(Education)
admin.site.register(Experience)
