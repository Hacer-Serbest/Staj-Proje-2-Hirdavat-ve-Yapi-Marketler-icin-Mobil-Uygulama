from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import serializers

from apps.customers.models import Customer, CustomerTransaction
from apps.products.models import Product, StockMovement

from .models import Sale, SaleItem


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit = serializers.CharField(source='product.unit', read_only=True)

    class Meta:
        model = SaleItem
        fields = ('id', 'product', 'product_name', 'unit', 'quantity', 'unit_price', 'line_total')


class SaleListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', default=None, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'customer', 'customer_name', 'payment_type', 'status',
            'total_amount', 'item_count', 'created_by_username', 'created_at',
        )


class SaleDetailSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', default=None, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'customer', 'customer_name', 'payment_type', 'status',
            'total_amount', 'note', 'items', 'created_by_username',
            'created_at', 'cancelled_at', 'cancelled_reason',
        )


class SaleItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))


class SaleCreateSerializer(serializers.Serializer):
    """POST /api/sales/ — Hızlı Satış (POS) ekranının gönderdiği payload.

    Stok düşümü, birim fiyat seçimi (toptan/perakende) ve veresiye borç kaydı
    tek bir veritabanı transaction'ı içinde, satır bazlı kilitleme (select_for_update)
    ile atomik olarak yürütülür.
    """

    customer = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.filter(is_active=True), required=False, allow_null=True,
    )
    payment_type = serializers.ChoiceField(choices=Sale.PaymentType.choices)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)
    items = SaleItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Satış en az bir ürün içermelidir.')
        return value

    def validate(self, attrs):
        if attrs['payment_type'] == Sale.PaymentType.CREDIT and not attrs.get('customer'):
            raise serializers.ValidationError({
                'customer': 'Veresiye satış için müşteri seçilmelidir.',
            })
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        customer = validated_data.get('customer')
        payment_type = validated_data['payment_type']
        items_data = validated_data['items']

        with transaction.atomic():
            product_ids = [item['product'].id for item in items_data]
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            sale = Sale.objects.create(
                customer=customer,
                payment_type=payment_type,
                note=validated_data.get('note', ''),
                created_by=request.user,
                total_amount=0,
            )

            total_amount = 0
            for item in items_data:
                product = locked_products[item['product'].id]
                quantity = item['quantity']

                if product.stock_quantity < quantity:
                    raise serializers.ValidationError({
                        'items': f'"{product.name}" için yetersiz stok. Mevcut: {product.stock_quantity}',
                    })

                unit_price = product.effective_price(is_wholesale=bool(customer and customer.is_wholesale))
                line_total = quantity * unit_price
                total_amount += line_total

                SaleItem.objects.create(
                    sale=sale, product=product, quantity=quantity,
                    unit_price=unit_price, line_total=line_total,
                )

                product.stock_quantity = F('stock_quantity') - quantity
                product.save(update_fields=['stock_quantity'])

                StockMovement.objects.create(
                    product_id=product.id,
                    movement_type=StockMovement.MovementType.OUT,
                    quantity=quantity,
                    reason=f'Satış #{sale.id}',
                    created_by=request.user,
                )

            sale.total_amount = total_amount
            sale.save(update_fields=['total_amount'])

            if payment_type == Sale.PaymentType.CREDIT:
                CustomerTransaction.objects.create(
                    customer=customer,
                    transaction_type=CustomerTransaction.TransactionType.DEBT,
                    amount=total_amount,
                    note=f'Veresiye satış #{sale.id}',
                    related_sale=sale,
                    created_by=request.user,
                )

        sale.refresh_from_db()
        return sale


class CancelSaleInputSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def save(self, sale, user):
        if sale.status == Sale.Status.CANCELLED:
            raise serializers.ValidationError('Bu satış zaten iptal edilmiş.')

        with transaction.atomic():
            locked_items = SaleItem.objects.select_related('product').filter(sale=sale)
            for item in locked_items:
                product = Product.objects.select_for_update().get(pk=item.product_id)
                product.stock_quantity = F('stock_quantity') + item.quantity
                product.save(update_fields=['stock_quantity'])
                StockMovement.objects.create(
                    product=product,
                    movement_type=StockMovement.MovementType.IN,
                    quantity=item.quantity,
                    reason=f'Satış #{sale.id} iptali',
                    created_by=user,
                )

            if sale.payment_type == Sale.PaymentType.CREDIT and sale.customer_id:
                CustomerTransaction.objects.create(
                    customer_id=sale.customer_id,
                    transaction_type=CustomerTransaction.TransactionType.PAYMENT,
                    amount=sale.total_amount,
                    note=f'Satış #{sale.id} iptali — veresiye borcu ters kaydı',
                    related_sale=sale,
                    created_by=user,
                )

            sale.status = Sale.Status.CANCELLED
            sale.cancelled_at = timezone.now()
            sale.cancelled_reason = self.validated_data.get('reason', '')
            sale.save(update_fields=['status', 'cancelled_at', 'cancelled_reason'])

        sale.refresh_from_db()
        return sale
