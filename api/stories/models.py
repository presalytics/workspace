import typing
from uuid import uuid4
from django.db import models
from django.conf import settings
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


# Create your models here.

class Story(models.Model):
    annotations: typing.Union[models.Manager, 'UserAnnotations']
    pages: typing.Union[models.Manager, 'StoryPage']

    id = models.UUIDField(null=False, primary_key=True)
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL)


class UserAnnotations(models.Model):
    id = models.UUIDField(null=False, primary_key=True, default=uuid4)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='annotations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user')
    is_favorite = models.BooleanField(default=False)


class StoryPage(models.Model):
    comments: typing.Union[models.Manager, 'Comment']

    id = models.UUIDField(null=False, primary_key=True, default=uuid4)
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='pages')
    

class Comment(models.Model):
    id = models.UUIDField(null=False, primary_key=True)
    page = models.ForeignKey(StoryPage, on_delete=models.CASCADE, related_name='comments')
    dom_selector = models.CharField(max_length=256)
    text = models.TextField(max_length=4096)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)