import logging
import json

from django.db.models.fields import related
from users.models import PresalyticsUser
from django.core.exceptions import ImproperlyConfigured
from django.http.response import HttpResponseNotFound
from django.shortcuts import render
from django.views.generic import TemplateView, View
from django.conf import settings
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseForbidden
from rest_framework import views, exceptions, response
from api.permissions import PresalyticsInternalPermssion, PresalyticsViewerPermission
from api.services.users import UserService
from user_sessions.models import Session
from presalytics.lib.util import dict_to_camelCase


logger = logging.getLogger(__name__)


class UserRelationshipView(View):
    
    def get(self, request, *args, **kwargs):
        related_users = set(request.user.get_related_user_dtos())
        rels = {
            "relationships": [x.to_dict() for x in related_users]
        }
        return JsonResponse(rels)


class UserInfoView(View):

    def get(self, request, *args, **kwargs):
        search_user_id = kwargs.get("id", None)
        if search_user_id:
            user_id = str(search_user_id)
            related_users = set(request.user.get_related_user_dtos())
            allowed_users = [str(x.related_user_id) for x in related_users]
            allowed_users.append(str(request.user.id))
            if user_id in allowed_users:
                user_service = UserService()
                try:
                    user_info = user_service.user(user_id)
                except ValueError:
                    return HttpResponseNotFound()
                except Exception as ex:
                    logger.exception(ex)
                    raise ImproperlyConfigured
                return JsonResponse(user_info)
            else:
                return HttpResponseForbidden()

        else:
            return HttpResponseBadRequest("Invlalid user Id")

class ResourcesView(views.APIView):
    permission_classes = [PresalyticsInternalPermssion]
    
    def get(self, request, id):
        try:
            user = PresalyticsUser.objects.get(pk=id)  # throws error is not found

            from stories.models import StoryCollaborator, Story
            from conversations.models import Conversation

            scs =  StoryCollaborator.objects.filter(user=user)
            story_ids = [sc.story_id for sc in scs]
            resources = []
            resources.extend([{"resource_id": id, "resource_type": "story"} for id in story_ids])
            users = PresalyticsUser.objects.filter(storycollaborator__story_id__in=story_ids).distinct()
            resources.extend([{"resource_id": u.id, "resource_type": "user"} for u in users])
            convos = Conversation.objects.filter(participants=user).distinct()
            resources.extend([{"resource_id": c.id, "resource_type": "conversation"} for c in convos])
            # TODO: add teams and organizations when models are added
            resp = [dict_to_camelCase(r) for r in resources]
            return JsonResponse(resp, safe=False)
        except PresalyticsUser.DoesNotExist:
            raise exceptions.NotFound()



class RelatedUserView(views.APIView):
    permission_classes = [PresalyticsInternalPermssion]

    class MissingResourceIDException(exceptions.APIException):
        status_code = 400
        default_detail = "Request must contain a 'resourceId' parameter in the query string"
        default_code = 'bad_request'

    class MissingResourceTypeException(exceptions.APIException):
        status_code = 400
        default_detail = "Request must contain a 'resourceType' parameter in the querystring"
        default_code = 'bad_request'

    class InvalidResourceTypeException(exceptions.APIException):
        status_code = 400
        default_detail = "Query must specify a valid 'resourceType'. Valid values are 'story', 'conversation', 'user, 'organization' or 'team'."
        default_code = 'bad_request'
    
    class ResourceNotFoundException(exceptions.APIException):
        status_code = 404
        default_detail = "The resource with the resourceId contained in your request could not be found"
        default_code = "not_found"
    
    def _get_story_related_users(self, id):
        from api.stories.models import Story
        try:
            story = Story.objects.get(pk=id)
            return [c.user for c in story.collaborators]
        except Story.DoesNotExist:
            raise self.ResourceNotFoundException()

    def _get_conversation_related_users(self, id):
        from api.conversations.models import Conversation
        try:
            convo: Conversation = Conversation.objects.get(pk=id)
            return convo.participants
        except Conversation.DoesNotExist:
            raise self.ResourceNotFoundException()

    def _get_user_related_users(self, id):
        user: PresalyticsUser = PresalyticsUser.objects.get(pk=id)
        return user.get_related_users()

    def _get_lookup_map(self):
        # TODO: add team and organization after models are build
        return {
            'story': self._get_story_related_users,
            'conversation': self._get_story_related_users,
            'user': self._get_user_related_users
        }


    def get(self, request):
        resource_id = request.query_params.get("resourceId", None)
        if not resource_id:
            raise self.MissingResourceIDException()
        resource_type = request.query_params.get("resourceType", None)
        if not resource_type:
            raise self.MissingResourceTypeException()
        lookup_map = self._get_lookup_map()
        if resource_type not in lookup_map:
            raise self.InvalidResourceTypeException()
        lookup_fn = lookup_map[resource_type]
        related_users = lookup_fn(resource_id)
        ret_obj = {
            "user_list": [r.id for r in related_users]
        }
        return response.Response(ret_obj)

        

        

        
