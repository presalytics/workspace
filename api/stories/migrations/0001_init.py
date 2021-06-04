# Generated by Django 3.1.4 on 2021-06-04 14:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import presalytics.story.outline
import stories.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Story',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='story_created_by', to=settings.AUTH_USER_MODEL)),
                ('is_public', models.BooleanField(default=False)),
                ('title', models.CharField(blank=True, max_length=1024, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='story_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='StoryPage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('story', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pages', to='stories.story')),
                ('created_at', models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='storypage_created_by', to=settings.AUTH_USER_MODEL)),
                ('created_from', models.UUIDField(blank=True, default=None, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='storypage_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Outline',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('latest_patch_sequence', models.IntegerField()),
                ('document', models.JSONField(decoder=presalytics.story.outline.OutlineDecoder, encoder=presalytics.story.outline.OutlineEncoder)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='outline_created_by', to=settings.AUTH_USER_MODEL)),
                ('story', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='stories.story')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='outline_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='PermissionTypes',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(blank=True, max_length=20, null=True)),
                ('can_edit', models.BooleanField(blank=True, null=True)),
                ('can_view', models.BooleanField(blank=True, null=True)),
                ('can_add_collaborators', models.BooleanField(blank=True, null=True)),
                ('can_delete', models.BooleanField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='permissiontypes_created_by', to=settings.AUTH_USER_MODEL)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='permissiontypes_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='StoryCollaborator',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='storycollaborator_created_by', to=settings.AUTH_USER_MODEL)),
                ('permission_type', models.ForeignKey(blank=True, default=stories.models.get_default_permission_type, null=True, on_delete=django.db.models.deletion.SET_NULL, to='stories.permissiontypes')),
                ('story', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='collaborators', to='stories.story')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='storycollaborator_updated_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('dom_selector', models.CharField(max_length=256)),
                ('text', models.TextField(max_length=4096)),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='stories.storypage')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('created_at', models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='comment_created_by', to=settings.AUTH_USER_MODEL)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='comment_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='OoxmlDocument',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('delete_target_on_story_delete', models.BooleanField(default=False)),
                ('ooxml_automation_id', models.UUIDField(blank=True, default=None, null=True)),
                ('cloned_from', models.UUIDField(blank=True, default=None, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='ooxmldocument_created_by', to=settings.AUTH_USER_MODEL)),
                ('story', models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ooxml_documents', to='stories.story')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='ooxmldocument_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='OutlinePatches',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('jsondiffpatch', models.JSONField(decoder=presalytics.story.outline.OutlineDecoder, encoder=presalytics.story.outline.OutlineEncoder)),
                ('rfc_6902_patch', models.JSONField(decoder=presalytics.story.outline.OutlineDecoder, encoder=presalytics.story.outline.OutlineEncoder)),
                ('sequence', models.IntegerField()),
                ('patch_is_applied', models.BooleanField(default=False)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='outlinepatches_created_by', to=settings.AUTH_USER_MODEL)),
                ('outline', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='patches', to='stories.outline')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='outlinepatches_updated_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserAnnotations',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False)),
                ('is_favorite', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='userannotations_created_by', to=settings.AUTH_USER_MODEL)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='userannotations_updated_by', to=settings.AUTH_USER_MODEL)),
                ('collaborator', models.OneToOneField(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='annotation', to='stories.storycollaborator')),
            ],
        ),
    ]
