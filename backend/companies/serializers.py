from rest_framework import serializers
from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    recruiter_name = serializers.ReadOnlyField(source='recruiter.full_name')
    name = serializers.CharField(required=False, allow_blank=True, default='')
    founded_year = serializers.IntegerField(required=False, allow_null=True)
    website = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Company
        fields = ['id', 'recruiter_name', 'name', 'logo', 'description', 'website',
                  'industry', 'company_size', 'location', 'founded_year', 'created_at']
        read_only_fields = ['id', 'created_at']

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)

        # 1. If logo is a string (existing URL sent back by frontend) or empty, ignore it so ImageField doesn't fail
        if 'logo' in data:
            val = data.get('logo')
            if isinstance(val, str) or val is None or val == '':
                data.pop('logo', None)

        # 2. Sanitize founded_year: convert empty string to None
        if 'founded_year' in data:
            val = data.get('founded_year')
            if val == '' or val is None:
                data['founded_year'] = None
            else:
                try:
                    data['founded_year'] = int(val)
                except (ValueError, TypeError):
                    data['founded_year'] = None

        # 3. Sanitize website: prepend https:// if missing scheme
        if 'website' in data:
            web = str(data.get('website') or '').strip()
            if web:
                if not (web.startswith('http://') or web.startswith('https://')):
                    web = f'https://{web}'
                data['website'] = web
            else:
                data['website'] = ''

        return super().to_internal_value(data)
