from rest_framework.permissions import BasePermission

from .models import RolePermission

ACTION_FOR_METHOD = {
    'GET': 'can_view',
    'HEAD': 'can_view',
    'OPTIONS': 'can_view',
    'POST': 'can_create',
    'PUT': 'can_edit',
    'PATCH': 'can_edit',
    'DELETE': 'can_delete',
}


class HasMenuPermission(BasePermission):
    """Gate a ViewSet by the current user's role permission for `view.menu_key`.

    Views without a `menu_key` attribute are left unrestricted by this class
    (still subject to IsAuthenticated globally).
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        menu_key = getattr(view, 'menu_key', None)
        if menu_key is None:
            return True

        required_action = ACTION_FOR_METHOD.get(request.method)
        if required_action is None:
            return False

        if not user.role_id:
            return False

        try:
            perm = RolePermission.objects.get(role_id=user.role_id, menu__key=menu_key)
        except RolePermission.DoesNotExist:
            return False

        return getattr(perm, required_action, False)
