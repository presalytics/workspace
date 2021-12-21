import typing
import presalytics
import presalytics.lib
import presalytics.lib.util
import os
from environs import Env
from django.test.runner import DiscoverRunner
from presalytics.client.oidc import OidcClient
from rest_framework.test import APITestCase


def dict_to_camelCase(dct: typing.Dict):
    tmp = dict()
    for k, v in dct.items():
        val = v
        if isinstance(v, dict):
            val = dict_to_camelCase(v)
        key = presalytics.lib.util.to_camel_case(k)
        tmp[key] = val
    return tmp


def get_test_token() -> str:
    env = Env()
    env.read_env()

    token = env.str("ACCESS_TOKEN", None)
    try:
        OidcClient().validate_token(token)
    except Exception:
        token = None
    if not token:
        token_data = OidcClient().token(env.str('USERNAME'))
        token = token_data['access_token']
        os.putenv('ACCESS_TOKEN', token)
        print("Access Token: " + token)

    OidcClient().validate_token(token)
    return token  # type: ignore


class WorkspaceApiTestCase(APITestCase):

    @classmethod
    def setUpClass(cls):
        cls.token = get_test_token()
        cls.auth_header = {"HTTP_AUTHORIZATION": "Bearer " + cls.token}
        super(WorkspaceApiTestCase, cls).setUpClass()


class WorkspaceApiDumbTestRunner(DiscoverRunner):

    def setup_databases(self, **kwargs):
        pass

    def teardown_databases(self, old_config, **kwargs):
        pass
