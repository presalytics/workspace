# Generated by Django 3.1.4 on 2021-03-29 20:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('stories', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='userannotations',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='annotations', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='storypage',
            name='story',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pages', to='stories.story'),
        ),
        migrations.AddField(
            model_name='story',
            name='collaborators',
            field=models.ManyToManyField(to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='comment',
            name='page',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='stories.storypage'),
        ),
        migrations.AddField(
            model_name='comment',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
    ]
