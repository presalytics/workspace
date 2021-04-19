from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.conf import settings
import presalytics
import presalytics.client.oidc


class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        user = self.model(**extra_fields)
        user.save()
        return user

    def get_or_create_user(self, **extra_fields):
        create = False
        user = None
        id = extra_fields.get("user_id", None)
        if id:
            try:
                user = self.get(pk=id)
            except self.model.DoesNotExist:
                create = True
        else:
            create = True
        if create:
            user = self.create_user(**extra_fields)
        return user, create


    def create_superuser(self, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(**extra_fields)

    