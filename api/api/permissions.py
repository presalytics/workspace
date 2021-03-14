from rest_framework import permissions

class PresalyticsViewerPermission(permissions.BasePermission):
    message = 'You must be a registered Presalytics user with the "Viewer" permssion to access this enpoint'

    def has_permission(self, request, view):
        if request.user:
            if hasattr(request.user, 'presalytics_roles'):
                return 'viewer' in request.user.presalytics_roles
        return False


class PresaltyicsBuilderPermission(permissions.BasePermission):
    message = 'You must be a registered Presalytics user with the "Viewer" permssion to access this enpoint'

    def has_permission(self, request, view):
        if request.user:
            if hasattr(request.user, 'presalytics_roles'):
                return 'builder' in request.user.presalytics_roles
        return False


class PresalyticsInternalPermssion(permissions.BasePermission):
    message = "This endpoint is restricted to Presalytics internal use."

    def has_permission(self, request, view):
        if request.user:
            if hasattr(request.user, 'presalytics_roles'):
                return 'internal' in request.user.presalytics_roles
        return False