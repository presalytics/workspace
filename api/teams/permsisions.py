from rest_framework.permissions import BasePermission
from .models import Team, TeamMember, TeamUserRoleChoices


class TeamEditorPermission(BasePermission):

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "role"):
            if obj.role == TeamUserRoleChoices.ADMIN:
                return True
        return False


class TeamMemberCreatePermission(BasePermission):

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        try:
            member: TeamMember = next(m for m in obj.members if m.user == request.user)
            if member.role in (TeamUserRoleChoices.ADMIN, TeamUserRoleChoices.PROMOTER):
                return True
            return False
        except StopIteration:
            return False


class TeamMemberChangePermission(BasePermission):

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):
        try:
            member: TeamMember = next(m for m in obj.team.members if m.user == request.user)
            if member.role == TeamUserRoleChoices.ADMIN:
                return True
            return False
        except StopIteration:
            return False
