import typing
import logging
import presalytics
from django.conf import settings
from .base import ServiceBase


logger = logging.getLogger(__name__)

class StoryService(ServiceBase):

    class ServiceEnpoints(object):
        USER_COLLABORATORS = '/collaborators'

    def __init__(self, *args, **kwargs):
        super(StoryService, self).__init__(base_url=presalytics.settings.HOST_STORY, *args, **kwargs)

    def get_user_collaborators(self, **kwargs):
        r = self.get(self.ServiceEnpoints.USER_COLLABORATORS, user_token=kwargs.get("user_token", None))
        try:
            r.raise_for_status()
            return r.json()
        except Exception as ex:
            logger.exception(ex, "Unable to call Stories endpoint at {}, status: ".format(self.base_url, r.status_code))
            raise ex
