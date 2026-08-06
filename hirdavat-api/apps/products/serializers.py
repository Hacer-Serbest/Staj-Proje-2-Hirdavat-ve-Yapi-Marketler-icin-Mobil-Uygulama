from decimal import Decimal

from rest_framework import serializers

from .models import Category, Product, StockMovement


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'product_count', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """Ürün grid/liste görünümü için hafif serializer (POS ekranı, katalog vb.)."""

    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'category_name', 'barcode', 'unit',
            'price', 'wholesale_price', 'stock_quantity', 'min_stock_level',
            'is_low_stock', 'image', 'is_active',
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'category_name', 'barcode', 'unit',
            'cost_price', 'price', 'wholesale_price',
            'stock_quantity', 'min_stock_level', 'is_low_stock',
            'image', 'is_active', 'created_at', 'updated_at',
        )
        read_only_fields = ('stock_quantity',)

    def validate_barcode(self, value):
        if value == '':
            return None
        return value


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = StockMovement
        fields = (
            'id', 'product', 'product_name', 'movement_type', 'quantity',
            'reason', 'created_by', 'created_by_username', 'created_at',
        )
        read_only_fields = ('created_by',)


class StockAdjustmentInputSerializer(serializers.Serializer):
    """POST /api/products/{id}/adjust-stock/ için giriş şeması."""

    movement_type = serializers.ChoiceField(choices=StockMovement.MovementType.choices)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)
