from django.db.models.fields.related import ForeignKey
import presalytics
import typing
import presalytics.client
import presalytics.client.oidc
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import ugettext_lazy as _
from .managers import CustomUserManager


class PresalyticsUser(AbstractUser):
    id = models.UUIDField(primary_key=True, null=False)

    presalytics_roles: typing.Sequence['Role']
    presalytics_scopes: typing.Sequence['Scope']


    USERNAME_FIELD = 'id'
    REQUIRED_FIELDS = []

    objects: CustomUserManager = CustomUserManager()

    def __str__(self):
        return self.presalytics_user_id

    @classmethod
    def get_or_create(cls, token):
        oidc_client = presalytics.client.oidc.OidcClient() 
        payload = oidc_client.validate_token(token)
        api_user_id = oidc_client.get_user_id(token)
        user = None
        try:
            user = cls.objects.get(presalytics_user_id=api_user_id)
        except cls.DoesNotExist:
            user = cls.objects.create_user(**{"presalytics_user_id": api_user_id})
        role_changes = user.update_roles(payload["https://api.presalytics.io/roles"])
        scope_changes = user.update_scopes(payload['permissions'])
        if role_changes or scope_changes:
            user.refresh_from_db()
        return user

    @property
    def presalytics_user_id(self):
        return str(self.id)

    def update_roles(self, roles_list: typing.Sequence[str]) -> bool:
        changes = False
        current_roles = [x.role for x in self.presalytics_roles]
        for r in roles_list:
            if r not in current_roles:
                new_role = Role.objects.create(role=r, api_user_id=self.id)
                new_role.save()
                changes = True
        expired_roles = [x for x in self.presalytics_roles if x.role not in roles_list]
        for er in expired_roles:
            er.objects.delete()
            changes = True
        return changes
    
    def update_scopes(self, scopes_list: typing.Sequence[str]) -> bool:
        changes = False
        current_scopes = [x.scope for x in self.presalytics_scopes]
        for s in scopes_list:
            if s not in current_scopes:
                new_role = Scope.objects.create(scope=s, api_user_id=self.id)
                new_role.save()
                changes = True
        expired_scopes = [x for x in self.presalytics_scopes if x.scope not in scopes_list]
        for es in expired_scopes:
            es.objects.delete()
            changes = True
        return changes



class Scope(models.Model):
    api_user_id = models.ForeignKey(PresalyticsUser, on_delete=models.CASCADE, related_name="presalytics_scopes")
    scope = models.CharField(max_length=64)

class Role(models.Model):
    api_user_id = models.ForeignKey(PresalyticsUser, on_delete=models.CASCADE, related_name="presalytics_roles")
    role = models.CharField(max_length=64)



