from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Sale(models.Model):
    class PaymentType(models.TextChoices):
        CASH = 'cash', 'Nakit'
        CARD = 'card', 'Kredi Kartı'
        TRANSFER = 'transfer', 'Havale/EFT'
        CREDIT = 'credit', 'Veresiye'

    class Status(models.TextChoices):
        COMPLETED = 'completed', 'Tamamlandı'
        CANCELLED = 'cancelled', 'İptal Edildi'

    customer = models.ForeignKey(
        'customers.Customer', on_delete=models.PROTECT, null=True, blank=True, related_name='sales',
    )
    payment_type = models.CharField(max_length=10, choices=PaymentType.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.COMPLETED)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    note = models.CharField(max_length=255, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sales',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_reason = models.CharField(max_length=255, blank=True)

    class Meta:
        verbose_name = 'Satış'
        verbose_name_plural = 'Satışlar'
        ordering = ['-created_at']

    def __str__(self):
        return f'Satış #{self.id} — {self.total_amount} TL'


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='sale_items')
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = 'Satış Kalemi'
        verbose_name_plural = 'Satış Kalemleri'

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'
