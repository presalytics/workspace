import logging
from django.contrib.auth.middleware import AuthenticationMiddleware
from django.contrib.auth.models import AnonymousUser
from .models import PresalyticsUser


logger = logging.getLogger(__name__)


class PresalyticsAuthenticationMidddleware(AuthenticationMiddleware):
    def process_request(self, request) -> None:
        super().process_request(request)
        if not hasattr(request, 'user') or isinstance(getattr(request, 'user', None), AnonymousUser):
            try:
                if request.session.get('token_data', None):
                    token_data = request.session['token_data']
                    if token_data.get('access_token', None):
                        request.user = PresalyticsUser.get_or_create(token_data['access_token'])
            except Exception as ex:
                logger.exception(ex)
