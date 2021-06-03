# Manual one-time data migrate to move from stories database 
import typing
import logging
import json
import uuid
from django.db import migrations
from presalytics.story.outline import StoryOutline
if typing.TYPE_CHECKING:
    from ..models import Story


logger = logging.getLogger(__name__)

def forwards(apps, schema_editor):
    # Users
    Users = apps.get_model('users', 'PresalyticsUser')
    current_db_users = Users.objects.using('default').all()
    current_user_ids = [str(c.id) for c in current_db_users]
    user_data =  Users.objects.using('storyv1').raw(
        """
        SELECT DISTINCT user_id as id FROM story_collaborator WHERE user_id IS NOT NULL
            UNION
        SELECT DISTINCT updated_by as id FROM story WHERE updated_by IS NOT NULL

            UNION
        SELECT DISTINCT updated_by as id FROM ooxml_document WHERE updated_by IS NOT NULL
            UNION
        SELECT DISTINCT updated_by as id FROM story WHERE updated_by IS NOT NULL;
        """)
    for odu in user_data:
        if str(odu.id) not in current_user_ids:
            u = Users.objects.create(id=str(odu.id))           
            


def backwards(apps, schema_edtitor):
    return

class Migration(migrations.Migration):

    dependencies = [
        ('stories', '0004_auto_20210531_2029'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards)
    ]
