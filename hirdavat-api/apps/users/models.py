from django.contrib.auth.models import AbstractUser
from django.db import models

from core.validators import turkish_phone_validator


class User(AbstractUser):
    """Dükkan sahibi / yardımcı personel hesabı.

    Proje 1 kapsamında tek bir gerçek kullanıcı (dükkan sahibi) olsa da,
    ileride kasiyer/yardımcı personel eklenebilmesi için is_staff üzerinden
    ayrım yapılabilecek şekilde tasarlandı.
    """

    phone = models.CharField(
        max_length=17,
        validators=[turkish_phone_validator],
        blank=True,
        verbose_name='Telefon',
    )
    shop_name = models.CharField(max_length=150, blank=True, verbose_name='Dükkan Adı')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Kullanıcı'
        verbose_name_plural = 'Kullanıcılar'

    def __str__(self):
        return self.get_full_name() or self.username
