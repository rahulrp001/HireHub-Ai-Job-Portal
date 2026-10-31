from django.urls import path
from .views import NotificationListView, MarkReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='notifications'),
    path('mark-read/', MarkReadView.as_view(), name='mark-all-read'),
    path('<int:pk>/read/', MarkReadView.as_view(), name='mark-read'),
]
