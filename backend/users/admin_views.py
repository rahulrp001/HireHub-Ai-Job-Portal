from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Count, Q
from .models import User


def is_admin(user):
    return user.is_authenticated and user.role == 'ADMIN'


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from jobs.models import Job
        from applications.models import JobApplication
        from companies.models import Company

        total_users = User.objects.count()
        candidates = User.objects.filter(role='CANDIDATE').count()
        recruiters = User.objects.filter(role='RECRUITER').count()
        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(status='PUBLISHED').count()
        total_applications = JobApplication.objects.count()
        total_companies = Company.objects.count()

        recent_users = list(
            User.objects.order_by('-created_at')[:5]
            .values('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at')
        )

        return Response({
            'total_users': total_users,
            'candidates': candidates,
            'recruiters': recruiters,
            'total_jobs': total_jobs,
            'active_jobs': active_jobs,
            'total_applications': total_applications,
            'total_companies': total_companies,
            'recent_users': recent_users,
        })


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        role = request.query_params.get('role')
        search = request.query_params.get('search', '')
        qs = User.objects.all().order_by('-created_at')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))
        users = list(qs.values('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'phone', 'created_at'))
        return Response({'users': users, 'total': len(users)})

    def patch(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        is_active = request.data.get('is_active')
        if is_active is not None:
            user.is_active = is_active
            user.save(update_fields=['is_active'])
        return Response({'success': True, 'is_active': user.is_active})

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        if user.role == 'ADMIN':
            return Response({'detail': 'Cannot delete admin'}, status=400)
        user.delete()
        return Response({'success': True})


class AdminJobsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from jobs.models import Job
        search = request.query_params.get('search', '')
        job_status = request.query_params.get('status')
        qs = Job.objects.select_related('recruiter', 'company').order_by('-created_at')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(location__icontains=search))
        if job_status:
            qs = qs.filter(status=job_status)
        jobs = []
        for j in qs:
            jobs.append({
                'id': j.id,
                'title': j.title,
                'company': j.company.name if j.company else '—',
                'recruiter': f"{j.recruiter.first_name} {j.recruiter.last_name}",
                'location': j.location,
                'job_type': j.job_type,
                'status': j.status,
                'created_at': j.created_at,
                'application_count': j.applications.count(),
            })
        return Response({'jobs': jobs, 'total': len(jobs)})

    def patch(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from jobs.models import Job
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        new_status = request.data.get('status')
        if new_status:
            job.status = new_status
            job.save(update_fields=['status'])
        return Response({'success': True, 'status': job.status})

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from jobs.models import Job
        try:
            job = Job.objects.get(pk=pk)
        except Job.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        job.delete()
        return Response({'success': True})


class AdminApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from applications.models import JobApplication
        app_status = request.query_params.get('status')
        qs = JobApplication.objects.select_related('candidate', 'job', 'job__company').order_by('-applied_at')
        if app_status:
            qs = qs.filter(status=app_status)
        apps = []
        for a in qs[:200]:
            apps.append({
                'id': a.id,
                'candidate': f"{a.candidate.first_name} {a.candidate.last_name}",
                'candidate_email': a.candidate.email,
                'job': a.job.title,
                'company': a.job.company.name if a.job.company else '—',
                'status': a.status,
                'ai_match_score': a.ai_match_score,
                'applied_at': a.applied_at,
            })
        return Response({'applications': apps, 'total': len(apps)})


class AdminCompaniesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Forbidden'}, status=403)
        from companies.models import Company
        qs = Company.objects.select_related('recruiter').annotate(job_count=Count('jobs')).order_by('-created_at')
        companies = []
        for c in qs:
            companies.append({
                'id': c.id,
                'name': c.name,
                'industry': c.industry,
                'location': c.location,
                'company_size': c.company_size,
                'recruiter': f"{c.recruiter.first_name} {c.recruiter.last_name}",
                'recruiter_email': c.recruiter.email,
                'job_count': c.job_count,
                'created_at': c.created_at,
            })
        return Response({'companies': companies, 'total': len(companies)})
