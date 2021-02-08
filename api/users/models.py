from django.db.models.fields.related import ForeignKey
import presalytics
import presalytics.client
import presalytics.client.oidc
from django.db import models
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
from .managers import CustomUserManager



class PresalyticsUser(AbstractUser):
    username = None
    presalytics_user_id = models.CharField(max_length=36, unique=True)

    USERNAME_FIELD = 'presalytics_user_id'
    REQUIRED_FIELDS = []

    objects: CustomUserManager = CustomUserManager()

    def __str__(self):
        return self.presalytics_user_id

    @classmethod
    def get_or_create(cls, token):
        oidc_client = presalytics.client.oidc.OidcClient() 
        payload = oidc_client.validate_token(token)
        api_user_id = oidc_client.get_user_id(token)
        user = None
        try:
            user = cls.objects.get(presalytics_user_id=api_user_id)
        except cls.DoesNotExist:
            user = cls.objects.create_user(**{"presalytics_user_id": api_user_id})
        return user

