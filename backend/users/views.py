from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, UserSerializer, UserUpdateSerializer
from django.db.models import Count


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from django.contrib.auth import authenticate
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'success': False, 'message': 'Email and password required'},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'success': False, 'message': 'Invalid credentials'},
                            status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'success': False, 'message': 'Account is deactivated'},
                            status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'success': True, 'message': 'Logged out successfully'})
        except TokenError:
            return Response({'success': False, 'message': 'Invalid token'},
                            status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response({'success': True, 'user': serializer.data})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not old_password or not new_password:
            return Response({'success': False, 'message': 'Both fields required'}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(old_password):
            return Response({'success': False, 'message': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({'success': False, 'message': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'success': True, 'message': 'Password changed successfully'})


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'CANDIDATE':
            from applications.models import JobApplication
            from jobs.models import SavedJob
            from candidates.models import CandidateProfile

            apps = JobApplication.objects.filter(candidate=user)
            status_counts = dict(apps.values_list('status').annotate(c=Count('status')).values_list('status', 'c'))
            saved_count = SavedJob.objects.filter(candidate=user).count()
            profile, _ = CandidateProfile.objects.get_or_create(user=user)

            return Response({
                'success': True,
                'role': 'CANDIDATE',
                'total_applications': apps.count(),
                'shortlisted': status_counts.get('SHORTLISTED', 0),
                'interviews': status_counts.get('INTERVIEW', 0),
                'selected': status_counts.get('SELECTED', 0),
                'rejected': status_counts.get('REJECTED', 0),
                'saved_jobs': saved_count,
                'status_counts': status_counts,
                'completion_percentage': profile.completion_percentage,
            })

        elif user.role == 'RECRUITER':
            from jobs.models import Job
            from applications.models import JobApplication

            jobs = Job.objects.filter(recruiter=user)
            active_jobs = jobs.filter(status='PUBLISHED').count()
            apps = JobApplication.objects.filter(job__recruiter=user)
            status_counts = dict(apps.values_list('status').annotate(c=Count('status')).values_list('status', 'c'))
            high_match = apps.filter(ai_match_score__gte=85).count()

            chart_data = list(
                jobs.annotate(app_count=Count('applications'))
                .values('title', 'app_count', 'status')[:8]
            )

            return Response({
                'success': True,
                'role': 'RECRUITER',
                'active_jobs': active_jobs,
                'total_jobs': jobs.count(),
                'total_applications': apps.count(),
                'shortlisted': status_counts.get('SHORTLISTED', 0),
                'interviews': status_counts.get('INTERVIEW', 0),
                'selected': status_counts.get('SELECTED', 0),
                'high_match_count': high_match,
                'status_counts': status_counts,
                'chart_data': chart_data,
            })

        return Response({'success': False, 'message': 'Unknown role'}, status=400)


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Q
        from .models import User
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'users': []})
        users = User.objects.filter(is_active=True).exclude(id=request.user.id).filter(
            Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(email__icontains=q)
        )[:10]
        return Response({'users': UserSerializer(users, many=True).data})
