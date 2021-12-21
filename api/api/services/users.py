import urllib.parse
import logging
import presalytics
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from .base import ServiceBase


logger = logging.getLogger(__name__)


class UserService(ServiceBase):

    API_BASE_URL = settings.USERS_URL

    class ServiceEndpoints:
        ROOT = "{id}/"

    def __init__(self, *args, **kwargs):
        super(UserService, self).__init__(base_url=settings.USERS_URL, *args, **kwargs)

    def user(self, user_id):
        resp = self.get(self.ServiceEndpoints.ROOT.format(id=user_id), base_url=self.API_BASE_URL)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 404:
            raise ValueError("User {} could not be found on the wesite service".format(user_id))
        else:
            raise ImproperlyConfigured("An error occured With the User service.  Presalytics.io may be down.")
