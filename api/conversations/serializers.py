from rest_framework import serializers
from users.models import PresalyticsUser
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    messages = serializers.PrimaryKeyRelatedField(queryset=Message.objects.all(), many=True)

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'metadata', 'story_id', 'messages']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'metadata', 'conversation_id']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PresalyticsUser
        fields = ['id']


