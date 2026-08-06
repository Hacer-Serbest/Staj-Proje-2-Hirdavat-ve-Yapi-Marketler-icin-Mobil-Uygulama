from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Case, DecimalField, Sum, When

from core.validators import turkish_phone_validator


class CustomerQuerySet(models.QuerySet):
    def with_balance(self):
        """Her müşteriye anlık cari bakiyeyi (borç - tahsilat) annotate eder.

        Pozitif bakiye = müşteri borçlu (veresiye alacağımız var).
        """
        debt_case = Case(
            When(transactions__transaction_type=CustomerTransaction.TransactionType.DEBT,
                 then='transactions__amount'),
            default=0, output_field=DecimalField(max_digits=12, decimal_places=2),
        )
        payment_case = Case(
            When(transactions__transaction_type=CustomerTransaction.TransactionType.PAYMENT,
                 then='transactions__amount'),
            default=0, output_field=DecimalField(max_digits=12, decimal_places=2),
        )
        return self.annotate(
            total_debt=Sum(debt_case, default=0),
            total_payment=Sum(payment_case, default=0),
        )


class Customer(models.Model):
    name = models.CharField(max_length=150, verbose_name='Ad Soyad / Firma')
    phone = models.CharField(max_length=17, validators=[turkish_phone_validator], blank=True, verbose_name='Telefon')
    address = models.TextField(blank=True, verbose_name='Adres')
    is_wholesale = models.BooleanField(default=False, verbose_name='Toptan Müşteri')
    notes = models.TextField(blank=True, verbose_name='Notlar')
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomerQuerySet.as_manager()

    class Meta:
        verbose_name = 'Müşteri'
        verbose_name_plural = 'Müşteriler'
        ordering = ['name']
        indexes = [models.Index(fields=['phone'])]

    def __str__(self):
        return self.name

    @property
    def balance(self):
        """Pozitif: müşteri borçlu (veresiye). Negatif: müşterinin fazla ödemesi var."""
        aggregates = self.transactions.aggregate(
            total_debt=Sum('amount', filter=models.Q(transaction_type=CustomerTransaction.TransactionType.DEBT)),
            total_payment=Sum('amount', filter=models.Q(transaction_type=CustomerTransaction.TransactionType.PAYMENT)),
        )
        return (aggregates['total_debt'] or 0) - (aggregates['total_payment'] or 0)


class CustomerTransaction(models.Model):
    """Cari hesap hareketi — veresiye borç artışı veya tahsilat (ödeme)."""

    class TransactionType(models.TextChoices):
        DEBT = 'debt', 'Veresiye Borcu'
        PAYMENT = 'payment', 'Tahsilat'

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='transactions')
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    note = models.CharField(max_length=255, blank=True)
    related_sale = models.ForeignKey(
        'sales.Sale', on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_transactions',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='customer_transactions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Cari Hareket'
        verbose_name_plural = 'Cari Hareketler'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.customer.name} — {self.get_transaction_type_display()} ({self.amount})'
