from rest_framework import permissions

class ModPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user.customuser_related.get()
        if user in obj.moderators.all():
            return True
        else:
            return False



