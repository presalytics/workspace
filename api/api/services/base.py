import logging
import requests
import typing
import uuid
import urllib.parse
import presalytics
from presalytics.client.oidc import OidcClient
from django.conf import settings
from .redis import RedisWrapper


logger = logging.getLogger(__name__)


class ServiceBase(object):
    token: typing.Dict[str, typing.Any]

    def __init__(self, *args, **kwargs):
        self.base_url = kwargs.get("base_url")
        self.oidc = OidcClient(
            client_id=presalytics.settings.CLIENT_ID,
            client_secret=presalytics.settings.CLIENT_SECRET
        )
        self.token = self.get_token()  # type: ignore

    def _make_auth_header(self, user_token: typing.Optional[str]):
        auth_header = {
            "Authorization": "Bearer " + self.token["access_token"]
        }
        if user_token:
            auth_header = {
                "Authorization": "Bearer " + user_token
            }
        return auth_header

    def get(self, path, base_url=None, user_token=None):
        auth_header = self._make_auth_header(user_token=user_token)
        if not base_url:
            base_url = self.base_url
        return requests.get(base_url + path, headers=auth_header)

    def post(self, path, data, base_url=None, user_token=None):
        auth_header = self._make_auth_header(user_token=user_token)
        if not base_url:
            base_url = self.base_url
        return requests.post(base_url + path, headers=auth_header, json=data)

    def put(self, path, data, base_url=None, user_token=None):
        auth_header = self._make_auth_header(user_token=user_token)
        if not base_url:
            base_url = self.base_url
        return requests.put(base_url + path, headers=auth_header, json=data)

    def delete(self, path, base_url=None, user_token=None):
        auth_header = self._make_auth_header(user_token=user_token)
        if not base_url:
            base_url = self.base_url
        return requests.delete(base_url + path, headers=auth_header)

    def get_token(self, scopes=None, key=None):
        token: typing.Optional[typing.Dict[str, typing.Any]]
        if not key:
            key = settings.CLIENT_CREDENTIALS_CACHE_KEY
        token = None
        r = RedisWrapper.get_redis()
        if r:
            token = r.get(key)  # type: ignore
        if token:
            # Does CC token have a refresh token?
            logger.info("Token with key {0} retrieved from cache.".format(key))
        else:
            if not scopes:
                scopes = self.oidc.default_scopes
            token = self.oidc.client_credentials_token(scope=scopes)  # type: ignore
            logger.info("Token with key {0} retrieved from Login Endpoint.".format(key))
            if r and token.get("expires_in", None):
                expire_seconds = token["expires_in"] - 10
                r.put(key, token, expire_seconds=expire_seconds)

        return token
