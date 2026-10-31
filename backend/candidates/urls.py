from django.urls import path
from .views import (CandidateProfileView, SkillListView, CandidateSkillView,
                    EducationView, EducationDetailView, ExperienceView, ExperienceDetailView,
                    SkillGapView, RecommendationsView)

urlpatterns = [
    path('profile/', CandidateProfileView.as_view(), name='candidate-profile'),
    path('skills/', SkillListView.as_view(), name='skills-list'),
    path('my-skills/', CandidateSkillView.as_view(), name='candidate-skills'),
    path('my-skills/<int:skill_id>/', CandidateSkillView.as_view(), name='candidate-skill-delete'),
    path('education/', EducationView.as_view(), name='education'),
    path('education/<int:pk>/', EducationDetailView.as_view(), name='education-detail'),
    path('experience/', ExperienceView.as_view(), name='experience'),
    path('experience/<int:pk>/', ExperienceDetailView.as_view(), name='experience-detail'),
    path('skill-gap/<int:job_id>/', SkillGapView.as_view(), name='skill-gap'),
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
]
