from django.urls import path
from .views import CompanyView, CompanyDetailView

urlpatterns = [
    path('my-company/', CompanyView.as_view(), name='my-company'),
    path('<int:pk>/', CompanyDetailView.as_view(), name='company-detail'),
]
