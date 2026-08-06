from django.core.validators import RegexValidator

turkish_phone_validator = RegexValidator(
    regex=r'^(\+?90)?5\d{9}$',
    message="Telefon numarası '5XXXXXXXXX' veya '+905XXXXXXXXX' formatında olmalıdır.",
)
