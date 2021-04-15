import typing
import json
from rest_framework import serializers
from django.conf import settings
from django.apps import apps
from .models import Story, StoryPage, Comment, UserAnnotations
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'page_id', 'dom_selector', 'text', 'user_id']


class UserAnnotationSerialzer(serializers.ModelSerializer):
    class Meta:
        model = UserAnnotations
        fields = ['id', 'user_id', 'is_favorite']


class PageSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, required=False)
    
    class Meta:
        model = StoryPage
        fields = ['id', 'comments']

    def create(self, validated_data):
        comments = validated_data.pop('comments', None)
        page = StoryPage.objects.create(**validated_data)
        for c in comments:
            Comment.objects.get_or_create(**c, page=page)
        return page.refresh_from_db()


class StorySerializer(serializers.ModelSerializer):
    pages = PageSerializer(many=True, required=False)
    annotations = UserAnnotationSerialzer(many=True, required=False)
    outline: str

    class Meta:
        model = Story
        fields = ['id', 'annotations', 'pages']
        extra_kwargs = {
            'id': {
                'read_only': False
            },
            'slug' : {
                'validators': False
            }
        }

    def create(self, validated_data):
       
        story, _ = Story.objects.get_or_create(**validated_data)
        collaborators_data = self.context["request"].data["collaborators"]
        for c in collaborators_data:
            user_cls: 'PresalyticsUser' = apps.get_model('users', 'PresalyticsUser')  # type: ignore
            user_id = c.get("user_id", None)
            if user_id:
                collaborator, _ = user_cls.objects.get_or_create_user(id=user_id)
                story.collaborators.add(collaborator)
                annotation = UserAnnotations.objects.create(user=collaborator, story=story)
                story.annotations.add(annotation)
        outline_str = self.context["request"].data["outline"]
        if outline_str:
            outline = json.loads(outline_str)
            page_data = outline["pages"]
            for p in page_data:
                id = p.pop("id", None)
                StoryPage.objects.create(id=id, story=story)
        story.save()
        story.refresh_from_db()
        return story

    def update(self, instance, validated_data):
        outline_str = validated_data.pop('outline', None)
        if outline_str:
            outline = json.loads(outline_str)
            for p in outline['pages']:
                StoryPage.objects.get_or_create(**p)
        return super().update(instance, validated_data)
        


