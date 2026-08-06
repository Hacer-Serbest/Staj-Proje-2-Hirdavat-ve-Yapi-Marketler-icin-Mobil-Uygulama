from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Category(models.Model):
    """Ürün kategorisi (Boya, Elektrik, Tesisat, Hırdavat, İnşaat vb.)."""

    name = models.CharField(max_length=100, unique=True, verbose_name='Kategori Adı')
    description = models.TextField(blank=True, verbose_name='Açıklama')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Kategori'
        verbose_name_plural = 'Kategoriler'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    class Unit(models.TextChoices):
        ADET = 'adet', 'Adet'
        KG = 'kg', 'Kilogram'
        METRE = 'metre', 'Metre'
        LITRE = 'litre', 'Litre'
        PAKET = 'paket', 'Paket'

    name = models.CharField(max_length=200, verbose_name='Ürün Adı')
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name='products', verbose_name='Kategori',
    )
    barcode = models.CharField(max_length=64, unique=True, null=True, blank=True, verbose_name='Barkod')
    unit = models.CharField(max_length=10, choices=Unit.choices, default=Unit.ADET, verbose_name='Birim')

    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(0)], verbose_name='Alış Fiyatı',
    )
    price = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0)], verbose_name='Satış Fiyatı',
    )
    wholesale_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0)], verbose_name='Toptan Satış Fiyatı',
    )

    stock_quantity = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(0)], verbose_name='Stok Miktarı',
    )
    min_stock_level = models.DecimalField(
        max_digits=10, decimal_places=2, default=0,
        validators=[MinValueValidator(0)], verbose_name='Minimum Stok Seviyesi',
    )

    image = models.ImageField(upload_to='products/%Y/%m/', null=True, blank=True, verbose_name='Fotoğraf')
    is_active = models.BooleanField(default=True, verbose_name='Aktif')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Ürün'
        verbose_name_plural = 'Ürünler'
        ordering = ['name']
        indexes = [
            models.Index(fields=['barcode']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.min_stock_level

    def effective_price(self, is_wholesale=False):
        if is_wholesale and self.wholesale_price is not None:
            return self.wholesale_price
        return self.price


class StockMovement(models.Model):
    """Stok giriş/çıkış hareket kaydı — her satış, manuel düzeltme veya yeni alım burada loglanır."""

    class MovementType(models.TextChoices):
        IN = 'in', 'Stok Girişi'
        OUT = 'out', 'Stok Çıkışı'
        ADJUSTMENT = 'adjustment', 'Manuel Düzeltme'

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_movements')
    movement_type = models.CharField(max_length=12, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    reason = models.CharField(max_length=255, blank=True, verbose_name='Açıklama')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='stock_movements',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Stok Hareketi'
        verbose_name_plural = 'Stok Hareketleri'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product.name} — {self.get_movement_type_display()} ({self.quantity})'
