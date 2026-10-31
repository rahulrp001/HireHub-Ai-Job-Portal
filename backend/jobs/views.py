from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Job, SavedJob
from .serializers import JobSerializer, JobCreateSerializer
from candidates.permissions import IsRecruiter, IsCandidate


class JobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Job.objects.filter(status=Job.Status.PUBLISHED).select_related('company', 'recruiter')
        q = self.request.query_params.get('q')
        job_type = self.request.query_params.get('job_type')
        work_mode = self.request.query_params.get('work_mode')
        location = self.request.query_params.get('location')
        exp_min = self.request.query_params.get('exp_min')
        exp_max = self.request.query_params.get('exp_max')

        if q:
            qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) |
                           Q(company__name__icontains=q) | Q(location__icontains=q))
        if job_type:
            qs = qs.filter(job_type=job_type)
        if work_mode:
            qs = qs.filter(work_mode=work_mode)
        if location:
            qs = qs.filter(location__icontains=location)
        if exp_min:
            qs = qs.filter(experience_min__gte=exp_min)
        if exp_max:
            qs = qs.filter(experience_max__lte=exp_max)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)


class JobDetailView(generics.RetrieveAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.objects.select_related('company', 'recruiter')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response({'success': True, 'job': serializer.data})


class RecruiterJobListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobSerializer

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user).select_related('company')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = JobSerializer(qs, many=True, context={'request': request})
        return Response({'success': True, 'jobs': serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = JobCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = getattr(request.user, 'company', None)
        job = serializer.save(recruiter=request.user, company=company)
        return Response({'success': True, 'job': JobSerializer(job, context={'request': request}).data},
                        status=status.HTTP_201_CREATED)


class RecruiterJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsRecruiter]
    serializer_class = JobCreateSerializer

    def get_queryset(self):
        return Job.objects.filter(recruiter=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return Response({'success': True, 'job': JobSerializer(instance, context={'request': request}).data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        job = serializer.save()
        return Response({'success': True, 'job': JobSerializer(job, context={'request': request}).data})

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({'success': True, 'message': 'Job deleted'})


class SaveJobView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def post(self, request, pk):
        job = get_object_or_404(Job, pk=pk, status=Job.Status.PUBLISHED)
        saved, created = SavedJob.objects.get_or_create(candidate=request.user, job=job)
        if not created:
            saved.delete()
            return Response({'success': True, 'saved': False, 'message': 'Job unsaved'})
        return Response({'success': True, 'saved': True, 'message': 'Job saved'})


class SavedJobListView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Job.objects.filter(saved_by__candidate=self.request.user).select_related('company')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True, context={'request': request})
        return Response({'success': True, 'saved_jobs': serializer.data})
