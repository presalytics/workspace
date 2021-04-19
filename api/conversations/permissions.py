import typing
from rest_framework.permissions import BasePermission
from .models import Conversation, Message

class ConversationPermission(BasePermission):

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if request.user:
            if type(obj) is Conversation:
                return request.user in obj.participants
            elif type(obj) is Message:
                return request.user in obj.conversation.participants 
        return False