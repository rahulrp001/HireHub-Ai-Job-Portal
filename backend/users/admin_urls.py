from django.urls import path
from .admin_views import (
    AdminStatsView, AdminUsersView, AdminJobsView,
    AdminApplicationsView, AdminCompaniesView
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    path('users/<int:pk>/', AdminUsersView.as_view(), name='admin-user-detail'),
    path('jobs/', AdminJobsView.as_view(), name='admin-jobs'),
    path('jobs/<int:pk>/', AdminJobsView.as_view(), name='admin-job-detail'),
    path('applications/', AdminApplicationsView.as_view(), name='admin-applications'),
    path('companies/', AdminCompaniesView.as_view(), name='admin-companies'),
]
