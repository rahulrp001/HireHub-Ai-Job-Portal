from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    recruiter_name = serializers.ReadOnlyField(source='recruiter.full_name')

    class Meta:
        model = Company
        fields = ['id', 'recruiter_name', 'name', 'logo', 'description', 'website',
                  'industry', 'company_size', 'location', 'founded_year', 'created_at']
        read_only_fields = ['id', 'created_at']
