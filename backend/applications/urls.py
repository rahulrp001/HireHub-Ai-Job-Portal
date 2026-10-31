from django.urls import path
from .views import (ApplyJobView, CandidateApplicationListView, CandidateApplicationDetailView,
                    RecruiterApplicationListView, UpdateApplicationStatusView)

urlpatterns = [
    path('', CandidateApplicationListView.as_view(), name='my-applications'),
    path('<int:pk>/', CandidateApplicationDetailView.as_view(), name='application-detail'),
    path('apply/<int:job_id>/', ApplyJobView.as_view(), name='apply-job'),
    path('recruiter/', RecruiterApplicationListView.as_view(), name='recruiter-applications'),
    path('recruiter/job/<int:job_id>/', RecruiterApplicationListView.as_view(), name='recruiter-job-applications'),
    path('<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-status'),
]
