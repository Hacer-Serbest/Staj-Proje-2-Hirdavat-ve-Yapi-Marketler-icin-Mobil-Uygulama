import datetime

from django.db.models import Count, Sum
from django.http import FileResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pdf import build_receipt_pdf
from core.utils import parse_date_query_param

from .models import Sale
from .serializers import (
    CancelSaleInputSerializer,
    SaleCreateSerializer,
    SaleDetailSerializer,
    SaleListSerializer,
)


class SaleViewSet(viewsets.ModelViewSet):
    """Satışlar oluşturulduktan sonra düzenlenemez; sadece iptal edilebilir (cancel action)."""

    http_method_names = ['get', 'post', 'head', 'options']
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('status', 'payment_type', 'customer')
    ordering = ('-created_at',)

    def get_queryset(self):
        return Sale.objects.select_related('customer', 'created_by').prefetch_related('items__product')

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        if self.action == 'list':
            return SaleListSerializer
        return SaleDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = SaleCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()
        return Response(SaleDetailSerializer(sale).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='daily')
    def daily(self, request):
        date_str = request.query_params.get('date')
        target_date = parse_date_query_param(date_str, 'date') if date_str else datetime.date.today()

        queryset = self.get_queryset().filter(
            created_at__date=target_date, status=Sale.Status.COMPLETED,
        )
        summary = queryset.aggregate(total_amount=Sum('total_amount'), sale_count=Count('id'))
        by_payment_type = list(
            queryset.values('payment_type').annotate(total=Sum('total_amount'), count=Count('id'))
        )

        return Response({
            'date': target_date,
            'total_amount': summary['total_amount'] or 0,
            'sale_count': summary['sale_count'] or 0,
            'by_payment_type': by_payment_type,
            'sales': SaleListSerializer(queryset, many=True).data,
        })

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        sale = self.get_object()
        input_serializer = CancelSaleInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        cancelled_sale = input_serializer.save(sale=sale, user=request.user)
        return Response(SaleDetailSerializer(cancelled_sale).data)

    @action(detail=True, methods=['get'], url_path='receipt')
    def receipt(self, request, pk=None):
        sale = self.get_object()
        buffer = build_receipt_pdf(sale)
        return FileResponse(
            buffer, as_attachment=False, filename=f'fis-{sale.id}.pdf', content_type='application/pdf',
        )
