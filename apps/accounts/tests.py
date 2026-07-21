from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Menu, Role, RolePermission, User


class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='alice', email='alice@example.com', password='s3cret-pass')

    def test_login_returns_tokens(self):
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'alice', 'password': 's3cret-pass'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_rejects_wrong_password(self):
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'alice', 'password': 'wrong'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_requires_authentication(self):
        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_permissions_for_role(self):
        role = Role.objects.create(name='Viewer')
        menu = Menu.objects.get(key='products')
        RolePermission.objects.create(role=role, menu=menu, can_view=True)
        self.user.role = role
        self.user.save()

        self.client.force_authenticate(user=self.user)
        response = self.client.get(reverse('me'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        perm = next(p for p in response.data['permissions'] if p['menu_key'] == 'products')
        self.assertTrue(perm['can_view'])
        self.assertFalse(perm['can_create'])

    def test_superuser_has_all_permissions(self):
        superuser = User.objects.create_superuser(username='root', email='root@example.com', password='x')

        self.client.force_authenticate(user=superuser)
        response = self.client.get(reverse('me'))

        perm = next(p for p in response.data['permissions'] if p['menu_key'] == 'products')
        self.assertTrue(perm['can_view'] and perm['can_create'] and perm['can_edit'] and perm['can_delete'])


class HasMenuPermissionTests(APITestCase):
    """Exercises the permission gate through the real products endpoint."""

    def setUp(self):
        self.menu = Menu.objects.get(key='products')
        self.role = Role.objects.create(name='Viewer')
        RolePermission.objects.create(role=self.role, menu=self.menu, can_view=True, can_create=False)
        self.user = User.objects.create_user(
            username='viewer', email='viewer@example.com', password='x', role=self.role
        )
        self.client.force_authenticate(user=self.user)

    def test_view_allowed_by_role(self):
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_denied_by_role(self):
        response = self.client.post(reverse('product-list'), {'name': 'X', 'price': '1.00', 'quantity': 1})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_without_role_is_denied(self):
        self.user.role = None
        self.user.save()
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RolePermissionMatrixTests(APITestCase):
    def setUp(self):
        self.role = Role.objects.create(name='Manager')
        admin = User.objects.create_superuser(username='root', email='root@example.com', password='x')
        self.client.force_authenticate(user=admin)

    def test_get_permissions_defaults_false_for_unset_menus(self):
        response = self.client.get(reverse('role-permissions', args=[self.role.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), Menu.objects.count())
        self.assertFalse(response.data[0]['can_view'])

    def test_put_permissions_upserts_matrix(self):
        products_menu = Menu.objects.get(key='products')
        payload = [
            {'menu_id': products_menu.id, 'can_view': True, 'can_create': True, 'can_edit': False, 'can_delete': False},
        ]
        response = self.client.put(reverse('role-permissions', args=[self.role.id]), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        row = next(r for r in response.data if r['menu_key'] == 'products')
        self.assertTrue(row['can_view'] and row['can_create'])
        self.assertFalse(row['can_edit'])
