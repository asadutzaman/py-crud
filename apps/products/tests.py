from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product


class ProductApiTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Electronics')

    def test_list_products_empty(self):
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)

    def test_create_product(self):
        payload = {
            'name': 'Keyboard',
            'description': 'Mechanical keyboard',
            'price': '49.99',
            'quantity': 10,
            'category_id': self.category.id,
        }
        response = self.client.post(reverse('product-list'), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(name='Keyboard')
        self.assertEqual(product.price, Decimal('49.99'))
        self.assertEqual(product.category_id, self.category.id)

    def test_stats_reports_low_stock_and_category_breakdown(self):
        Product.objects.create(
            name='Low Stock Item', price='9.99', quantity=2, category=self.category
        )
        Product.objects.create(name='Uncategorized Item', price='19.99', quantity=20)

        response = self.client.get(reverse('product-stats'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_products'], 2)
        self.assertEqual(response.data['low_stock_count'], 1)
        breakdown = {row['name']: row for row in response.data['category_breakdown']}
        self.assertEqual(breakdown['Electronics']['total_products'], 1)
        self.assertEqual(breakdown['Uncategorized']['total_products'], 1)


class CategoryApiTests(APITestCase):
    def test_product_count_reflects_assigned_products(self):
        category = Category.objects.create(name='Furniture')
        Product.objects.create(name='Chair', price='20.00', quantity=5, category=category)
        Product.objects.create(name='Table', price='80.00', quantity=3, category=category)

        response = self.client.get(reverse('category-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(row for row in response.data if row['name'] == 'Furniture')
        self.assertEqual(result['product_count'], 2)
