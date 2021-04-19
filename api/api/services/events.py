import typing
import uuid
import presalytics
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from .base import ServiceBase
from ..util import dict_to_camelCase


class EventsService(ServiceBase):

    def __init__(self, *args, **kwargs):
        super(EventsService, self).__init__(base_url=presalytics.settings.HOST_EVENTS, *args, **kwargs)

    def emit_event(self,
                   event_type: str,
                   model_data: typing.Dict,
                   resource_id: typing.Union[str, uuid.UUID],
                   metadata: typing.Dict):

        payload = {
            "eventType": event_type,
            "eventData": dict_to_camelCase(model_data),
            "source": "story",
            "metadata": dict_to_camelCase(metadata),
            "resourceId": str(resource_id)
        }

        resp = self.post("", payload)

        if resp.status_code == 204:
            return None
        else:
            raise ImproperlyConfigured("The events services could not fire the event.")