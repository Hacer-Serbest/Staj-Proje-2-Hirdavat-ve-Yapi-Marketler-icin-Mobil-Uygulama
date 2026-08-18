"""
URL configuration for the Hırdavat & Yapı Market Yönetim Sistemi API.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title='Hırdavat & Yapı Market Yönetim Sistemi API',
        default_version='v1',
        description='Stok, satış/POS, müşteri & veresiye takibi ve raporlama için RESTful API.',
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.sales.urls')),
    path('api/', include('apps.customers.urls')),
    path('api/', include('apps.dashboard.urls')),

    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/docs.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# whitenoise sadece STATIC_ROOT'u servis eder; MEDIA_ROOT (ürün fotoğrafları) için
# DEBUG=False iken de bu route gerekli, yoksa yüklenen görseller hiç görüntülenemez.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
