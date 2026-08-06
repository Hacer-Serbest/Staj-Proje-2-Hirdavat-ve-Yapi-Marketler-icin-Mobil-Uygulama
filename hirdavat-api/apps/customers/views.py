import datetime

from django.http import FileResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pdf import build_statement_pdf
from core.utils import parse_date_query_param

from .models import Customer, CustomerTransaction
from .serializers import (
    CustomerDetailSerializer,
    CustomerListSerializer,
    CustomerTransactionSerializer,
    DebtInputSerializer,
    PaymentInputSerializer,
)


def _parse_statement_period(request):
    today = datetime.date.today()
    start_str = request.query_params.get('start')
    end_str = request.query_params.get('end')
    start = parse_date_query_param(start_str, 'start') if start_str else today.replace(day=1)
    end = parse_date_query_param(end_str, 'end') if end_str else today
    return start, end


class CustomerViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('is_wholesale', 'is_active')
    search_fields = ('name', 'phone')
    ordering_fields = ('name', 'created_at')
    ordering = ('name',)

    def get_queryset(self):
        return Customer.objects.with_balance()

    def get_serializer_class(self):
        if self.action == 'list':
            return CustomerListSerializer
        return CustomerDetailSerializer

    @action(detail=True, methods=['get'], url_path='balance')
    def balance(self, request, pk=None):
        customer = self.get_object()
        return Response({'customer_id': customer.id, 'balance': customer.balance})

    @action(detail=True, methods=['post'], url_path='payment')
    def payment(self, request, pk=None):
        customer = self.get_object()
        serializer = PaymentInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = CustomerTransaction.objects.create(
            customer=customer,
            transaction_type=CustomerTransaction.TransactionType.PAYMENT,
            amount=serializer.validated_data['amount'],
            note=serializer.validated_data.get('note', ''),
            created_by=request.user,
        )
        return Response(
            {
                'transaction': CustomerTransactionSerializer(transaction).data,
                'balance': customer.balance,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='debt')
    def debt(self, request, pk=None):
        customer = self.get_object()
        serializer = DebtInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = CustomerTransaction.objects.create(
            customer=customer,
            transaction_type=CustomerTransaction.TransactionType.DEBT,
            amount=serializer.validated_data['amount'],
            note=serializer.validated_data.get('note', 'Manuel veresiye kaydı'),
            created_by=request.user,
        )
        return Response(
            {
                'transaction': CustomerTransactionSerializer(transaction).data,
                'balance': customer.balance,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['get'], url_path='statement')
    def statement(self, request, pk=None):
        customer = self.get_object()
        start, end = _parse_statement_period(request)
        transactions = customer.transactions.filter(
            created_at__date__gte=start, created_at__date__lte=end,
        ).order_by('created_at')
        return Response({
            'customer_id': customer.id,
            'start': start,
            'end': end,
            'current_balance': customer.balance,
            'transactions': CustomerTransactionSerializer(transactions, many=True).data,
        })

    @action(detail=True, methods=['get'], url_path='statement/pdf')
    def statement_pdf(self, request, pk=None):
        customer = self.get_object()
        start, end = _parse_statement_period(request)
        transactions = customer.transactions.filter(
            created_at__date__gte=start, created_at__date__lte=end,
        ).order_by('created_at')
        buffer = build_statement_pdf(customer, transactions, start, end)
        filename = f'cari-ozet-{customer.id}-{start}-{end}.pdf'
        return FileResponse(buffer, as_attachment=True, filename=filename, content_type='application/pdf')


class CustomerTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CustomerTransactionSerializer
    permission_classes = (IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('customer', 'transaction_type')
    ordering = ('-created_at',)

    def get_queryset(self):
        return CustomerTransaction.objects.select_related('customer', 'created_by').all()
