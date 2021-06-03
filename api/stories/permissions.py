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
        if request.user in story.collaborators.objects.all():  # type: ignore
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

    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj)


class UserAnnotationEditDeletePermission(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        return False


class PageReadEditPermission(StoryBasePermission):

    def get_story(self, obj) -> 'models.Story':
        return obj.story

class OutlinePermission(StoryBasePermission):
    def get_story(self, obj) -> 'models.Story':
        return obj.story

class OutlinePatchPermssion(StoryBasePermission):
    def get_story(self, obj) -> 'models.Story':
        return obj.outline.story


class CollaboratorPermssion(StoryBasePermission):
    def get_story(self, obj) -> 'models.Story':
        return obj.story



