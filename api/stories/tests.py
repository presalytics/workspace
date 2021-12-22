import uuid
import json
from urllib.parse import urlencode
from django.urls import reverse
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

    def test_outline_patch_view(self):
        patch = """
            {
            "jsondiffpatch": {
                "title": [
                "bubblechart.pptx"
                ],
                "pages": [
                [
                    {
                    "id": "61053eb5-f626-48d4-ae78-d2e16cd13dd2",
                    "name": "Slide 0",
                    "kind": "widget-page",
                    "widgets": [
                        {
                        "name": "Slide 0",
                        "kind": "ooxml-file-object",
                        "data": {
                            "filename": "bubblechart.pptx",
                            "object_name": "Slide 0",
                            "endpoint_id": "Slides",
                            "document_ooxml_id": "936f0361-6834-4a53-bd1e-3c2fa6693b5a",
                            "object_ooxml_id": "22fe5d10-6225-426b-8da8-fff5c5d3737f",
                            "story_id": "493574f1-4cd7-4e67-8bc0-1d395d0af7b6"
                        },
                        "plugins": []
                        }
                    ],
                    "plugins": []
                    }
                ]
                ],
                "themes": [
                []
                ]
            },
            "rfc_6902_patch": [
                {
                "op": "add",
                "path": "/description",
                "value": ""
                },
                {
                "op": "add",
                "path": "/info",
                "value": {
                    "dateCreated": "2021-12-22T13:57:11.604Z",
                    "createdBy": "b17edc73-2384-4551-a375-7228c93f3dab",
                    "filename": "bubblechart.pptx",
                    "dateModified": "2021-12-22T13:57:11.604Z",
                    "modifiedBy": "b17edc73-2384-4551-a375-7228c93f3dab"
                }
                },
                {
                "op": "add",
                "path": "/pages",
                "value": [
                    {
                    "id": "61053eb5-f626-48d4-ae78-d2e16cd13dd2",
                    "name": "Slide 0",
                    "kind": "widget-page",
                    "widgets": [
                        {
                        "name": "Slide 0",
                        "kind": "ooxml-file-object",
                        "data": {
                            "filename": "bubblechart.pptx",
                            "object_name": "Slide 0",
                            "endpoint_id": "Slides",
                            "document_ooxml_id": "936f0361-6834-4a53-bd1e-3c2fa6693b5a",
                            "object_ooxml_id": "22fe5d10-6225-426b-8da8-fff5c5d3737f",
                            "story_id": "493574f1-4cd7-4e67-8bc0-1d395d0af7b6"
                        },
                        "plugins": []
                        }
                    ],
                    "plugins": []
                    }
                ]
                },
                {
                "op": "add",
                "path": "/storyId",
                "value": "493574f1-4cd7-4e67-8bc0-1d395d0af7b6"
                },
                {
                "op": "add",
                "path": "/themes",
                "value": []
                },
                {
                "op": "add",
                "path": "/title",
                "value": "bubblechart.pptx"
                }
            ]
            }
        """

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
        create_resp = self.client.post(create_url, data=payload, format='json', **self.auth_header)
        self.assertEqual(create_resp.status_code, 201)
        new_story = create_resp.json()
        patch_url = reverse('stories:outline_patch_create', kwargs={'pk': new_story['id']})
        patch_resp = self.client.post(patch_url, data=json.loads(patch), format='json', **self.auth_header)
        self.assertEqual(patch_resp.status_code, 201)
        patch_resp_data = patch_resp.json()
        patch_get_url = reverse('stories:outline_patch_detail', kwargs={'outline_id': new_story['id'], 'pk': patch_resp_data['id']})
        patch_get_resp = self.client.get(patch_get_url, **self.auth_header)
        self.assertEqual(patch_get_resp.status_code, 200)

        outline_get_url = reverse('stories:outline_detail', kwargs={'pk': new_story['id']})
        outline_get_resp = self.client.get(outline_get_url, **self.auth_header)
        self.assertEqual(outline_get_resp.status_code, 200)

        outline_get_resp_payload = outline_get_resp.json()

        self.assertNotEqual(outline_get_resp_payload, new_story['outline'])
