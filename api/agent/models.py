from django.db import models
from api.models import BaseModel
from django.conf import settings

# Create your models here.


class AgentScopeChoices(models.TextChoices):
    USER = 'user'
    TEAM = 'team'
    ORGANIZATION = 'organization'


class Agent(BaseModel):
    name = models.CharField(max_length=256)
    scope = models.CharField(max_length=16, choices=AgentScopeChoices.choices, default=AgentScopeChoices.USER)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, default=None)
    team = models.ForeignKey('teams.Team', on_delete=models.SET_NULL, blank=True, null=True, default=None)
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, blank=True, null=True, default=None)


class ConnectionTypeChoices(models.TextChoices):
    POSTGRES = 'postgres'
    REDSHIFT = 'redshift'
    BIGQUERY = 'bigquery'
    SNOWFLAKE = 'snowflake'
    DYNAMODB = 'dynamodb'


class Connection(BaseModel):
    name = models.CharField(max_length=256)
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name='connections')
    connection_string = models.CharField(max_length=4096, null=False)
    connection_type = models.CharField(max_length=32, choices=ConnectionTypeChoices.choices, null=False)
