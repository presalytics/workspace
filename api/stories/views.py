import logging
import typing
import base64
import json
from django.http.response import HttpResponseBadRequest, JsonResponse
from django.shortcuts import HttpResponse
from rest_framework import generics, views, parsers, response, request
from presalytics.story.renderers import ClientSideRenderer
from presalytics.story.outline import StoryOutline
from api.permissions import PresaltyicsBuilderPermission, PresalyticsInternalPermssion, PresalyticsViewerPermission
from api.services.azure import AzureBlobService
from .models import PermissionTypes, Story, StoryCollaborator, UserAnnotations
from . import serializers, permissions


logger = logging.getLogger(__name__)


class StoryView(generics.ListCreateAPIView):
    serializer_class = serializers.StorySerializer
    permission_classes = [PresaltyicsBuilderPermission]

    def get_queryset(self):
        return Story.objects.filter(collaborators__user=self.request.user)

    def get_serializer_class(self):
        content_type = self.request.content_type
        method = self.request.method
        if method == "POST" and content_type == "application/json":
            return serializers.PostStoryOutlineSerializer
        elif method == "POST" and content_type == "multipart/form-data":
            return serializers.PostStoryOoxmlDocumentSerializer
        else:  
            return super().get_serializer_class()




class StoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.StorySerializer
    permission_classes = [PresalyticsViewerPermission, permissions.StoryPermission]

    def get_queryset(self):
        return Story.objects.filter(collaborators__in=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

class CommentsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.CommentSerializer
    permission_classes = [permissions.CommentEditDeletePermission]


class CommentCreateView(generics.CreateAPIView):
    serializer_class = serializers.CommentSerializer


class UserAnnotationsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.UserAnnotationSerialzer
    permission_classes = [permissions.UserAnnotationEditDeletePermission]

    def get_queryset(self):
        return UserAnnotations.objects.filter(user=self.request.user)


class UserAnnoationsCreateView(generics.CreateAPIView):
    serializer_class = serializers.UserAnnotationSerialzer


class ThumbnailView(views.APIView):
    permission_classes = [permissions.PageReadEditPermission]
    parser_classes = [parsers.FileUploadParser]
    serializer_class = serializers.PageSerializer

    def get(self, request: request.Request, pk):
        try:
            storage = AzureBlobService()
            image_file = storage.get_image(str(pk))
            return HttpResponse(image_file, content_type="image/png")
        except Exception as ex:
            logger.exception(ex)
            return HttpResponseBadRequest()


    def post(self, request, pk, format=None, ):
        try:
            file_data = request.data['file']
            storage = AzureBlobService()
            storage.put_image(str(pk), file_data.file)
            return response.Response(status=204)
        except Exception as ex:
            logger.exception(ex)
            return HttpResponseBadRequest()

class OutlineGetView(generics.RetrieveAPIView):
    permission_classes = [permissions.OutlinePermission]
    serializer_class = serializers.OutlineSerializer

class OutlinePatchGetView(generics.RetrieveAPIView):
    permission_classes = [permissions.OutlinePatchPermssion]
    serializer_class = serializers.OutlinePatchSerializer

class OutlinePatchCreateView(generics.CreateAPIView):
    permission_classes = [permissions.OutlinePatchPermssion, PresaltyicsBuilderPermission]
    serializer_class = serializers.OutlinePatchSerializer

class CollaboratorsCreateListView(generics.ListCreateAPIView):
    permission_classes = [permissions.CollaboratorPermssion|PresalyticsInternalPermssion]
    serializer_class = serializers.StoryCollaboratorSerializer

class CollaboratorsDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.CollaboratorPermssion]
    serializer_class = serializers.StoryCollaboratorSerializer

class CollaboratorsListAllView(generics.ListAPIView):
    permission_classes = [PresalyticsViewerPermission]
    serializer_class = serializers.StoryCollaboratorSerializer

    def get_queryset(self):
        return StoryCollaborator.objects.filter(user=self.request.user)


class PermissionTypesListView(generics.ListAPIView):
    permission_classes = [PresalyticsViewerPermission]
    serializer_class = serializers.PermissionTypeSerializer

    def get_queryset(self):
        return PermissionTypes.objects.all()




class RenderStoryView(views.APIView):
    permission_classes = [permissions.StoryPermission]

    def get(self, request, id):
        story: Story = Story.objects.get(pk=id)
        client_info = {
            "token": request.user.token,
            "cache_tokens": False,
            "delegate_login": True
        }
        pages = request.GET.get('pages', None)
        outline = story.outline.document
        if not isinstance(outline, StoryOutline):
            outline = StoryOutline.load(json.dumps(outline))
        data = ClientSideRenderer(outline, client_info=client_info, pages=pages).package()
        return JsonResponse(data)










