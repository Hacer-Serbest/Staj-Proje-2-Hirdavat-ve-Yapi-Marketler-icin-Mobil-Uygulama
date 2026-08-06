from django.urls import path

from .views import (
    CustomerBalanceReportView,
    DashboardSummaryView,
    ProfitReportView,
    SalesReportView,
    TopProductsReportView,
)

app_name = 'dashboard'

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='summary'),
    path('reports/sales/', SalesReportView.as_view(), name='report-sales'),
    path('reports/top-products/', TopProductsReportView.as_view(), name='report-top-products'),
    path('reports/profit/', ProfitReportView.as_view(), name='report-profit'),
    path('reports/customer-balances/', CustomerBalanceReportView.as_view(), name='report-customer-balances'),
]
