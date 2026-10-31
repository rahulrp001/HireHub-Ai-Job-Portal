from django.urls import path
from .views import ResumeUploadView, ResumeDetailView

urlpatterns = [
    path('', ResumeUploadView.as_view(), name='resume-upload'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
]
