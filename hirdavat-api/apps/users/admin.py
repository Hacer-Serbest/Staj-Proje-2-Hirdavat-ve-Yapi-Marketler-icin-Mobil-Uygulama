from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Dükkan Bilgileri', {'fields': ('phone', 'shop_name')}),
    )
    list_display = ('username', 'email', 'shop_name', 'phone', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'phone', 'shop_name')
