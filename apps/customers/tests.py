from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User

from .models import Customer


class CustomerApiTests(APITestCase):
    def setUp(self):
        user = User.objects.create_superuser(username='admin', email='admin@example.com', password='x')
        self.client.force_authenticate(user=user)

    def test_list_customers_empty(self):
        response = self.client.get(reverse('customer-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)

    def test_create_customer(self):
        payload = {'name': 'Jane Doe', 'email': 'jane@example.com', 'phone': '555-1234'}
        response = self.client.post(reverse('customer-list'), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Customer.objects.filter(email='jane@example.com').exists())

    def test_email_must_be_unique(self):
        Customer.objects.create(name='Jane Doe', email='jane@example.com')
        response = self.client.post(reverse('customer-list'), {'name': 'Jane 2', 'email': 'jane@example.com'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_search_by_name(self):
        Customer.objects.create(name='Alice Smith', email='alice@example.com')
        Customer.objects.create(name='Bob Jones', email='bob@example.com')

        response = self.client.get(reverse('customer-list'), {'search': 'Alice'})

        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['name'], 'Alice Smith')
