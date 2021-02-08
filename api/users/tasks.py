from celery import shared_task
from django.contrib.sessions.backends.db import SessionStore


@shared_task
def poll_for_device_credentials(device_code_response, session_id):
    from .models import PresaltyicsNativeDeviceOidc  # delayed to prevent circular import
    oidc = PresaltyicsNativeDeviceOidc()
    token_data = oidc.poll_for_token(device_code_response=device_code_response)
    sesh = SessionStore(session_key=session_id)
    sesh["token_data"] = token_data
    sesh.save()    