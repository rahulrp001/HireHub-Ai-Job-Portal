from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from .models import Message
from .serializers import MessageSerializer
from users.models import User


class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = Message.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user)
        ).select_related('sender', 'receiver').order_by('-created_at')

        seen = set()
        conversations = []
        for msg in messages:
            other = msg.receiver if msg.sender == request.user else msg.sender
            if other.id not in seen:
                seen.add(other.id)
                conversations.append({
                    'user': {'id': other.id, 'name': other.full_name, 'email': other.email},
                    'last_message': msg.message,
                    'last_message_time': msg.created_at.isoformat(),
                    'unread_count': Message.objects.filter(sender=other, receiver=request.user, is_read=False).count()
                })
        return Response({'success': True, 'conversations': conversations})


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            other = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        messages = Message.objects.filter(
            Q(sender=request.user, receiver=other) | Q(sender=other, receiver=request.user)
        ).select_related('sender', 'receiver')
        Message.objects.filter(sender=other, receiver=request.user, is_read=False).update(is_read=True)
        return Response({'success': True, 'messages': MessageSerializer(messages, many=True).data})

    def post(self, request, user_id):
        try:
            receiver = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'success': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        msg = Message.objects.create(
            sender=request.user,
            receiver=receiver,
            message=request.data.get('message', ''),
            application_id=request.data.get('application') or None
        )
        return Response({'success': True, 'message': MessageSerializer(msg).data}, status=status.HTTP_201_CREATED)
