# Hırdavat & Yapı Market Yönetim Sistemi — API

Küçük ölçekli bir hırdavat dükkanının stok, satış/POS, müşteri & veresiye takibi ve
raporlama ihtiyaçlarını karşılayan Django REST Framework tabanlı backend.
Frontend (React + Bootstrap) ayrı bir repoda (`hirdavat-frontend`) geliştirilir.

## Teknoloji Yığını

- Python 3.14 / Django 6, Django REST Framework
- PostgreSQL (prod) / SQLite (local geliştirme)
- JWT authentication (djangorestframework-simplejwt)
- Swagger/OpenAPI dokümantasyonu (drf-yasg)
- ReportLab ile PDF üretimi (fiş, cari hesap özeti)
- Docker + Render.com deploy

## Modüller

| Modül | Açıklama |
|---|---|
| `apps.users` | JWT auth, dükkan sahibi/personel profili |
| `apps.products` | Kategori, ürün, stok hareketleri, minimum stok uyarısı |
| `apps.sales` | Hızlı satış (POS), otomatik stok düşümü, fiş PDF, satış iptali |
| `apps.customers` | Müşteri kartları, veresiye borç/tahsilat, cari hesap özeti PDF |
| `apps.dashboard` | Özet kartlar, satış/kâr-zarar/en çok satan ürün raporları |

## Yerel Kurulum

```bash
python -m venv venv
source venv/Scripts/activate   # Windows: venv\Scripts\activate
pip install -r requirements/development.txt

cp .env.example .env           # SECRET_KEY değerini kendi anahtarınızla değiştirin

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/` — Swagger: `http://127.0.0.1:8000/api/docs/`

## Docker ile Kurulum

```bash
docker-compose up --build
```

Bu komut PostgreSQL veritabanını ve API'yi (migrasyon + collectstatic otomatik) tek seferde ayağa kaldırır.

## Ortam Değişkenleri

Tüm değişkenler ve açıklamaları için [`.env.example`](.env.example) dosyasına bakınız.

## Deploy

- Backend: Render.com — `render.yaml` blueprint dosyası ile otomatik kurulum
- Frontend: Vercel (bkz. `hirdavat-frontend` reposu)

## API Endpoint Özeti

Tüm endpoint'ler ve request/response şemaları için `/api/docs/` adresindeki Swagger arayüzüne bakınız.
Başlıca uçlar:

- `POST /api/auth/login/`, `POST /api/auth/refresh/`, `GET/PATCH /api/auth/me/`
- `GET/POST /api/categories/`, `GET/POST /api/products/`, `GET /api/products/low-stock/`, `POST /api/products/{id}/adjust-stock/`
- `POST /api/sales/`, `GET /api/sales/daily/`, `POST /api/sales/{id}/cancel/`, `GET /api/sales/{id}/receipt/`
- `GET/POST /api/customers/`, `GET /api/customers/{id}/balance/`, `POST /api/customers/{id}/payment/`, `GET /api/customers/{id}/statement/`
- `GET /api/dashboard/summary/`, `GET /api/reports/sales/`, `GET /api/reports/top-products/`, `GET /api/reports/profit/`
