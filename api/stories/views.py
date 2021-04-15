from django.shortcuts import render
from rest_framework import generics
from api.permissions import PresalyticsViewerPermission
from .models import Story, UserAnnotations
from . import serializers, permissions


# Create your views here.

class StoryView(generics.ListCreateAPIView):
    serializer_class = serializers.StorySerializer
    permission_classes = [PresalyticsViewerPermission]

    def get_queryset(self):
        return Story.objects.filter(collaborators=self.request.user)


class StoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.StorySerializer
    permission_classes = [PresalyticsViewerPermission]

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





