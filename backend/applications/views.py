from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import JobApplication
from .serializers import JobApplicationSerializer, ApplicationStatusSerializer
from jobs.models import Job
from resumes.models import Resume
from candidates.permissions import IsCandidate, IsRecruiter


class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id, status=Job.Status.PUBLISHED)

        if job.application_deadline and job.application_deadline < timezone.now().date():
            return Response({'success': False, 'message': 'Application deadline has passed'},
                            status=status.HTTP_400_BAD_REQUEST)

        if JobApplication.objects.filter(candidate=request.user, job=job).exists():
            return Response({'success': False, 'message': 'Already applied for this job'},
                            status=status.HTTP_400_BAD_REQUEST)

        resume_id = request.data.get('resume')
        resume = None
        if resume_id:
            resume = get_object_or_404(Resume, id=resume_id, candidate=request.user)

        application = JobApplication.objects.create(
            candidate=request.user,
            job=job,
            resume=resume,
            cover_letter=request.data.get('cover_letter', '')
        )

        # Trigger AI match score calculation (async in production)
        from ai_services.job_matcher import calculate_job_match
        try:
            match_result = calculate_job_match(request.user, job)
            application.ai_match_score = match_result.get('overall_score', 0)
            application.save(update_fields=['ai_match_score'])
        except Exception:
            pass

        return Response({'success': True, 'message': 'Application submitted',
                         'application': JobApplicationSerializer(application).data},
                        status=status.HTTP_201_CREATED)


class CandidateApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return JobApplication.objects.filter(candidate=self.request.user).select_related(
            'job', 'job__company', 'resume')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response({'success': True, 'applications': serializer.data})


class CandidateApplicationDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return JobApplication.objects.filter(candidate=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'application': self.get_serializer(instance).data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status not in [JobApplication.Status.APPLIED, JobApplication.Status.UNDER_REVIEW]:
            return Response({'success': False, 'message': 'Cannot withdraw at this stage'},
                            status=status.HTTP_400_BAD_REQUEST)
        instance.status = JobApplication.Status.WITHDRAWN
        instance.save(update_fields=['status'])
        return Response({'success': True, 'message': 'Application withdrawn'})


class RecruiterApplicationListView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        qs = JobApplication.objects.filter(job__recruiter=self.request.user).select_related(
            'candidate', 'job', 'resume')
        if job_id:
            qs = qs.filter(job_id=job_id)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        sort = self.request.query_params.get('sort', '-ai_match_score')
        return qs.order_by(sort)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response({'success': True, 'applications': serializer.data})


class UpdateApplicationStatusView(APIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        application = get_object_or_404(JobApplication, pk=pk, job__recruiter=request.user)
        serializer = ApplicationStatusSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'message': 'Status updated',
                         'application': JobApplicationSerializer(application).data})
