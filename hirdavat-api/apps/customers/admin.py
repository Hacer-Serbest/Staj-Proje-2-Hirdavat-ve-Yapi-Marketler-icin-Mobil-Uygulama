from django.contrib import admin

from .models import Customer, CustomerTransaction


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_wholesale', 'is_active', 'balance')
    list_filter = ('is_wholesale', 'is_active')
    search_fields = ('name', 'phone')

    @admin.display(description='Bakiye')
    def balance(self, obj):
        return obj.balance


@admin.register(CustomerTransaction)
class CustomerTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'transaction_type', 'amount', 'created_by', 'created_at')
    list_filter = ('transaction_type',)
    search_fields = ('customer__name',)
