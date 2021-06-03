# Manual one-time data migrate to move from stories database 
import logging
from django.core.management import call_command
from django.db import migrations, transaction


logger = logging.getLogger(__name__)


fixture = 'permission_types'


def get_permission_types(apps, schema_editor):
    call_command('loaddata', fixture, app_label='stories')


def reverse_op(apps, schema_editor):
    PermissionTypes = apps.get_model('stories', 'PermissionTypes')
    PermissionTypes.objects.all().delete()



class Migration(migrations.Migration):

    dependencies = [
        ('stories', '0003_auto_20210603_0646'),
    ]

    operations = [
        migrations.RunPython(get_permission_types, reverse_op)
    ]
