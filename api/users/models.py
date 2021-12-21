import presalytics
import typing
import datetime
import presalytics.client
import presalytics.client.oidc
from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import CustomUserManager
if typing.TYPE_CHECKING:
    from user_sessions.models import Session


class PresalyticsUser(AbstractUser):

    class UserInfo:
        def __init__(self, *args, **kwargs):
            self.email = kwargs.get("email", None)
            self.picture = kwargs.get("picture", None)

    info: UserInfo
    access_token: str

    id = models.UUIDField(primary_key=True, null=False, unique=True)
    username = models.CharField(max_length=30, unique=False, blank=True, null=True, default=None)
    email = models.EmailField(max_length=255, unique=False, blank=True, null=True, default=None)

    presalytics_roles: typing.Union[models.Manager, 'Role']
    presalytics_scopes: typing.Union[models.Manager, 'Scope']
    session_set: typing.Union[models.Manager, 'Session']

    USERNAME_FIELD = 'id'
    REQUIRED_FIELDS: typing.Sequence[str] = []

    objects: CustomUserManager = CustomUserManager()

    def __str__(self):
        return str(self.id)

    @classmethod
    def get_or_create(cls, token):
        oidc_client = presalytics.client.oidc.OidcClient()
        payload = oidc_client.validate_token(token)
        api_user_id = oidc_client.get_user_id(token)
        # Service tokens won't have user ids
        if not api_user_id:
            return None
        user = None
        try:
            user = cls.objects.get(id=api_user_id)
        except cls.DoesNotExist:
            user = cls.objects.create_user(**{"id": api_user_id})
        role_changes = user.update_roles(payload["https://api.presalytics.io/roles"])
        scope_changes = user.update_scopes(payload['permissions'])
        setattr(user, "access_token", token)
        setattr(user, "info", cls.UserInfo(payload))
        if role_changes or scope_changes:
            user.refresh_from_db()
        return user

    @property
    def presalytics_user_id(self):
        return str(self.id)

    @property
    def token(self) -> typing.Optional[str]:
        token = None
        session = self.session_set.filter(expire_date__gt=datetime.datetime.now()).order_by('-expire_date').first()  # type: ignore
        if session:
            token = session.get_decoded().get('access_token', None)
            if not token:
                session.delete()
            return token  # type: ignore
        else:
            return None

    def update_roles(self, roles_list: typing.Sequence[str]) -> bool:
        changes = False
        current_roles = [x.role for x in self.presalytics_roles.all()]  # type: ignore
        for r in roles_list:
            if r not in current_roles:
                new_role = Role.objects.create(role=r, user=self)
                new_role.save()
                changes = True
        expired_roles = [x for x in self.presalytics_roles.all() if x.role not in roles_list]  # type: ignore
        for er in expired_roles:
            er.objects.delete()
            changes = True
        return changes

    def update_scopes(self, scopes_list: typing.Sequence[str]) -> bool:
        changes = False
        current_scopes = [x.scope for x in self.presalytics_scopes.all()]  # type: ignore
        for s in scopes_list:
            if s not in current_scopes:
                new_scope = Scope.objects.create(scope=s, user=self)
                new_scope.save()
                changes = True
        expired_scopes = [x for x in self.presalytics_scopes.all() if x.scope not in scopes_list]  # type: ignore
        for es in expired_scopes:
            es.objects.delete()
            changes = True
        return changes

    def get_related_users(self, scope='direct') -> typing.Sequence['PresalyticsUser']:
        user_maps = UserMap.objects.filter(user_id=self.id)
        ids = [um.related_user_id for um in user_maps]
        return list(self.__class__.objects.filter(id__in=ids))


class Scope(models.Model):
    user = models.ForeignKey(PresalyticsUser, on_delete=models.CASCADE, related_name="presalytics_scopes")
    scope = models.CharField(max_length=64)


class Role(models.Model):
    user = models.ForeignKey(PresalyticsUser, on_delete=models.CASCADE, related_name="presalytics_roles")
    role = models.CharField(max_length=64)


class UserResource(models.Model):
    resource_id = models.UUIDField(primary_key=True, unique=False)
    user_id = models.UUIDField()
    resource_type = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = "users_resources_vw"


class UserMap(models.Model):
    user_id = models.UUIDField(primary_key=True, unique=False)
    related_user_id = models.UUIDField()
    resource_id = models.UUIDField()
    resource_type = models.CharField(max_length=64)
    relationship_scope = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = "users_user_map_vw"
