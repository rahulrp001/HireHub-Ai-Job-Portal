from rest_framework import serializers
from .models import CandidateProfile, CandidateSkill, Skill, Education, Experience


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), source='skill', write_only=True)

    class Meta:
        model = CandidateSkill
        fields = ['id', 'skill', 'skill_id', 'proficiency', 'years_of_experience']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'field_of_study', 'start_date', 'end_date', 'grade', 'description']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'company', 'job_title', 'location', 'start_date', 'end_date', 'currently_working', 'description']


class CandidateProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    user_name = serializers.ReadOnlyField(source='user.full_name')
    profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)
    candidate_skills = CandidateSkillSerializer(many=True, read_only=True)
    education = EducationSerializer(many=True, read_only=True)
    experience = ExperienceSerializer(many=True, read_only=True)
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = CandidateProfile
        fields = ['id', 'user_email', 'user_name', 'profile_picture', 'headline', 'bio', 'location',
                  'date_of_birth', 'portfolio_url', 'linkedin_url', 'github_url', 'current_job_title',
                  'years_of_experience', 'expected_salary', 'availability', 'completion_percentage',
                  'candidate_skills', 'education', 'experience', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
