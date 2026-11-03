from rest_framework import serializers
from .models import JobApplication
from jobs.serializers import JobSerializer
from users.serializers import UserSerializer


class JobApplicationSerializer(serializers.ModelSerializer):
    job_detail = JobSerializer(source='job', read_only=True)
    candidate_detail = UserSerializer(source='candidate', read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate', 'candidate_detail', 'job', 'job_detail', 'resume',
            'cover_letter', 'status', 'ai_match_score', 'recruiter_score',
            'interview_date', 'interview_mode', 'interview_location',
            'interview_round', 'interview_notes',
            'skills', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'candidate', 'status', 'ai_match_score', 'applied_at', 'updated_at']

    def get_skills(self, obj):
        try:
            profile = obj.candidate.candidate_profile
            return [cs.skill.name for cs in profile.candidate_skills.select_related('skill').all()[:5]]
        except Exception:
            return []


class ApplicationStatusSerializer(serializers.ModelSerializer):
    send_email = serializers.BooleanField(write_only=True, required=False, default=True)

    class Meta:
        model = JobApplication
        fields = [
            'status', 'recruiter_score',
            'interview_date', 'interview_mode', 'interview_location',
            'interview_round', 'interview_notes', 'send_email'
        ]
