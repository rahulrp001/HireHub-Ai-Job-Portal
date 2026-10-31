from django.urls import path
from .views import (JobListView, JobDetailView, RecruiterJobListView,
                    RecruiterJobDetailView, SaveJobView, SavedJobListView)

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('<int:pk>/save/', SaveJobView.as_view(), name='save-job'),
    path('saved/', SavedJobListView.as_view(), name='saved-jobs'),
    path('recruiter/jobs/', RecruiterJobListView.as_view(), name='recruiter-jobs'),
    path('recruiter/jobs/<int:pk>/', RecruiterJobDetailView.as_view(), name='recruiter-job-detail'),
]
