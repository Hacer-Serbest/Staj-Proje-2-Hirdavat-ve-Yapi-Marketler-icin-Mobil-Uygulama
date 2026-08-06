from rest_framework.routers import DefaultRouter

from .views import SaleViewSet

app_name = 'sales'

router = DefaultRouter()
router.register('sales', SaleViewSet, basename='sale')

urlpatterns = router.urls
