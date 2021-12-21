import uuid
from urllib.parse import urlencode
from django.urls import reverse
from django.db import transaction
from api.util import WorkspaceApiTestCase
from presalytics.client.oidc import OidcClient
from .models import Story


class StoryApiAppIntegrationTests(WorkspaceApiTestCase):

    def test_story_create_view(self):

        user_id = OidcClient().get_user_id(self.token)

        # Post a Story
        create_url = reverse('stories:create')
        story_title = "This a Test Story"
        payload = {
            "id": str(uuid.uuid4()),
            "isPublic": False,
            "outline": {
                "document": {}
            },
            "title": story_title
        }
        with transaction.atomic():
            create_resp = self.client.post(create_url, data=payload, format='json', **self.auth_header)
        self.assertEqual(create_resp.status_code, 201)

        new_story = create_resp.json()

        # Ensure returned json has correct properties and strcuture
        self.assertEqual(new_story["title"], story_title)
        self.assertEqual(len(new_story["collaborators"]), 1)

        # TODO: Add a collaborator

        # Test that users can be found via related search by resrouce Id
        resource_id = new_story['id']

        params = {
            'resourceId': resource_id,
            'resourceType': 'story'
        }
        url = reverse('users:related_search') + "?" + urlencode(params)
        search_resp = self.client.get(url, **self.auth_header)

        user_maps = search_resp.json()

        has_user = any(r for r in user_maps if r["relatedUserId"] == user_id and r["resourceId"] == resource_id)
        self.assertTrue(has_user)

        #  Test that resource_id shows up in user relationships view for both collaborators

        url = reverse('users:resources', kwargs={"id": user_id})
        user_resources_resp = self.client.get(url, **self.auth_header)

        user_resources = user_resources_resp.json()

        has_resource = any(r for r in user_resources if r["resourceId"] == resource_id and r["resourceType"] == "story")
        self.assertTrue(has_resource)

        # Clean up tranactions

        Story.objects.get(pk=new_story['id']).delete()
