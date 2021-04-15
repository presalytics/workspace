from uuid import uuid4
from django.db import models
from django.conf import settings
from stories.models import Story

# Create your models here.


class Conversation(models.Model):

    class ConversationTypes(models.TextChoices):
        SLACK = 'slack'
        MS_TEAMS = 'teams'
        BOT = 'bot'
        GOOGLE = 'gchat'
        SF_CHATTER = 'salesforce'

    id = models.UUIDField(default=uuid4, primary_key=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    metadata = models.JSONField(null=True, default=None, blank=True)
    story = models.ForeignKey(Story, on_delete=models.SET_NULL, null=True, default=None, blank=True)
    type = models.CharField(max_length=16, choices=ConversationTypes.choices, default=ConversationTypes.BOT)


class Message(models.Model):
    id = models.UUIDField(default=uuid4, primary_key=True)
    message = models.TextField(max_length=4096)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    metadata = models.JSONField(null=True, default=None, blank=True)
