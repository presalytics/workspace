# Generated by Django 3.1.4 on 2021-10-28 17:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='accountplan',
            name='name',
            field=models.CharField(blank=True, default=None, max_length=256, null=True),
        ),
    ]
