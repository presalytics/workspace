from celery import shared_task
from django.contrib.sessions.backends.db import SessionStore
from .models import PresaltyicsNativeDeviceOidc


@shared_task
def poll_for_device_credentials(device_code_response, session_id):
    oidc = PresaltyicsNativeDeviceOidc()
    token_data = oidc.poll_for_token(device_code_response=device_code_response)
    sesh = SessionStore(session_key=session_id)
    sesh["device_token"] = token_data
    sesh.save()    