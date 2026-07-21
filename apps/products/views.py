from django.db.models import Count, F, Q, Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import HasMenuPermission

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

LOW_STOCK_THRESHOLD = 5


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(product_count=Count('products'))
    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = [IsAuthenticated, HasMenuPermission]
    menu_key = 'categories'


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, HasMenuPermission]
    menu_key = 'products'

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        total_inventory_value = qs.aggregate(total=Sum(F('price') * F('quantity')))['total'] or 0
        recent = qs.order_by('-updated_at')[:5]

        by_category = (
            qs.values('category_id', 'category__name')
            .annotate(
                total=Count('id'),
                low_stock=Count('id', filter=Q(quantity__lt=LOW_STOCK_THRESHOLD)),
            )
            .order_by('category__name')
        )
        category_breakdown = [
            {
                'id': row['category_id'],
                'name': row['category__name'] or 'Uncategorized',
                'total_products': row['total'],
                'low_stock_count': row['low_stock'],
            }
            for row in by_category
        ]

        return Response({
            'total_products': qs.count(),
            'total_inventory_value': total_inventory_value,
            'low_stock_count': qs.filter(quantity__lt=LOW_STOCK_THRESHOLD).count(),
            'recent_products': ProductSerializer(recent, many=True).data,
            'category_breakdown': category_breakdown,
        })
