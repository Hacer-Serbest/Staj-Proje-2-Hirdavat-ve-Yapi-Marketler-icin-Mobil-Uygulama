import datetime

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.customers.models import Customer
from apps.products.models import Product
from apps.sales.models import Sale, SaleItem


class DashboardSummaryView(APIView):
    """GET /api/dashboard/summary/ — dükkan sahibinin ana ekranda göreceği özet kartlar."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        today = datetime.date.today()
        week_start = today - datetime.timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        completed_sales = Sale.objects.filter(status=Sale.Status.COMPLETED)

        today_agg = completed_sales.filter(created_at__date=today).aggregate(
            total=Sum('total_amount'), count=Count('id'),
        )
        week_agg = completed_sales.filter(created_at__date__gte=week_start).aggregate(total=Sum('total_amount'))
        month_agg = completed_sales.filter(created_at__date__gte=month_start).aggregate(total=Sum('total_amount'))

        low_stock_qs = Product.objects.filter(is_active=True, stock_quantity__lte=F('min_stock_level'))

        customer_agg = Customer.objects.with_balance().aggregate(
            sum_debt=Sum('total_debt'), sum_payment=Sum('total_payment'),
        )
        total_debt = customer_agg['sum_debt'] or 0
        total_payment = customer_agg['sum_payment'] or 0

        return Response({
            'today': {'date': today, 'total_amount': today_agg['total'] or 0, 'sale_count': today_agg['count'] or 0},
            'week_total_amount': week_agg['total'] or 0,
            'month_total_amount': month_agg['total'] or 0,
            'low_stock_count': low_stock_qs.count(),
            'total_customer_debt': total_debt - total_payment,
        })


class SalesReportView(APIView):
    """GET /api/reports/sales/?period=daily|weekly|monthly — Chart.js için zaman serisi."""

    permission_classes = (IsAuthenticated,)
    TRUNC_MAP = {'daily': TruncDate, 'weekly': TruncWeek, 'monthly': TruncMonth}
    DEFAULT_DAYS = {'daily': 30, 'weekly': 90, 'monthly': 365}

    def get(self, request):
        period = request.query_params.get('period', 'daily')
        trunc_fn = self.TRUNC_MAP.get(period, TruncDate)
        days = int(request.query_params.get('days', self.DEFAULT_DAYS.get(period, 30)))
        since = datetime.date.today() - datetime.timedelta(days=days)

        queryset = (
            Sale.objects.filter(status=Sale.Status.COMPLETED, created_at__date__gte=since)
            .annotate(period=trunc_fn('created_at'))
            .values('period')
            .annotate(total_amount=Sum('total_amount'), sale_count=Count('id'))
            .order_by('period')
        )
        return Response({'period': period, 'since': since, 'results': list(queryset)})


class TopProductsReportView(APIView):
    """GET /api/reports/top-products/?limit=10&days=30 — en çok satan ürünler (bar chart)."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        limit = int(request.query_params.get('limit', 10))
        days = int(request.query_params.get('days', 30))
        since = datetime.date.today() - datetime.timedelta(days=days)

        queryset = (
            SaleItem.objects.filter(
                sale__status=Sale.Status.COMPLETED, sale__created_at__date__gte=since,
            )
            .values('product_id', 'product__name')
            .annotate(total_quantity=Sum('quantity'), total_revenue=Sum('line_total'))
            .order_by('-total_quantity')[:limit]
        )
        return Response({'since': since, 'results': list(queryset)})


class ProfitReportView(APIView):
    """GET /api/reports/profit/?days=30 — basit kâr/zarar analizi (satış fiyatı - alış fiyatı)."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        since = datetime.date.today() - datetime.timedelta(days=days)

        line_cost = ExpressionWrapper(
            F('quantity') * F('product__cost_price'), output_field=DecimalField(max_digits=14, decimal_places=2),
        )
        queryset = SaleItem.objects.filter(
            sale__status=Sale.Status.COMPLETED, sale__created_at__date__gte=since,
        ).annotate(line_cost=line_cost)

        aggregates = queryset.aggregate(total_revenue=Sum('line_total'), total_cost=Sum('line_cost'))
        total_revenue = aggregates['total_revenue'] or 0
        total_cost = aggregates['total_cost'] or 0

        return Response({
            'since': since,
            'total_revenue': total_revenue,
            'total_cost': total_cost,
            'total_profit': total_revenue - total_cost,
        })


class CustomerBalanceReportView(APIView):
    """GET /api/reports/customer-balances/ — dashboard'daki cari borç/alacak pie chart'ı için."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        customers = Customer.objects.with_balance().filter(is_active=True)
        debtors = []
        total_debt = 0
        for customer in customers:
            balance = (customer.total_debt or 0) - (customer.total_payment or 0)
            if balance > 0:
                total_debt += balance
                debtors.append({'customer_id': customer.id, 'customer_name': customer.name, 'balance': balance})

        debtors.sort(key=lambda x: x['balance'], reverse=True)
        return Response({'total_debt': total_debt, 'debtors': debtors})
