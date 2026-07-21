from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Menu, Role, RolePermission, User
from .permissions import HasMenuPermission
from .serializers import (
    MenuPermissionSerializer,
    MenuSerializer,
    MeSerializer,
    RoleSerializer,
    UserSerializer,
)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, HasMenuPermission]
    menu_key = 'roles'

    @action(detail=True, methods=['get', 'put'])
    def permissions(self, request, pk=None):
        role = self.get_object()

        if request.method == 'PUT':
            serializer = MenuPermissionSerializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            for row in serializer.validated_data:
                RolePermission.objects.update_or_create(
                    role=role,
                    menu_id=row['menu_id'],
                    defaults={
                        'can_view': row.get('can_view', False),
                        'can_create': row.get('can_create', False),
                        'can_edit': row.get('can_edit', False),
                        'can_delete': row.get('can_delete', False),
                    },
                )

        return Response(self._permission_matrix(role))

    def _permission_matrix(self, role):
        existing = {rp.menu_id: rp for rp in role.permissions.all()}
        data = []
        for menu in Menu.objects.all():
            rp = existing.get(menu.id)
            data.append({
                'menu_id': menu.id,
                'menu_key': menu.key,
                'menu_label': menu.label,
                'can_view': bool(rp and rp.can_view),
                'can_create': bool(rp and rp.can_create),
                'can_edit': bool(rp and rp.can_edit),
                'can_delete': bool(rp and rp.can_delete),
            })
        return data


class MenuViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Menu.objects.all()
    serializer_class = MenuSerializer
    pagination_class = None
    permission_classes = [IsAuthenticated, HasMenuPermission]
    menu_key = 'roles'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasMenuPermission]
    menu_key = 'users'


class MeView(RetrieveAPIView):
    serializer_class = MeSerializer

    def get_object(self):
        return self.request.user
