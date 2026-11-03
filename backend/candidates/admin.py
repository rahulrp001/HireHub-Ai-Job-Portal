from django.contrib import admin
from .models import CandidateProfile, Skill, CandidateSkill, Education, Experience


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class ExperienceInline(admin.TabularInline):
    model = Experience
    extra = 0


class CandidateSkillInline(admin.TabularInline):
    model = CandidateSkill
    extra = 0


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_job_title', 'years_of_experience', 'location', 'availability', 'completion_percentage']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    list_filter = ['availability']
    inlines = [CandidateSkillInline, EducationInline, ExperienceInline]
    readonly_fields = ['created_at', 'updated_at']

    def completion_percentage(self, obj):
        return f"{obj.completion_percentage}%"
    completion_percentage.short_description = 'Profile %'


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    search_fields = ['name', 'category']
    list_filter = ['category']


@admin.register(CandidateSkill)
class CandidateSkillAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'skill', 'proficiency', 'years_of_experience']
    list_filter = ['proficiency']
    search_fields = ['candidate__user__email', 'skill__name']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'degree', 'institution', 'field_of_study', 'start_date', 'end_date']
    search_fields = ['candidate__user__email', 'institution', 'degree']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job_title', 'company', 'start_date', 'end_date', 'currently_working']
    list_filter = ['currently_working']
    search_fields = ['candidate__user__email', 'company', 'job_title']
