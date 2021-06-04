# Manual one-time data migrate to move from stories database 
from stories.models import UserAnnotations
import typing
import logging
import json
import uuid
from django.db import migrations
from django.utils.timezone import make_aware
from presalytics.story.outline import StoryOutline
if typing.TYPE_CHECKING:
    from ..models import Story
    from api.models import BaseModel


logger = logging.getLogger(__name__)

def add_timezone_awareness(obj: 'BaseModel'):
    obj.created_at = make_aware(obj.created_at)
    obj.updated_at = make_aware(obj.updated_at)
    return obj


def get_existing_stories(apps, schema_editor):

    # Stories
    Story = apps.get_model('stories', 'Story')
    old_stories = Story.objects.using('storyv1').raw(
        """
        SELECT id,
            is_public,
            title,
            created_by as created_by_id,
            updated_by as updated_by_id,
            created_at,
            updated_at
        FROM story;  
        """
    )
    for s in old_stories:
        s = add_timezone_awareness(s)
        s.save(using='default')
    

    # Outlines
    Outline = apps.get_model('stories', 'Outline')
    StoryPage = apps.get_model('stories', 'StoryPage')
    outlines = Outline.objects.using('storyv1').raw(
        """
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        SELECT 
            uuid_generate_v4() as id,
            id as story_id, 
            outline as document, 
            0 as latest_patch_sequence,
            created_at,
            updated_at,
            created_by as created_by_id,
            updated_by as updated_by_id
        FROM story
		WHERE outline IS NOT NULL;
        """
    )

    for o in outlines:
        o.document = StoryOutline.load(o.document)
        o.id = o.id or uuid.uuid4()
        o.document.id = str(o.id)
        for i in range(0, len(o.document.pages)):
            page = o.document.pages[i]
            id = page.id or uuid.uuid4()
            sp = StoryPage.objects.using('default').create(id=str(id), story_id=str(o.story_id))
            sp.save()
            o.document.pages[i].id = id
        o = add_timezone_awareness(o)
        o.save(using='default')

    # Ooxml Documents
    OoxmlDocument = apps.get_model('stories', 'OoxmlDocument')
    ooxmldocs = OoxmlDocument.objects.using('storyv1').raw(
        """
        SELECT
            id,
            created_by as created_by_id,
            updated_by as updated_by_id,
            delete_target_on_story_delete,
            ooxml_automation_id,
            story_id,
            created_at,
            updated_at,
            null::uuid as cloned_from
        FROM ooxml_document;
        """
    )
    for o in ooxmldocs:
        o = add_timezone_awareness(o)
        o.save(using='default')

    # Collaborators

    StoryCollaborator = apps.get_model('stories', 'StoryCollaborator')
    scs = StoryCollaborator.objects.using('storyv1').raw(
        """
        SELECT
            id,
            user_id,
            story_id,
            permission_type_id,
            created_at,
            updated_at,
            created_by as created_by_id,
            updated_by as updated_by_id
        FROM story_collaborator
        WHERE user_id IS NOT NULL AND story_id IS NOT NULL;
        """
    )
    for sc in scs:
        sc = add_timezone_awareness(sc)
        sc.save(using='default')
        UserAnnotations.objects.create(id=uuid.uuid4(), collaborator_id=sc.id, is_favorite=False)


def reverse_op(apps, schema_editor):
    Story = apps.get_model('stories', 'Story')
    Story.objects.all().delete()



class Migration(migrations.Migration):

    dependencies = [
        ('stories', '0007_auto_20210602_0508'),
    ]

    operations = [
        migrations.RunPython(get_existing_stories, reverse_op)
    ]
