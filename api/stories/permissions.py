import typing
from rest_framework import permissions
if typing.TYPE_CHECKING:
    from . import models


class StoryBasePermission(permissions.BasePermission):

    def get_story(self, obj) -> 'models.Story':
        return NotImplemented

    def has_permission(self, request, view):
        return True

    def has_object_permission(self, request, view, obj):

        story: models.Story = self.get_story(obj)
        if request.user in story.colloaborators.all():
            return True
        return False

class StoryPermission(StoryBasePermission):

    def get_story(self, obj):
        return obj


class CommentReadPermssion(StoryBasePermission):
    obj: 'models.Comment'

    def get_story(self, obj) -> 'models.Story':
        return obj.page.story

class CommentEditDeletePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        return False


class UserAnnotationReadPermission(StoryBasePermission):
    def get_story(self, obj) -> 'models.Story':
        return obj.story


class UserAnnotationEditDeletePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        return False

