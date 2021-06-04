import collections
import typing
import json
from django.core.exceptions import RequestAborted
from rest_framework import serializers
from django.conf import settings
from django.apps import apps
from presalytics.story.outline import StoryOutline
from .models import OoxmlDocument, Story, StoryPage, Comment, UserAnnotations, Outline, OutlinePatches, StoryCollaborator, PermissionTypes
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'page_id', 'dom_selector', 'text', 'user_id']


class UserAnnotationSerialzer(serializers.ModelSerializer):
    class Meta:
        model = UserAnnotations
        fields = ['id', 'is_favorite']


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

class OutlineSerializer(serializers.ModelSerializer):
    document = serializers.SerializerMethodField('get_document')

    def get_document(self, instance):
        if type(instance.document) == StoryOutline:
            return instance.document.to_dict()
        else:
            return instance.document
    
    
    class Meta:
        model = Outline
        fields = ['id', 'story_id', 'document', 'latest_patch_sequence']
    


class OutlinePatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutlinePatches
        fields = ['id', 'outline_id', 'jsondiffpatch', 'rfc_6902_patch']


class PermissionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermissionTypes
        fields = ['id', 'name', 'can_edit', 'can_view', 'can_add_collaborators', 'can_delete' ]


class StoryCollaboratorSerializer(serializers.ModelSerializer):
    permission_name = serializers.SerializerMethodField('get_permission_name')
    annotation = UserAnnotationSerialzer()

    def get_permission_name(self, instance):
        return instance.permission_type.name

    class Meta:
        model = StoryCollaborator
        fields = ['id', 'user_id', 'story_id', 'permission_type_id', 'permission_name', 'annotation']


class OoxmlDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = OoxmlDocument
        fields = ['id', 'ooxml_automation_id', 'story_id', 'cloned_from', 'delete_target_on_story_delete']


class StorySerializer(serializers.ModelSerializer):
    pages = PageSerializer(many=True, required=False)
    outline = OutlineSerializer()
    collaborators = StoryCollaboratorSerializer(many=True, required=False)
    ooxml_documents = OoxmlDocumentSerializer(many=True, required=False)

    class Meta:
        model = Story
        fields = (
            'id',
            'outline',
            'pages',
            'collaborators',
            'ooxml_documents',
            'is_public',
            'title'
        )
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


class PostStoryOutlineSerializer(serializers.ModelSerializer):
    outline = OutlineSerializer(read_only=True, required=False)
    annotations = UserAnnotationSerialzer(read_only=True, required=False)
    collaborators = StoryCollaboratorSerializer(read_only=True, required=False)
    pages = PageSerializer(read_only=True, required=False)

    class Meta:
        model = Story
        fields = ['id', 'outline', 'is_public', 'annotations', 'collaborators', 'title', 'pages']
        extra_kwargs = {
            'is_public': {
                'validators': False
            },
            'title': {
                'validators': False
            }
        }

    def create(self, validated_data):
        outline_json = validated_data.pop('outline')
        story = Story.objects.create(is_public=False, title=outline_json.get('title', 'New Story'))
        Outline.objects.create(story=story, document=outline_json, latest_patch_sequence=0)
        permission = PermissionTypes.objects.get(name='creator')
        StoryCollaborator.objects.create(permission_type=permission, user=self.context['request'].user, story=story)
        UserAnnotations.objects.create(story=story, user=self.context['request'].user, is_favorite=False)
        for page in outline_json.get('pages', []):
            page_id = page.get('id', None)
            page = StoryPage.objects.create(story=story, created_from=page_id)
        story.save()
        story.refresh_from_db()
        return story


class PostStoryOoxmlDocumentSerializer(serializers.ModelSerializer):
    outline = OutlineSerializer(read_only=True, required=False)
    annotations = UserAnnotationSerialzer(read_only=True, required=False)
    collaborators = StoryCollaboratorSerializer(read_only=True, required=False)
    pages = PageSerializer(read_only=True, required=False)

    class Meta:
        model = Story
        fields = ['id', 'outline', 'is_public', 'annotations', 'collaborators', 'title', 'pages']
        extra_kwargs = {
            'is_public': {
                'validators': False
            },
            'title': {
                'validators': False
            }
        }

    def create(self, validated_data):
        file = validated_data['file']
        story = Story.objects.create(is_public=False, title=file.filename)
        OoxmlDocument.create_with_file(file, story, self.context['request'].user)
        permission = PermissionTypes.objects.get(name='creator')
        StoryCollaborator.objects.create(permission_type=permission, user=self.context['request'].user, story=story)
        UserAnnotations.objects.create(story=story, user=self.context['request'].user, is_favorite=False)
        story.save()
        story.refresh_from_db()
        return story
        

