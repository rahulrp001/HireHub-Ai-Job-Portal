from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'file', 'original_filename', 'extracted_name', 'extracted_email',
                  'extracted_phone', 'extracted_skills', 'extracted_education',
                  'extracted_experience', 'parsing_status', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at', 'parsing_status', 'extracted_name',
                            'extracted_email', 'extracted_phone', 'extracted_skills',
                            'extracted_education', 'extracted_experience', 'original_filename']
