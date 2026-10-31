from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import CandidateProfile, CandidateSkill, Skill, Education, Experience
from .serializers import (CandidateProfileSerializer, CandidateSkillSerializer,
                           SkillSerializer, EducationSerializer, ExperienceSerializer)
from .permissions import IsCandidate
from jobs.models import Job
from jobs.serializers import JobSerializer


class CandidateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self):
        profile, _ = CandidateProfile.objects.get_or_create(user=self.request.user)
        return profile

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'profile': serializer.data})

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'message': 'Profile updated', 'profile': serializer.data})


class SkillListView(generics.ListCreateAPIView):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    queryset = Skill.objects.all()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsCandidate()]


class CandidateSkillView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        profile = get_object_or_404(CandidateProfile, user=request.user)
        skills = CandidateSkill.objects.filter(candidate=profile).select_related('skill')
        return Response({'success': True, 'skills': CandidateSkillSerializer(skills, many=True).data})

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = CandidateSkillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candidate=profile)
        return Response({'success': True, 'skill': serializer.data}, status=status.HTTP_201_CREATED)

    def delete(self, request, skill_id):
        profile = get_object_or_404(CandidateProfile, user=request.user)
        skill = get_object_or_404(CandidateSkill, id=skill_id, candidate=profile)
        skill.delete()
        return Response({'success': True, 'message': 'Skill removed'})


class EducationView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        profile = get_object_or_404(CandidateProfile, user=request.user)
        return Response({'success': True, 'education': EducationSerializer(profile.education.all(), many=True).data})

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = EducationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candidate=profile)
        return Response({'success': True, 'education': serializer.data}, status=status.HTTP_201_CREATED)


class EducationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self, pk, user):
        profile = get_object_or_404(CandidateProfile, user=user)
        return get_object_or_404(Education, id=pk, candidate=profile)

    def put(self, request, pk):
        edu = self.get_object(pk, request.user)
        serializer = EducationSerializer(edu, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'education': serializer.data})

    def delete(self, request, pk):
        edu = self.get_object(pk, request.user)
        edu.delete()
        return Response({'success': True, 'message': 'Education deleted'})


class ExperienceView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        profile = get_object_or_404(CandidateProfile, user=request.user)
        return Response({'success': True, 'experience': ExperienceSerializer(profile.experience.all(), many=True).data})

    def post(self, request):
        profile, _ = CandidateProfile.objects.get_or_create(user=request.user)
        serializer = ExperienceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candidate=profile)
        return Response({'success': True, 'experience': serializer.data}, status=status.HTTP_201_CREATED)


class ExperienceDetailView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self, pk, user):
        profile = get_object_or_404(CandidateProfile, user=user)
        return get_object_or_404(Experience, id=pk, candidate=profile)

    def put(self, request, pk):
        exp = self.get_object(pk, request.user)
        serializer = ExperienceSerializer(exp, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'success': True, 'experience': serializer.data})

    def delete(self, request, pk):
        exp = self.get_object(pk, request.user)
        exp.delete()
        return Response({'success': True, 'message': 'Experience deleted'})


class SkillGapView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        from ai_services.recommendation_engine import analyze_skill_gap
        result = analyze_skill_gap(request.user, job)
        return Response({'success': True, **result})


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        from ai_services.recommendation_engine import get_recommended_jobs
        from ai_services.job_matcher import calculate_job_match

        scored = get_recommended_jobs(request.user, limit=20)
        results = []
        for item in scored:
            job = item['job']
            match = calculate_job_match(request.user, job)
            results.append({
                'job': JobSerializer(job, context={'request': request}).data,
                'score': item['score'],
                'matched_skills': match.get('matched_skills', []),
                'missing_skills': match.get('missing_skills', []),
                'explanation': match.get('explanation', ''),
            })
        return Response({'success': True, 'recommendations': results})
