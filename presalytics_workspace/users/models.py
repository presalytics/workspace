import presalytics
import presalytics.client
import presalytics.client.oidc
from django.db import models
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
from .managers import CustomUserManager
from .tasks import poll_for_device_credentials


class PresalyticsUser(AbstractUser):
    username = None
    email = models.EmailField(_('email address'), unique=True)
    presalytics_user_id = models.CharField(max_length=36)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    @classmethod
    def get_or_create(cls, token):
        payload = PresaltyicsNativeDeviceOidc().validate_token(token)
        email = payload['email']
        user = None
        try:
            user = cls.objects.get(email=email)
        except cls.DoesNotExist:
            api_user_id = payload["https://api.presalytics.io/api_user_id"]
            user = cls.objects.create_user(email, None, {"presalytics_user_id": api_user_id})
        return user

class PresaltyicsNativeDeviceOidc(presalytics.client.oidc.OidcClient):
    def __init__(self, *args, **kwargs):
        super(PresaltyicsNativeDeviceOidc, self).__init__(*args, **kwargs)
        self.default_scopes += " workspace"


    def get_device_code(self):
        device_data = {
            'client_id': self.client_id,
            'audience': self.audience,
            'scope': self.default_scopes
        }
        return self._post(self.device_endpoint, device_data)

    def handle_device_code_response(self, device_code_response):
        poll_for_device_credentials.apply_async(device_code_response, queue='workspace')
