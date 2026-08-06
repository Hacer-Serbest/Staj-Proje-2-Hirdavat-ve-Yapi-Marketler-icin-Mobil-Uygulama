import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.customers.models import Customer, CustomerTransaction
from apps.products.models import Category, Product, StockMovement
from apps.sales.models import Sale, SaleItem

CATEGORIES = {
    'El Aletleri': [
        ('Çekiç 500gr', 'adet', 145, 220, 15, 3, 869000000100),
        ('Kerpeten 8"', 'adet', 85, 130, 20, 4, 869000000101),
        ('Yassı Pense 7"', 'adet', 60, 95, 18, 4, 869000000102),
        ("Tornavida Takımı 6'lı", 'paket', 115, 180, 25, 5, 869000000103),
        ('Su Terazisi 40cm', 'adet', 135, 210, 10, 2, 869000000104),
        ('El Testeresi 45cm', 'adet', 110, 175, 12, 3, 869000000105),
        ('Maket Bıçağı', 'adet', 20, 35, 40, 8, 869000000106),
        ('Alyan Anahtar Seti 9 Parça', 'paket', 90, 140, 22, 4, 869000000107),
        ('İngiliz Anahtarı 10"', 'adet', 120, 190, 14, 3, 869000000108),
        ('Lokma Takımı 46 Parça', 'paket', 560, 850, 8, 2, 869000000109),
    ],
    'Elektrik Malzemeleri': [
        ('Priz (Topraklı)', 'adet', 28, 45, 60, 15, 869000000110),
        ('Anahtar (Tek Buton)', 'adet', 25, 40, 55, 15, 869000000111),
        ('Led Ampul 9W', 'adet', 22, 35, 80, 20, 869000000112),
        ('Led Ampul 12W', 'adet', 30, 48, 70, 20, 869000000113),
        ('Kablo NYA 2.5mm', 'metre', 5.5, 8.5, 300, 50, 869000000114),
        ('Kablo NYA 1.5mm', 'metre', 4, 6, 350, 50, 869000000115),
        ('Sigorta Otomat 16A', 'adet', 42, 65, 25, 6, 869000000116),
        ('Uzatma Kablosu 5m', 'adet', 140, 220, 18, 4, 869000000117),
        ('Fiş (Topraklı)', 'adet', 15, 25, 50, 12, 869000000118),
        ('Kablo Kanalı 20x10', 'metre', 14, 22, 120, 20, 869000000119),
    ],
    'Boya & Sıva': [
        ('İç Cephe Boyası 15L', 'adet', 980, 1450, 10, 3, 869000000120),
        ('Dış Cephe Boyası 15L', 'adet', 1250, 1850, 8, 2, 869000000121),
        ('Astar Boya 15L', 'adet', 650, 980, 9, 2, 869000000122),
        ('Boya Fırçası 2"', 'adet', 28, 45, 35, 8, 869000000123),
        ('Boya Rulosu Takımı', 'paket', 55, 85, 30, 6, 869000000124),
        ('Maskeleme Bantı 50m', 'adet', 20, 35, 45, 10, 869000000125),
        ('Alçı 25kg', 'paket', 130, 190, 20, 5, 869000000126),
        ('Saten Alçı 20kg', 'paket', 145, 210, 18, 4, 869000000127),
        ('Silikon (Şeffaf)', 'adet', 35, 55, 40, 10, 869000000128),
    ],
    'Tesisat & Su Malzemeleri': [
        ('PVC Boru 1/2"', 'metre', 12, 18, 150, 30, 869000000129),
        ('PVC Boru 3/4"', 'metre', 16, 24, 130, 25, 869000000130),
        ('Dirsek PVC 1/2"', 'adet', 8, 12, 60, 15, 869000000131),
        ('Musluk (Standart)', 'adet', 210, 320, 16, 4, 869000000132),
        ('Sifon (Lavabo)', 'adet', 95, 145, 14, 3, 869000000133),
        ('Teflon Bant', 'adet', 8, 15, 90, 20, 869000000134),
        ('Bahçe Hortumu 25m', 'adet', 250, 380, 12, 3, 869000000135),
        ('Su Filtresi Kartuşu', 'adet', 60, 95, 20, 5, 869000000136),
        ('Klozet Rezervuar Takımı', 'adet', 280, 420, 7, 2, 869000000137),
    ],
    'Vida & Bağlantı Elemanları': [
        ('Ahşap Vidası 4x40 (Kutu)', 'paket', 42, 65, 35, 8, 869000000138),
        ('Alçıpan Vidası 3.5x25 (Kutu)', 'paket', 36, 55, 38, 8, 869000000139),
        ('Civata M8x60 (Kutu)', 'paket', 58, 90, 25, 6, 869000000140),
        ('Somun M8 (Kutu)', 'paket', 26, 40, 30, 6, 869000000141),
        ('Rondela Set (Kutu)', 'paket', 22, 35, 28, 6, 869000000142),
        ('Dübel 8mm (Kutu)', 'paket', 28, 45, 40, 8, 869000000143),
        ('Çivi 5cm', 'kg', 38, 60, 45, 10, 869000000144),
        ('Hortum Kelepçesi', 'adet', 5, 8, 100, 20, 869000000145),
    ],
    'Bahçe & Dış Mekan': [
        ('Bahçe Makası', 'adet', 105, 165, 16, 4, 869000000146),
        ('Çapa', 'adet', 135, 210, 12, 3, 869000000147),
        ('Kürek (Sivri Uç)', 'adet', 155, 240, 12, 3, 869000000148),
        ('Tırmık', 'adet', 110, 175, 14, 3, 869000000149),
        ('Sulama Başlığı', 'adet', 35, 55, 30, 6, 869000000150),
        ('Bahçe Eldiveni', 'adet', 22, 35, 50, 10, 869000000151),
        ('Gübre 5kg', 'paket', 80, 120, 20, 5, 869000000152),
        ('Çim Tohumu 1kg', 'adet', 60, 95, 18, 4, 869000000153),
    ],
    'Kilit & Güvenlik': [
        ('Kapı Kilidi (Göbek)', 'adet', 250, 380, 10, 2, 869000000154),
        ('Asma Kilit 50mm', 'adet', 105, 165, 22, 5, 869000000155),
        ('Menteşe 4"', 'adet', 28, 45, 40, 8, 869000000156),
        ('Kapı Zinciri', 'adet', 60, 95, 16, 4, 869000000157),
        ('Güvenlik Zinciri', 'adet', 140, 220, 10, 2, 869000000158),
        ('Kapı Göz (Dürbün)', 'adet', 38, 60, 25, 5, 869000000159),
    ],
    'Yapıştırıcı & Kimyasallar': [
        ('Kontak Yapıştırıcı', 'adet', 48, 75, 35, 8, 869000000160),
        ('Silikon Tabancası', 'adet', 70, 110, 20, 4, 869000000161),
        ('Montaj Köpüğü', 'adet', 85, 130, 24, 5, 869000000162),
        ('Epoksi Yapıştırıcı', 'adet', 60, 95, 18, 4, 869000000163),
        ('Pas Sökücü Sprey', 'adet', 55, 85, 30, 6, 869000000164),
        ('Yağ Gres (Tüp)', 'adet', 28, 45, 40, 8, 869000000165),
    ],
}

INDIVIDUAL_CUSTOMERS = [
    'Ahmet Yılmaz', 'Mehmet Kaya', 'Ayşe Demir', 'Fatma Şahin', 'Mustafa Çelik',
    'Elif Arslan', 'Hüseyin Aydın', 'Zeynep Yıldız', 'Emre Öztürk', 'Hakan Koç',
    'Sibel Aksoy', 'Murat Doğan',
]

WHOLESALE_CUSTOMERS = [
    'Yılmaz İnşaat Ltd. Şti.', 'Kaya Tesisat San. Tic.', 'Demir Elektrik Taahhüt',
    'Öz Yapı Malzemeleri', 'Aydın Boya Dekorasyon', 'Güven İnşaat Ltd. Şti.',
]

PAYMENT_WEIGHTS = [
    (Sale.PaymentType.CASH, 45),
    (Sale.PaymentType.CARD, 30),
    (Sale.PaymentType.TRANSFER, 10),
    (Sale.PaymentType.CREDIT, 15),
]


def weighted_choice(pairs):
    options, weights = zip(*pairs)
    return random.choices(options, weights=weights, k=1)[0]


def random_phone():
    return '5' + ''.join(str(random.randint(0, 9)) for _ in range(9))


class Command(BaseCommand):
    help = 'Demo/gösterim için gerçekçi kategori, ürün, müşteri ve satış verisi üretir.'

    def add_arguments(self, parser):
        parser.add_argument('--sales', type=int, default=70, help='Üretilecek satış sayısı (varsayılan 70).')
        parser.add_argument('--days', type=int, default=45, help='Satışların yayılacağı gün aralığı (varsayılan 45).')

    def handle(self, *args, **options):
        User = get_user_model()
        owner = User.objects.filter(is_superuser=True).first()
        if not owner:
            self.stderr.write(self.style.ERROR('Önce bir superuser oluşturun (python manage.py createsuperuser).'))
            return

        categories = self._seed_categories()
        products = self._seed_products(categories)
        customers = self._seed_customers()
        self._seed_sales(products, customers, owner, options['sales'], options['days'])

        self.stdout.write(self.style.SUCCESS(
            f'Tamamlandı: {Category.objects.count()} kategori, {Product.objects.count()} ürün, '
            f'{Customer.objects.count()} müşteri, {Sale.objects.count()} satış.',
        ))

    def _seed_categories(self):
        categories = {}
        for name in CATEGORIES:
            category, _ = Category.objects.get_or_create(
                name=name, defaults={'description': f'{name} kategorisindeki ürünler.'},
            )
            categories[name] = category
        self.stdout.write(f'{len(categories)} kategori hazır.')
        return categories

    def _seed_products(self, categories):
        products = []
        for category_name, items in CATEGORIES.items():
            category = categories[category_name]
            for name, unit, cost, price, stock, min_stock, barcode in items:
                price_decimal = Decimal(str(price))
                is_low_stock_demo = random.random() < 0.12
                stock_quantity = Decimal(str(min_stock)) if is_low_stock_demo else Decimal(str(stock))
                wholesale_price = round(price_decimal * Decimal('0.88'), 2) if random.random() < 0.6 else None

                product, _ = Product.objects.get_or_create(
                    barcode=str(barcode),
                    defaults={
                        'name': name,
                        'category': category,
                        'unit': unit,
                        'cost_price': Decimal(str(cost)),
                        'price': price_decimal,
                        'wholesale_price': wholesale_price,
                        'stock_quantity': stock_quantity,
                        'min_stock_level': Decimal(str(min_stock)),
                        'is_active': True,
                    },
                )
                products.append(product)
        self.stdout.write(f'{len(products)} ürün hazır.')
        return products

    def _seed_customers(self):
        customers = []
        for name in INDIVIDUAL_CUSTOMERS:
            customer, _ = Customer.objects.get_or_create(
                name=name, defaults={'phone': random_phone(), 'is_wholesale': False},
            )
            customers.append(customer)
        for name in WHOLESALE_CUSTOMERS:
            customer, _ = Customer.objects.get_or_create(
                name=name, defaults={'phone': random_phone(), 'is_wholesale': True, 'notes': 'Toptan / cari müşteri.'},
            )
            customers.append(customer)
        self.stdout.write(f'{len(customers)} müşteri hazır.')
        return customers

    def _seed_sales(self, products, customers, owner, sale_count, days):
        now = timezone.now()
        created_sales = 0

        for i in range(sale_count):
            payment_type = weighted_choice(PAYMENT_WEIGHTS)

            customer = None
            if payment_type == Sale.PaymentType.CREDIT or random.random() < 0.5:
                customer = random.choice(customers)

            item_count = random.randint(1, 4)
            chosen_products = random.sample(products, k=min(item_count, len(products)))

            sale = Sale.objects.create(
                customer=customer, payment_type=payment_type, created_by=owner, total_amount=0,
            )

            total_amount = Decimal('0')
            sale_had_items = False
            for product in chosen_products:
                available = product.stock_quantity
                if available <= 0:
                    continue

                if product.unit in ('kg', 'metre', 'litre'):
                    max_qty = min(available, Decimal('8'))
                    quantity = Decimal(str(round(random.uniform(0.5, float(max_qty)), 2)))
                else:
                    max_qty = min(available, Decimal('6'))
                    quantity = Decimal(random.randint(1, max(1, int(max_qty))))

                if quantity <= 0:
                    continue

                unit_price = product.effective_price(is_wholesale=bool(customer and customer.is_wholesale))
                line_total = quantity * unit_price
                total_amount += line_total
                sale_had_items = True

                SaleItem.objects.create(
                    sale=sale, product=product, quantity=quantity,
                    unit_price=unit_price, line_total=line_total,
                )

                product.stock_quantity = product.stock_quantity - quantity
                product.save(update_fields=['stock_quantity'])

            if not sale_had_items:
                sale.delete()
                continue

            sale.total_amount = total_amount
            sale.save(update_fields=['total_amount'])

            days_ago = 0 if i < 4 else random.randint(0, max(days - 1, 0))
            sale_time = now - timedelta(
                days=days_ago, hours=random.randint(0, 10), minutes=random.randint(0, 59),
            )
            Sale.objects.filter(pk=sale.pk).update(created_at=sale_time)

            for item in sale.items.select_related('product'):
                sm = StockMovement.objects.create(
                    product=item.product, movement_type=StockMovement.MovementType.OUT,
                    quantity=item.quantity, reason=f'Satış #{sale.id}', created_by=owner,
                )
                StockMovement.objects.filter(pk=sm.pk).update(created_at=sale_time)

            if payment_type == Sale.PaymentType.CREDIT:
                ct = CustomerTransaction.objects.create(
                    customer=customer, transaction_type=CustomerTransaction.TransactionType.DEBT,
                    amount=total_amount, note=f'Veresiye satış #{sale.id}', related_sale=sale, created_by=owner,
                )
                CustomerTransaction.objects.filter(pk=ct.pk).update(created_at=sale_time)

            created_sales += 1

        self._seed_payments(customers, owner, now)
        self.stdout.write(f'{created_sales} satış oluşturuldu.')

    def _seed_payments(self, customers, owner, now):
        for customer in customers:
            debt = customer.balance
            if debt and debt > 0 and random.random() < 0.4:
                payment_amount = (debt * Decimal(str(round(random.uniform(0.3, 0.7), 2)))).quantize(Decimal('0.01'))
                if payment_amount <= 0:
                    continue
                payment = CustomerTransaction.objects.create(
                    customer=customer, transaction_type=CustomerTransaction.TransactionType.PAYMENT,
                    amount=payment_amount, note='Kısmi tahsilat', created_by=owner,
                )
                payment_time = now - timedelta(days=random.randint(0, 5), hours=random.randint(0, 10))
                CustomerTransaction.objects.filter(pk=payment.pk).update(created_at=payment_time)
