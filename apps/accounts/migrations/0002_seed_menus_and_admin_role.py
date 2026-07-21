from django.db import migrations

MENUS = [
    {'key': 'dashboard', 'label': 'Dashboard', 'icon': 'LayoutDashboard', 'path': '/', 'order': 0},
    {'key': 'products', 'label': 'Products', 'icon': 'Package', 'path': '/products', 'order': 1},
    {'key': 'categories', 'label': 'Categories', 'icon': 'Tags', 'path': '/categories', 'order': 2},
    {'key': 'customers', 'label': 'Customers', 'icon': 'Users', 'path': '/customers', 'order': 3},
    {'key': 'users', 'label': 'Users', 'icon': 'UserCog', 'path': '/users', 'order': 4},
    {'key': 'roles', 'label': 'Roles', 'icon': 'ShieldCheck', 'path': '/roles', 'order': 5},
]


def seed(apps, schema_editor):
    Menu = apps.get_model('accounts', 'Menu')
    Role = apps.get_model('accounts', 'Role')
    RolePermission = apps.get_model('accounts', 'RolePermission')

    menus = [Menu.objects.create(**data) for data in MENUS]

    admin_role = Role.objects.create(name='Admin', description='Full access to every menu and action.')
    for menu in menus:
        RolePermission.objects.create(
            role=admin_role, menu=menu, can_view=True, can_create=True, can_edit=True, can_delete=True
        )


def unseed(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    Menu = apps.get_model('accounts', 'Menu')
    Role.objects.filter(name='Admin').delete()
    Menu.objects.filter(key__in=[m['key'] for m in MENUS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
