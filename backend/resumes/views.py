from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Resume
from .serializers import ResumeSerializer
from candidates.permissions import IsCandidate
from ai_services.resume_parser import parse_resume


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        resumes = Resume.objects.filter(candidate=request.user)
        return Response({'success': True, 'resumes': ResumeSerializer(resumes, many=True).data})

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'success': False, 'message': 'No file provided'},
                            status=status.HTTP_400_BAD_REQUEST)

        max_size = getattr(settings, 'MAX_RESUME_SIZE_MB', 5) * 1024 * 1024
        if file.size > max_size:
            return Response({'success': False, 'message': f'File too large. Max {settings.MAX_RESUME_SIZE_MB}MB'},
                            status=status.HTTP_400_BAD_REQUEST)

        allowed = ['.pdf', '.docx', '.doc', '.txt']
        if not any(file.name.lower().endswith(ext) for ext in allowed):
            return Response({'success': False, 'message': 'Only PDF, DOCX, and TXT allowed'},
                            status=status.HTTP_400_BAD_REQUEST)

        resume = Resume.objects.create(
            candidate=request.user,
            file=file,
            original_filename=file.name,
            parsing_status=Resume.ParsingStatus.PROCESSING
        )

        try:
            parsed = parse_resume(file, file.name)
            resume.parsed_text = parsed.get('raw_text', '')
            resume.extracted_name = parsed.get('name', '')
            resume.extracted_email = parsed.get('email', '')
            resume.extracted_phone = parsed.get('phone', '')
            resume.extracted_skills = parsed.get('skills', [])
            resume.extracted_education = parsed.get('education', [])
            resume.extracted_experience = parsed.get('experience', [])
            resume.parsing_status = Resume.ParsingStatus.COMPLETED
        except Exception:
            resume.parsing_status = Resume.ParsingStatus.FAILED

        resume.save()
        return Response({'success': True, 'resume': ResumeSerializer(resume).data},
                        status=status.HTTP_201_CREATED)


class ResumeDetailView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, candidate=request.user)
        except Resume.DoesNotExist:
            return Response({'success': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'success': True, 'resume': ResumeSerializer(resume).data})

    def delete(self, request, pk):
        try:
            resume = Resume.objects.get(pk=pk, candidate=request.user)
        except Resume.DoesNotExist:
            return Response({'success': False, 'message': 'Resume not found'}, status=status.HTTP_404_NOT_FOUND)
        resume.file.delete(save=False)
        resume.delete()
        return Response({'success': True, 'message': 'Resume deleted'})
