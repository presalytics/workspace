from django.contrib import auth
from rest_framework import permissions
import presalytics
import presalytics.client
import presalytics.client.oidc


class PresalyticsViewerPermission(permissions.BasePermission):
    message = 'You must be a registered Presalytics user with the "Viewer" permssion to access this enpoint'

    def has_permission(self, request, view):
        if request.user:
            roles = request.user.presalytics_roles.all()
            for r in roles:
                if 'viewer' in r.role:
                    return True
        return False


class PresaltyicsBuilderPermission(permissions.BasePermission):
    message = 'You must be a registered Presalytics user with the "Viewer" permssion to access this enpoint'

    def has_permission(self, request, view):
        if request.user:
            roles = request.user.presalytics_roles.all()
            if request.method in permissions.SAFE_METHODS:
                for r in roles:
                    if 'viewer' in r.role:
                        return True
            else:
                for r in roles:
                    if 'builder' in r.role:
                        return True

        return False


class PresalyticsInternalPermssion(permissions.BasePermission):
    message = "This endpoint is restricted to Presalytics internal use."

    def has_permission(self, request, view):
        if request.user.is_authenticated:
            roles = request.user.presalytics_roles.all()
            for r in roles:
                if 'internal' in r.role:
                    return True
        else:
            auth_header = request.headers.get('Authorization', None)
            if auth_header:
                token = None
                try:
                    token = auth_header.lstrip("Bearer").strip()
                except Exception:
                    pass
                if token:
                    payload = presalytics.client.oidc.OidcClient().validate_token(token)
                    if 'user-int' in payload["permissions"]:
                        return True
        return False
