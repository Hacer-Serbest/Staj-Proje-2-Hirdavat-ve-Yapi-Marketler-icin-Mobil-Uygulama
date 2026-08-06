from rest_framework.routers import DefaultRouter

from .views import CustomerTransactionViewSet, CustomerViewSet

app_name = 'customers'

router = DefaultRouter()
router.register('customers', CustomerViewSet, basename='customer')
router.register('customer-transactions', CustomerTransactionViewSet, basename='customer-transaction')

urlpatterns = router.urls
