import typing
from django.db import models
from django.conf import settings
from django.db.models.fields import related
from api.models import BaseModel


# Create your models here.

class PlanFeatures(BaseModel):
    plan: typing.Union[models.Manager, 'AccountPlan']
    name = models.CharField(max_length=256)
    max_stories_per_user = models.IntegerField(null=True, blank=True, default=None)
    max_teams_per_plan = models.IntegerField(null=True, blank=True, default=None)
    max_seats = models.IntegerField(default=None, null=True, blank=True)


class AccountPlan(BaseModel):
    name = models.CharField(max_length=256, null=True, blank=True, default=None)
    start_date = models.DateField()
    end_date = models.DateField()
    stripe_plan_id = models.CharField(max_length=64)
    features = models.ForeignKey(PlanFeatures, on_delete=models.SET_NULL, related_name='features', null=True, blank=True, default=None)
    account = models.ForeignKey('Account', on_delete=models.SET_NULL, related_name='plan', null=True, blank=True, default=None)


class Account(BaseModel):
    name = models.CharField(max_length=256)
    plans: typing.List['AccountPlan']
    organization = models.ForeignKey('organization.Organization', on_delete=models.SET_NULL, default=None, blank=True, null=True, related_name='account')
    stripe_account_id = models.CharField(max_length=64)
    account_admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, default=None, blank=True, null=True, related_name='admin_account')
