from rest_framework import serializers

from .models import Menu, Role, RolePermission, User


class MenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = Menu
        fields = ['id', 'key', 'label', 'icon', 'path', 'order']


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class MenuPermissionSerializer(serializers.Serializer):
    """One row of a Role's Menu x Action permission matrix."""

    menu_id = serializers.IntegerField()
    menu_key = serializers.CharField(read_only=True)
    menu_label = serializers.CharField(read_only=True)
    can_view = serializers.BooleanField(default=False)
    can_create = serializers.BooleanField(default=False)
    can_edit = serializers.BooleanField(default=False)
    can_delete = serializers.BooleanField(default=False)


class RoleSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    role = RoleSummarySerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        source='role', queryset=Role.objects.all(), write_only=True, required=False, allow_null=True
    )
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_id', 'password', 'is_active', 'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({'password': 'This field is required when creating a user.'})
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MeSerializer(serializers.ModelSerializer):
    role = RoleSummarySerializer(read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_superuser', 'role', 'permissions']

    def get_permissions(self, user):
        menus = Menu.objects.all()
        if user.is_superuser:
            return [
                {
                    'menu_key': menu.key,
                    'menu_label': menu.label,
                    'icon': menu.icon,
                    'path': menu.path,
                    'can_view': True,
                    'can_create': True,
                    'can_edit': True,
                    'can_delete': True,
                }
                for menu in menus
            ]

        perms_by_menu = {}
        if user.role_id:
            perms_by_menu = {
                rp.menu_id: rp
                for rp in RolePermission.objects.filter(role_id=user.role_id)
            }

        result = []
        for menu in menus:
            rp = perms_by_menu.get(menu.id)
            result.append({
                'menu_key': menu.key,
                'menu_label': menu.label,
                'icon': menu.icon,
                'path': menu.path,
                'can_view': bool(rp and rp.can_view),
                'can_create': bool(rp and rp.can_create),
                'can_edit': bool(rp and rp.can_edit),
                'can_delete': bool(rp and rp.can_delete),
            })
        return result
