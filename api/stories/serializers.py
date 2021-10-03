import collections
from inspect import Attribute
import typing
import json
from django.core.exceptions import RequestAborted
from rest_framework import serializers
from django.conf import settings
from django.apps import apps
from django.db.models import Max
from presalytics.story.outline import StoryOutline
from api.serailizers import BaseModelSerializer
from .models import OoxmlDocument, Story, StoryPage, Comment, UserAnnotations, Outline, OutlinePatches, StoryCollaborator, PermissionTypes
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


class CommentSerializer(BaseModelSerializer):
    class Meta:
        model = Comment
        fields = ('page_id', 'dom_selector', 'text', 'user_id') + BaseModelSerializer.Meta.fields


class UserAnnotationSerialzer(BaseModelSerializer):
    class Meta:
        model = UserAnnotations
        fields = ('is_favorite',) + BaseModelSerializer.Meta.fields

    def get_attribute(self, instance):
        try:
            return super().get_attribute(instance)
        except AttributeError:
            self.source_attrs = ['first', 'annotation']
            return super().get_attribute(instance)


class PageSerializer(BaseModelSerializer):
    comments = CommentSerializer(many=True, required=False)
    
    class Meta:
        model = StoryPage
        fields = ('comments',) + BaseModelSerializer.Meta.fields

    def create(self, validated_data):
        comments = validated_data.pop('comments', None)
        page = StoryPage.objects.create(**validated_data)
        for c in comments:
            Comment.objects.get_or_create(**c, page=page)
        return page.refresh_from_db()

class OutlineSerializer(BaseModelSerializer):
    # document = serializers.SerializerMethodField('get_document')


    def get_document(self, instance):
        if type(instance.document) == StoryOutline:
            return instance.document.to_dict()
        else:
            return instance.document
    
    class Meta:
        model = Outline
        fields = ('story_id', 'document', 'latest_patch_sequence') + BaseModelSerializer.Meta.fields
        extra_kwargs = {
            'latest_patch_sequence': {
                'required': False
            },
            'story_id': {
                'required': False
            },
            'document': {
                'required': True,
                'read_only': False
            }
        }
    


class OutlinePatchSerializer(BaseModelSerializer):
    class Meta:
        model = OutlinePatches
        fields = ('jsondiffpatch', 'rfc_6902_patch') + BaseModelSerializer.Meta.fields

    def create(self, validated_data):
        outline_id = str(self.context['view'].kwargs['pk'])
        current_outline = Outline.objects.get(pk=outline_id)
        new_outline = current_outline.apply_patch(validated_data['rfc_6902_patch'])
        return OutlinePatches.objects.create(
            patch_is_applied=True,
            sequence=new_outline.latest_patch_sequence,
            outline_id=outline_id,
            **validated_data
        )


class PermissionTypeSerializer(BaseModelSerializer):
    class Meta:
        model = PermissionTypes
        fields = ('name', 'can_edit', 'can_view', 'can_add_collaborators', 'can_delete')  + BaseModelSerializer.Meta.fields


class StoryCollaboratorSerializer(BaseModelSerializer):
    permission_name = serializers.SerializerMethodField('get_permission_name')
    annotation = UserAnnotationSerialzer()

    def get_permission_name(self, instance):
        if not isinstance(instance, StoryCollaborator):
            instance = instance.first()
        return instance.permission_type.name

    class Meta:
        model = StoryCollaborator
        fields = ('user_id', 'story_id', 'permission_type_id', 'permission_name', 'annotation') + BaseModelSerializer.Meta.fields

class OoxmlDocumentSerializer(BaseModelSerializer):
    class Meta:
        model = OoxmlDocument
        fields = ('ooxml_automation_id', 'story_id', 'cloned_from', 'delete_target_on_story_delete') + BaseModelSerializer.Meta.fields


class StorySerializer(BaseModelSerializer):
    pages = PageSerializer(many=True, required=False)
    outline = OutlineSerializer()
    collaborators = StoryCollaboratorSerializer(many=True, required=False)
    ooxml_documents = OoxmlDocumentSerializer(many=True, required=False)

    class Meta:
        model = Story
        fields = (
            'outline',
            'pages',
            'collaborators',
            'ooxml_documents',
            'is_public',
            'title'
        ) + BaseModelSerializer.Meta.fields

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
    outline = OutlineSerializer(read_only=False, required=False)
    annotations = UserAnnotationSerialzer(read_only=True, required=False)
    collaborators = StoryCollaboratorSerializer(read_only=True, required=False)
    pages = PageSerializer(read_only=True, required=False)

    class Meta:
        model = Story
        fields = ('outline', 'is_public', 'annotations', 'collaborators', 'title', 'pages') + BaseModelSerializer.Meta.fields

    def create(self, validated_data):
        outline_json = validated_data.get('outline').get('document')
        story = Story.objects.create(
            id=validated_data.get('id', None), 
            is_public=validated_data.get('is_public', None), 
            title=outline_json.get('title', 'New Story')
        )
        Outline.objects.create(id=story.id, story=story, document=outline_json, latest_patch_sequence=0)
        permission = PermissionTypes.objects.get(name='creator')
        StoryCollaborator.objects.create(permission_type=permission, user=self.context['request'].user, story=story)
        for page in outline_json.get('pages', []):
            page_id = page.get('id', None)
            page = StoryPage.objects.create(id=page_id, story=story)
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
        fields = ('outline', 'is_public', 'annotations', 'collaborators', 'title', 'pages') + BaseModelSerializer.Meta.fields
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
        

