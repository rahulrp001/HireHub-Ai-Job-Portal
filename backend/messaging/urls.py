from django.urls import path
from .views import ConversationListView, MessageView

urlpatterns = [
    path('', ConversationListView.as_view(), name='conversations'),
    path('<int:user_id>/', MessageView.as_view(), name='messages'),
]
