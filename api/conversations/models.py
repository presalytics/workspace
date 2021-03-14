from uuid import uuid4
from django.db import models
from django.conf import settings

# Create your models here.


class Conversation(models.Model):

    id = models.UUIDField(default=uuid4, primary_key=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL)
    metadata = models.JSONField(null=True, default=None, blank=True)
    story_id = models.UUIDField(default=None, blank=True, null=True)

class Message(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True)
    message = models.TextField(max_length=4096)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    metadata = models.JSONField(null=True, default=None, blank=True)
