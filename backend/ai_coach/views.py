from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from ai_services.ai_coach import get_ai_coach_response
from ai_services.interview_prep import get_interview_questions
from ai_services.salary_insights import get_salary_insights
from ai_services.career_roadmap import get_career_roadmap
from jobs.models import Job


class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'success': False, 'message': 'Message is required'}, status=400)
        response = get_ai_coach_response(message, user=request.user)
        return Response({'success': True, 'response': response})


class InterviewPrepView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(pk=job_id)
        except Job.DoesNotExist:
            return Response({'success': False, 'message': 'Job not found'}, status=404)

        questions = get_interview_questions(job.title, job.required_skills or [])
        return Response({
            'success': True,
            'job_title': job.title,
            'company': job.company.name if job.company else '',
            'questions': questions,
        })


class SalaryInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.query_params.get('role', 'software engineer')
        years = int(request.query_params.get('years', 0))
        location = request.query_params.get('location', 'other')

        try:
            from candidates.models import CandidateProfile
            profile = CandidateProfile.objects.prefetch_related('candidate_skills__skill').get(user=request.user)
            skills = [cs.skill.name for cs in profile.candidate_skills.all()]
            if not years:
                years = profile.years_of_experience
        except Exception:
            skills = []

        insights = get_salary_insights(role, years, location, skills)
        return Response({'success': True, 'insights': insights})


class CareerRoadmapView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        target_role = request.data.get('target_role', '').strip()
        if not target_role:
            return Response({'success': False, 'message': 'target_role is required'}, status=400)

        try:
            from candidates.models import CandidateProfile
            profile = CandidateProfile.objects.prefetch_related('candidate_skills__skill').get(user=request.user)
            current_skills = [cs.skill.name for cs in profile.candidate_skills.all()]
        except Exception:
            current_skills = []

        roadmap = get_career_roadmap(target_role, current_skills)
        return Response({'success': True, 'roadmap': roadmap})
