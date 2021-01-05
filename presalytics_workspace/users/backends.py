from django.contrib.auth.backends import BaseBackend
import presalytics
import presalytics.client
from presalytics.client import api
import presalytics.client.oidc
from .models import PresalyticsUser, PresaltyicsNativeDeviceOidc

class PresalyticsDeviceAuthenticationBackend(BaseBackend):
    def authenticate(self, request, token=None):
        # Check the token and return a user.
        user = None
        if token:
            oidc = PresaltyicsNativeDeviceOidc()
            api_user_id = oidc.get_user_id(token)
            if api_user_id:
                try:
                    user = self.get_presalytics_user(api_user_id=api_user_id)
                except PresalyticsUser.DoesNotExist:
                    user = PresalyticsUser.objects.create_from_token(token)                    
        return user


        

    
    def get_presalytics_user(self, api_user_id):
        try:
            return PresalyticsUser.objects.get(api_user_id=api_user_id)
        except PresalyticsUser.DoesNotExist:
            return None
            