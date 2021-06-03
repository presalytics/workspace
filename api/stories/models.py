import typing
from uuid import uuid4
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.db import transaction
from presalytics.story.outline import OutlineDecoder, OutlineEncoder
from api.models import BaseModel
from stories.tasks import (
    sync_outlines_to_latest_patches,
    upload_new_ooxml_document
)
if typing.TYPE_CHECKING:
    from users.models import PresalyticsUser


# Create your models here.

class Story(BaseModel):
    annotations: typing.Union[models.Manager, 'UserAnnotations']
    pages: typing.Union[models.Manager, 'StoryPage']
    outline: typing.Union[models.Manager, 'Outline']
    collaborators: typing.Union[models.Manager, 'StoryCollaborator']
    is_public = models.BooleanField(default=False)
    title = models.CharField(max_length=1024, blank=True, null=True)
    

class Outline(BaseModel):
    patches: typing.Union[models.Manager, 'OutlinePatches']
    story = models.OneToOneField(Story, on_delete=models.CASCADE)
    latest_patch_sequence = models.IntegerField(null=False)
    document = models.JSONField(null=False, encoder=OutlineEncoder, decoder=OutlineDecoder)

class OutlinePatches(BaseModel):

    outline = models.ForeignKey(Outline, models.CASCADE, related_name='patches')
    jsondiffpatch = models.JSONField(null=False, encoder=OutlineEncoder, decoder=OutlineDecoder) # reversible patch instruction for the [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) package
    rfc_6902_patch = models.JSONField(null=False, encoder=OutlineEncoder, decoder=OutlineDecoder) # RFC6902 compliant JSON patch instructions (not necessarily reversible), used for maintainence of outline on server-side
    sequence = models.IntegerField()
    patch_is_applied = models.BooleanField(default=False)


@receiver(post_save, sender=OutlinePatches)
def handle_outline_changes_post_save(**kwargs):
    transaction.on_commit(sync_outlines_to_latest_patches.apply_async(args=tuple(), kwargs={'queue': 'workspace'}))  #type: ignore
    

class UserAnnotations(BaseModel):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='annotations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, related_name='user')
    is_favorite = models.BooleanField(default=False)


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
    story = models.ForeignKey(Story, models.SET_NULL, null=True, blank=True, default=None)
    cloned_from = models.UUIDField(blank=True, null=True, default=None)

    @classmethod
    def create_with_file(cls, file, story, user):
        ooxml = OoxmlDocument.objects.create(story=story)
        ooxml.refresh_from_db()
        upload_new_ooxml_document.apply_async(args=(file.file, file.filename, user.id, oomxl.id), kwargs={'queue': 'workspace'})  # type: ignore
        return ooxml


class PermissionTypes(BaseModel):
    name = models.CharField(max_length=20, blank=True, null=True)
    can_edit = models.BooleanField(blank=True, null=True)
    can_view = models.BooleanField(blank=True, null=True)
    can_add_collaborators = models.BooleanField(blank=True, null=True)
    can_delete = models.BooleanField(blank=True, null=True)


class StoryCollaborator(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING)
    story = models.ForeignKey(Story, models.CASCADE)
    permission_type = models.ForeignKey(PermissionTypes, models.SET_NULL, blank=True, null=True)
