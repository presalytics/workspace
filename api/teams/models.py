import typing
from django.db import models
from django.conf import settings
from api.models import BaseModel


class TeamTypeChoices(models.TextChoices):
    INTERNAL = 'internal'  # Only members of the user's orgnaization can be invited to join
    INVITE_ONLY = 'invite_only'  # Members must be invited
    PUBLIC = 'public'  # anyone can join


class Team(BaseModel):
    members: typing.Union[models.Manager, 'TeamMember']
    team_type = models.CharField(max_length=32, choices=TeamTypeChoices.choices)
    organization = models.ForeignKey('organization.Organization', null=True, blank=True, on_delete=models.SET_NULL, related_name='teams')
    name = models.CharField(max_length=512)
    description = models.TextField(max_length=4096)


class TeamUserRoleChoices(models.TextChoices):
    ADMIN = 'admin'  # Can change team settings and delete teams, granted to team creator
    PROMOTER = 'promoter'  # Can add users to a team
    COLLABORATOR = 'collaborator'  # can collaborate on team content


class TeamMember(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='team_users', unique=False, null=False, on_delete=models.CASCADE)
    role = models.CharField(max_length=32, choices=TeamUserRoleChoices.choices, null=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
