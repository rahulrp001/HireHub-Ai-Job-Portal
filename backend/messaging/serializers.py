from rest_framework import serializers
from .models import Message
from users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender_detail = UserSerializer(source='sender', read_only=True)
    receiver_detail = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_detail', 'receiver', 'receiver_detail',
                  'application', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']
