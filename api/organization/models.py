from django.db import models
from django.db.models.fields import related
from api.models import BaseModel
from django.conf import settings
# Create your models here.

class Organization(BaseModel):
    name = models.CharField(max_length=256)


class OrganizationMemberTypes(models.TextChoices):
    ADMIN = 'admin'
    BUILDER = 'builder'
    VIEWER = 'viewer'

class OrganizationMember(BaseModel):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='members')
    user_id = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='organization_members')
    type = models.CharField(max_length=16, choices=OrganizationMemberTypes.choices, default=OrganizationMemberTypes.BUILDER)
    

