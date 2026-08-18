#!/bin/sh
set -e

echo "Migrasyonlar uygulanıyor..."
python manage.py migrate --noinput

echo "Statik dosyalar toplanıyor..."
python manage.py collectstatic --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Superuser kontrol ediliyor..."
    python manage.py createsuperuser --noinput || echo "Superuser zaten var, atlanıyor."
fi

if [ "$SEED_DEMO_DATA" = "true" ]; then
    echo "Demo veri ekleniyor..."
    python manage.py seed_demo_data
fi

echo "Gunicorn başlatılıyor..."
exec gunicorn config.wsgi:application \
    --bind "0.0.0.0:${PORT:-8000}" \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout 60 \
    --access-logfile - \
    --error-logfile -
