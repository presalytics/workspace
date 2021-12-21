import logging
from django.contrib.auth.middleware import AuthenticationMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import login
from .models import PresalyticsUser


logger = logging.getLogger(__name__)


class PresalyticsAuthenticationMidddleware(AuthenticationMiddleware):
    def process_request(self, request) -> None:
        super().process_request(request)
        if not hasattr(request, 'user') or isinstance(getattr(request, 'user', None), AnonymousUser):
            try:
                auth_header = request.META.get('HTTP_AUTHORIZATION', None)
                if auth_header:
                    token = auth_header.replace("Bearer ", "")
                    request.session['access_token'] = token
                    user = PresalyticsUser.get_or_create(token)
                    if user:
                        login(request, user)
            except Exception as ex:
                logger.exception(ex)
