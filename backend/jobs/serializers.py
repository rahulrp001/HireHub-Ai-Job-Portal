from rest_framework import serializers
from .models import Job, SavedJob
from companies.serializers import CompanySerializer


class JobSerializer(serializers.ModelSerializer):
    company_detail = CompanySerializer(source='company', read_only=True)
    recruiter_name = serializers.ReadOnlyField(source='recruiter.full_name')
    is_saved = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = ['id', 'recruiter_name', 'company', 'company_detail', 'title', 'description',
                  'requirements', 'responsibilities', 'required_skills', 'preferred_skills',
                  'location', 'job_type', 'work_mode', 'salary_min', 'salary_max',
                  'experience_min', 'experience_max', 'education_required', 'application_deadline',
                  'status', 'is_saved', 'applications_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(candidate=request.user, job=obj).exists()
        return False

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ['title', 'description', 'requirements', 'responsibilities', 'required_skills',
                  'preferred_skills', 'location', 'job_type', 'work_mode', 'salary_min', 'salary_max',
                  'experience_min', 'experience_max', 'education_required', 'application_deadline', 'status']
