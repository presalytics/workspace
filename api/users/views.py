import logging
from django.db.models import Q
from django.core.exceptions import ImproperlyConfigured
from django.http.response import HttpResponseNotFound
from django.shortcuts import render
from drf_spectacular.utils import OpenApiParameter, extend_schema
from drf_spectacular.types import OpenApiTypes
from rest_framework import views, exceptions, response, generics, request
from api.permissions import PresalyticsInternalPermssion, PresalyticsViewerPermission
from api.services.users import UserService
from user_sessions.models import Session
from presalytics.lib.util import dict_to_camelCase
from .serializers import UserMapSerializer, UserResourceSerializer
from .models import UserResource, UserMap


logger = logging.getLogger(__name__)


class UserRelationshipView(generics.ListAPIView):
    request: request.Request

    permission_classes = (PresalyticsViewerPermission,)
    serializer_class = UserMapSerializer

    def get_queryset(self):
        scope = self.request.query_params.get('scope', 'direct')
        user_id = self.kwargs.get('userId', None) or str(self.request.user.id)  # type: ignore
        query = Q(user_id=user_id)
        if scope == 'direct': 
            query = query & Q(relationship_scope='direct')
        elif scope == 'team':
            query = query & ( Q(relationship_scope='direct') | Q(relationshpip_scope='team') )
        return UserMap.objects.filter(query)

    @extend_schema(
        parameters=[
            OpenApiParameter("scope", OpenApiTypes.STR, OpenApiParameter.QUERY, enum=('direct', 'team', 'organization'))
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserInfoView(generics.RetrieveAPIView):
    permission_classes=[PresalyticsViewerPermission]

    def retrieve(self, request, *args, **kwargs):
        search_user_id = kwargs.get("id", None)
        if search_user_id:
            user_id = str(search_user_id)
            related_users = set(request.user.get_related_users())
            allowed_user_ids = [str(x.id) for x in related_users]
            allowed_user_ids.append(str(request.user.id))
            if user_id in allowed_user_ids:
                user_service = UserService()
                try:
                    user_info = user_service.user(user_id)
                except ValueError:
                    raise exceptions.NotFound()
                except Exception as ex:
                    logger.exception(ex)
                    raise exceptions.APIException(detail='User Service Unavaialable', code=exceptions.status.HTTP_503_SERVICE_UNAVAILABLE)
                return response.Response(data=user_info, status=200)
            else:
                raise exceptions.APIException(detail='Forbidden', code=403)

        else:
            raise exceptions.APIException(detail="Invlalid user Id", code=400)


class ResourcesView(generics.ListAPIView):
    permission_classes = [PresalyticsInternalPermssion]
    serializer_class = UserResourceSerializer

    def get_queryset(self):
        return UserResource.objects.filter(user_id=self.request.user.id)  # type: ignore


class RelatedUserView(generics.ListAPIView):
    request: request.Request

    permission_classes = [PresalyticsInternalPermssion]
    serializer_class = UserMapSerializer

    RESOURCE_TYPES = ('story', 'conversation', 'user', 'organization', 'agent', 'team')

    class MissingResourceIDException(exceptions.APIException):
        status_code = 400
        default_detail = "Request must contain a 'resourceId' or 'userId' parameter in the query string"
        default_code = 'bad_request'

    class MissingResourceTypeException(exceptions.APIException):
        status_code = 400
        default_detail = "Request must contain a 'resourceType' parameter in the querystring"
        default_code = 'bad_request'

    class InvalidResourceTypeException(exceptions.APIException):
        status_code = 400
        default_detail = "Query must specify a valid 'resourceType'. Valid values are 'story', 'conversation', 'user, 'organization', 'agent' or 'team'."
        default_code = 'bad_request'
    
    class ResourceNotFoundException(exceptions.APIException):
        status_code = 404
        default_detail = "The resource with the resourceId contained in your request could not be found"
        default_code = "not_found"

    def get_queryset(self):
        resource_id = self.request.query_params.get('resourceId') or self.request.query_params.get('resource_id')
        user_id = self.request.query_params.get('userId') or self.request.query_params.get('user_id')
        scope = self.request.query_params.get('scoped')
        resource_type = self.request.query_params.get('resourceType') or self.request.query_params.get('resouce_type')
        query = None
        if resource_id:
            query = Q(resource_id=resource_id)
        if user_id:
             query = query & Q(user_id=user_id) if query else Q(user_id=user_id)
        if query:
            if scope:
                query = query & Q(scope=scope)
            if resource_type:
                query = query & Q(resource_type=resource_type)
            return UserMap.objects.filter(query)
        else:
            raise self.MissingResourceIDException()


    @extend_schema(
        parameters=[
            OpenApiParameter("resourceId", OpenApiTypes.UUID, OpenApiParameter.QUERY),
            OpenApiParameter("userId", OpenApiTypes.UUID, OpenApiParameter.QUERY),
            OpenApiParameter("resourceType", OpenApiTypes.STR, OpenApiParameter.QUERY, enum=('story', 'conversation', 'agent', 'team', 'organization')),
            OpenApiParameter("scope", OpenApiTypes.STR, OpenApiParameter.QUERY, enum=('direct', 'team', 'organization'))
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    


class UserResourcesView(generics.ListAPIView):
    permission_classes = [PresalyticsViewerPermission]
    serializer_class = UserResourceSerializer

    def get_queryset(self):
        return UserResource.objects.filter(user_id=self.request.user.id)  # type: ignore
