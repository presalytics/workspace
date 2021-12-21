from urllib.parse import urlencode
from django.urls import reverse
from api.util import WorkspaceApiTestCase
from presalytics.client.oidc import OidcClient


class UserApiTests(WorkspaceApiTestCase):

    def test_user_resources_view(self):
        url = reverse('users:user_resources')
        resp = self.client.get(url, **self.auth_header)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)

    def test_audience_view(self):
        url = reverse('users:audience')
        resp = self.client.get(url, **self.auth_header)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)

    def test_user_info_view(self):
        user_id = OidcClient().get_user_id(self.token)
        url = reverse('users:info', kwargs={"id": user_id})
        resp = self.client.get(url, **self.auth_header)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNotNone(data)

    def test_resources_view(self):
        user_id = OidcClient().get_user_id(self.token)
        url = reverse('users:resources', kwargs={"id": user_id})
        resp = self.client.get(url, **self.auth_header)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)

    def test_related_search_view(self):
        user_id = OidcClient().get_user_id(self.token)
        params = {
            'userId': user_id,
            'resourceType': 'story'
        }
        url = reverse('users:related_search') + "?" + urlencode(params)
        resp = self.client.get(url, **self.auth_header)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertGreater(len(data), 0)
