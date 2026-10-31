from django.urls import path
from .views import AIChatView, InterviewPrepView, SalaryInsightsView, CareerRoadmapView

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('interview-prep/<int:job_id>/', InterviewPrepView.as_view(), name='interview-prep'),
    path('salary-insights/', SalaryInsightsView.as_view(), name='salary-insights'),
    path('career-roadmap/', CareerRoadmapView.as_view(), name='career-roadmap'),
]
