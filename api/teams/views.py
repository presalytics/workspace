from django.views import generic
from rest_framework import generics
from api.permissions import PresaltyicsBuilderPermission
from .models import Team, TeamMember
from .serializers import TeamMemberSerializer, TeamSerializer
from .permsisions import TeamEditorPermission, TeamMemberCreatePermission, TeamMemberChangePermission


class TeamListCreateView(generics.ListCreateAPIView):
    permission_classes = (PresaltyicsBuilderPermission,)

    def get_queryset(self):
        return Team.objects.filter(members__user__in=self.request.user)


class TeamGetEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (TeamEditorPermission,)
    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(members__user__in=self.request.user)


class TeamMemberCreateView(generics.CreateAPIView):
    permission_classes = (TeamMemberCreatePermission,)
    serializer_class = TeamMemberSerializer

    def get_queryset(self):
        return TeamMember.objects.filter(user_in=self.request.user)


class TeamMemberGetEditDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (TeamEditorPermission,)
    serializer_class = TeamMemberSerializer

    def get_queryset(self):
        return TeamMember.objects.filter(user_in=self.request.user)
