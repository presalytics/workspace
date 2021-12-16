import typing
import jsonpatch
from uuid import uuid4
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db import transaction
from rest_framework.exceptions import APIException
from presalytics.story.outline import OutlineDecoder, OutlineEncoder, StoryOutline
from presalytics.lib.exceptions import ValidationError
from api.models import BaseModel
from stories.tasks import (
    sync_outlines_to_latest_patches,
    upload_new_ooxml_document
)
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


# Create your models here.

class Story(BaseModel):
    pages: typing.Union[models.Manager, 'StoryPage']
    outline: typing.Union['Outline']
    collaborators: typing.Union[models.Manager, 'StoryCollaborator']
    ooxml_documents: typing.Union[models.Manager, 'OoxmlDocument']
    is_public = models.BooleanField(default=False)
    title = models.CharField(max_length=1024, blank=True, null=True)
    

class Outline(BaseModel):
    patches: typing.Union[models.Manager, 'OutlinePatches']
    story = models.OneToOneField(Story, on_delete=models.CASCADE)
    latest_patch_sequence = models.IntegerField(null=False)
    document = models.JSONField(null=False)

    class InvalidPatchBadRequest(APIException):
        status_code = 400
        default_detail = "The submitted patch results in an invalid out document.  Please adjust your request and try again."
        default_code = "bad_request"

    def apply_patch(self, rfc_6902_patch):
        try:
            outline_dct = self.document
            if isinstance(outline_dct, StoryOutline):
                outline_dct = outline_dct.to_dict()
            updated_outline_dct = jsonpatch.apply_patch(outline_dct, rfc_6902_patch)
            updated_outline = StoryOutline.deserialize(updated_outline_dct)
            updated_outline.validate()
            self.document = updated_outline
            self.latest_patch_sequence += 1
            self.save()
            return self
        except ValidationError:
            raise self.InvalidPatchBadRequest()




class OutlinePatches(BaseModel):

    outline = models.ForeignKey(Outline, models.CASCADE, related_name='patches')
    jsondiffpatch = models.JSONField(null=False, encoder=OutlineEncoder, decoder=OutlineDecoder) # reversible patch instruction for the [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) package
    rfc_6902_patch = models.JSONField(null=False, encoder=OutlineEncoder, decoder=OutlineDecoder) # RFC6902 compliant JSON patch instructions (not necessarily reversible), used for maintainence of outline on server-side
    sequence = models.IntegerField()
    patch_is_applied = models.BooleanField(default=False)


class StoryPage(BaseModel):
    comments: typing.Union[models.Manager, 'Comment']
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='pages')
    created_from = models.UUIDField(null=True, blank=True, default=None)


class Comment(BaseModel):
    page = models.ForeignKey(StoryPage, on_delete=models.CASCADE, related_name='comments')
    dom_selector = models.CharField(max_length=256)
    text = models.TextField(max_length=4096)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)


# class CustomEvent(models.Model):
#     id = models.UUIDField(primary_key=True)
#     created_by = models.UUIDField(blank=True, null=True)
#     updated_by = models.UUIDField(blank=True, null=True)
#     story = models.ForeignKey(Story, models.DO_NOTHING)
#     name = models.CharField(max_length=36, blank=True, null=True)
#     is_enabled = models.BooleanField(blank=True, null=True)
#     is_chat_hidden = models.BooleanField()
#     is_notify_enabled = models.BooleanField()
#     attributes = models.JSONField(blank=True, null=True)
#     dom_selectors = models.JSONField(blank=True, null=True)
#     chat_prompt = models.CharField(max_length=2048, blank=True, null=True)
#     callback = models.CharField(max_length=256, blank=True, null=True)
#     event_type = models.CharField(max_length=256)
#     created_at = models.DateTimeField(blank=True, null=True)
#     updated_at = models.DateTimeField(blank=True, null=True)


class OoxmlDocument(BaseModel):
    delete_target_on_story_delete = models.BooleanField(default=False)
    ooxml_automation_id = models.UUIDField(blank=True, null=True, default=None)
    story = models.ForeignKey(Story, models.SET_NULL, null=True, blank=True, default=None, related_name='ooxml_documents')
    cloned_from = models.UUIDField(blank=True, null=True, default=None)

    @classmethod
    def create_with_file(cls, file, story, user):
        ooxml = OoxmlDocument.objects.create(story=story)
        ooxml.refresh_from_db()
        upload_new_ooxml_document.apply_async(args=(file.file, file.filename, user.id, oomxl.id), queue='workspace')  # type: ignore
        return ooxml


class PermissionTypes(BaseModel):
    name = models.CharField(max_length=20, blank=True, null=True)
    can_edit = models.BooleanField(blank=True, null=True)
    can_view = models.BooleanField(blank=True, null=True)
    can_add_collaborators = models.BooleanField(blank=True, null=True)
    can_delete = models.BooleanField(blank=True, null=True)


def create_default_annotation():
    return UserAnnotations.objects.create(is_favorite=False)

def get_default_permission_type():
    return PermissionTypes.objects.get(name='viewer')

class StoryCollaborator(BaseModel):
    annotation: typing.Union[models.Manager, 'UserAnnotations']
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    story = models.ForeignKey(Story, models.CASCADE, related_name='collaborators')
    permission_type = models.ForeignKey(PermissionTypes, models.SET_NULL, blank=True, null=True, default=get_default_permission_type)
    

class UserAnnotations(BaseModel):
    collaborator = models.OneToOneField(StoryCollaborator, models.CASCADE, related_name='annotation')
    is_favorite = models.BooleanField(default=False)


@receiver(post_save, sender=StoryCollaborator)
def handle_story_collaborator_post_save(sender, instance, created, **kwargs):
    if created:
        UserAnnotations.objects.create(collaborator=instance, is_favorite=False)
