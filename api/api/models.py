import datetime
import uuid
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import pre_save
from api.middleware import get_request, RequestNotFound


def get_current_user():
    user = None
    try:
        user = get_request().user
    except RequestNotFound:
        return user


class BaseModel(models.Model):

    class Meta:
        abstract = True

    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='%(class)s_created_by')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, null=True, blank=True, related_name='%(class)s_updated_by')


@receiver(pre_save, sender=BaseModel)
def handle_pre_save(sender, instance, **kwargs):
    user = get_current_user()
    if user:
        instance.updated_by = user
        if instance.id is None:  # entry isn't created yet
            instance.created_by = user
