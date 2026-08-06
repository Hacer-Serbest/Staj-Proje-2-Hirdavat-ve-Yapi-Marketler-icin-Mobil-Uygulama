# Hırdavat & Yapı Market Yönetim Sistemi — Frontend

Küçük ölçekli bir hırdavat dükkanının stok, hızlı satış (POS) ve veresiye takibi için
mobil öncelikli React SPA. Backend (Django REST) ayrı bir repoda (`hirdavat-api`) geliştirilir.

## Teknoloji Yığını

- React 19 + Vite
- React Router (client-side routing)
- Bootstrap 5 (UI)
- Axios (JWT access/refresh interceptor'lı API client)
- Chart.js / react-chartjs-2 (dashboard grafikleri)

## Ekranlar

| Rota | Açıklama |
|---|---|
| `/login` | JWT ile giriş |
| `/` | Dashboard — özet kartlar, satış/kâr grafikleri, veresiye dağılımı |
| `/products`, `/products/:id`, `/products/new`, `/products/:id/edit` | Ürün kataloğu, kategori sekmeleri, stok yönetimi |
| `/pos` | Hızlı Satış — ürün seç → sepet → müşteri/ödeme → satışı tamamla |
| `/sales/:id` | Fiş görüntüleme, PDF indirme, satış iptali |
| `/customers`, `/customers/:id`, `/customers/new`, `/customers/:id/edit` | Müşteri kartı, bakiye, tahsilat/veresiye kaydı, cari özet PDF |

## Yerel Kurulum

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL değerini backend adresinize göre ayarlayın
npm run dev
```

Varsayılan olarak backend'in `http://127.0.0.1:8000/api` adresinde çalıştığı varsayılır
(bkz. `hirdavat-api` reposu).

## Build & Deploy

```bash
npm run build   # dist/ klasörünü üretir
```

- **Vercel**: repo bağlanır, `VITE_API_BASE_URL` ortam değişkeni prod API adresine ayarlanır (`vercel.json` SPA rewrite kuralını içerir).
- **Docker**: `docker build --build-arg VITE_API_BASE_URL=https://hirdavat-api.onrender.com/api -t hirdavat-frontend .` — Nginx üzerinden statik olarak sunulur.
