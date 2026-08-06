from django.db import transaction
from django.db.models import Count, F
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, Product, StockMovement
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    StockAdjustmentInputSerializer,
    StockMovementSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name',)
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(product_count=Count('products')).order_by('name')


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('category', 'is_active', 'unit')
    search_fields = ('name', 'barcode')
    ordering_fields = ('name', 'price', 'stock_quantity', 'created_at')
    ordering = ('name',)

    def get_queryset(self):
        return Product.objects.select_related('category').all()

    def get_serializer_class(self):
        if self.action in ('list',):
            return ProductListSerializer
        return ProductDetailSerializer

    @swagger_auto_schema(
        method='get',
        operation_description='Minimum stok seviyesinin altındaki/eşitindeki ürünleri döner.',
    )
    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        queryset = self.get_queryset().filter(
            is_active=True, stock_quantity__lte=F('min_stock_level'),
        )
        serializer = ProductListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @swagger_auto_schema(
        method='post',
        request_body=StockAdjustmentInputSerializer,
        operation_description=(
            'Manuel stok hareketi kaydeder. IN: stoğa ekler, OUT: stoktan düşer '
            '(yetersiz stokta 400 döner), ADJUSTMENT: stoğu verilen miktara eşitler.'
        ),
    )
    @action(detail=True, methods=['post'], url_path='adjust-stock')
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        input_serializer = StockAdjustmentInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        movement_type = input_serializer.validated_data['movement_type']
        quantity = input_serializer.validated_data['quantity']
        reason = input_serializer.validated_data.get('reason', '')

        with transaction.atomic():
            locked_product = Product.objects.select_for_update().get(pk=product.pk)

            if movement_type == StockMovement.MovementType.IN:
                locked_product.stock_quantity = F('stock_quantity') + quantity
            elif movement_type == StockMovement.MovementType.OUT:
                if locked_product.stock_quantity < quantity:
                    return Response(
                        {'detail': f'Yetersiz stok. Mevcut: {locked_product.stock_quantity}'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                locked_product.stock_quantity = F('stock_quantity') - quantity
            else:  # ADJUSTMENT — stoğu doğrudan verilen miktara eşitler
                locked_product.stock_quantity = quantity

            locked_product.save(update_fields=['stock_quantity'])
            locked_product.refresh_from_db()

            movement = StockMovement.objects.create(
                product=locked_product,
                movement_type=movement_type,
                quantity=quantity,
                reason=reason,
                created_by=request.user,
            )

        return Response(
            {
                'product': ProductDetailSerializer(locked_product, context={'request': request}).data,
                'movement': StockMovementSerializer(movement, context={'request': request}).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    """Salt-okunur — stok hareketleri sadece adjust-stock ve satış akışı üzerinden oluşur."""

    serializer_class = StockMovementSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('product', 'movement_type')
    ordering = ('-created_at',)

    def get_queryset(self):
        return StockMovement.objects.select_related('product', 'created_by').all()
