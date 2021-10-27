from rest_framework import permissions


class EventsPermission(permissions.BasePermission):

    def has_permission(self, request, view):
        if not request.user:
            return False
        roles = request.user.presalytics_roles.all()
        if request.method == 'GET':
            if 'viewer' in roles:
                return True
        else:
            if 'user-int' in roles and 'api-admin' in roles:
                return True
        return False
