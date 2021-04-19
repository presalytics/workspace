import typing
from django.contrib.auth.models import User
from rest_framework.exceptions import PermissionDenied, NotFound, bad_request
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from api.permissions import PresaltyicsBuilderPermission, PresalyticsViewerPermission, PresalyticsInternalPermssion 
from users.models import PresalyticsUser
from .serializers import ConversationSerializer, MessageSerializer, UserSerializer
from .models import Conversation
from .permissions import ConversationPermission
if typing.TYPE_CHECKING:
    from rest_framework.request import Request


class ConversationsView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [PresalyticsViewerPermission]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

class ConversationsDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [PresalyticsViewerPermission, ConversationPermission]

    def destroy(self, request, *args, **kwargs):
        try:
            if 'internal' in request.user.presalytics_roles:
                return super().destroy(request, *args, **kwargs)
            else:
                raise PermissionDenied
        except Exception:
            raise PermissionDenied


class MessagesCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [PresalyticsViewerPermission, ConversationPermission]


class UserConversationsView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [PresalyticsInternalPermssion]

    def get_queryset(self):
        user_id = self.kwargs['api_user_id']
        return Conversation.objects.filter(participants__id=user_id)

class ParticipantsCreateListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [PresaltyicsBuilderPermission, ConversationPermission]


class ParticipantsRemoveView(generics.DestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [PresalyticsInternalPermssion]

    def destroy(self, request, *args, **kwargs):
        convo = Conversation.objects.get(pk=self.kwargs['id'])
        try:
            to_delete = next(x for x in convo.particpants if convo.participatns.id == self.kwargs['participant_id'])
            convo.participants.remove(to_delete)
            convo.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except StopIteration:
            raise NotFound
        except Exception as ex:
            return bad_request(request, ex)
    

