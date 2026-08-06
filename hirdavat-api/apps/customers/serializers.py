from decimal import Decimal

from rest_framework import serializers

from .models import Customer, CustomerTransaction


class CustomerListSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = (
            'id', 'name', 'phone', 'is_wholesale', 'is_active', 'balance', 'created_at',
        )

    def get_balance(self, obj):
        total_debt = getattr(obj, 'total_debt', None)
        total_payment = getattr(obj, 'total_payment', None)
        if total_debt is not None and total_payment is not None:
            return total_debt - total_payment
        return obj.balance


class CustomerDetailSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Customer
        fields = (
            'id', 'name', 'phone', 'address', 'is_wholesale', 'notes',
            'is_active', 'balance', 'created_at', 'updated_at',
        )


class CustomerTransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = CustomerTransaction
        fields = (
            'id', 'customer', 'customer_name', 'transaction_type', 'amount',
            'note', 'related_sale', 'created_by', 'created_by_username', 'created_at',
        )
        read_only_fields = ('created_by', 'related_sale')


class PaymentInputSerializer(serializers.Serializer):
    """POST /api/customers/{id}/payment/ — kısmi/tam tahsilat kaydı."""

    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)


class DebtInputSerializer(serializers.Serializer):
    """POST /api/customers/{id}/debt/ — POS dışında manuel veresiye borcu ekleme (örn. eski defter kaydı)."""

    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.01'))
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)
