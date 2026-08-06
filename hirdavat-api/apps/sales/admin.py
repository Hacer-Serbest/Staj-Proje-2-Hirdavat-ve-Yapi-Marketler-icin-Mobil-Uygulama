from django.contrib import admin

from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'unit_price', 'line_total')
    can_delete = False


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'payment_type', 'status', 'total_amount', 'created_by', 'created_at')
    list_filter = ('status', 'payment_type')
    search_fields = ('id', 'customer__name')
    inlines = (SaleItemInline,)
    readonly_fields = ('total_amount', 'created_at', 'cancelled_at')
