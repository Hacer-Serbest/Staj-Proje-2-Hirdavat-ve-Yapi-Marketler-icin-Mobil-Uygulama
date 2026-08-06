import datetime

from rest_framework import serializers


def parse_date_query_param(value, field_name):
    """Query param'dan gelen ISO tarih string'ini (YYYY-MM-DD) güvenli şekilde parse eder.

    Geçersiz formatta 500 yerine düzgün bir 400 ValidationError döner.
    """
    try:
        return datetime.date.fromisoformat(value)
    except ValueError:
        raise serializers.ValidationError({field_name: f'"{value}" geçerli bir tarih değil (YYYY-MM-DD bekleniyor).'})
