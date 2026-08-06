"""Reportlab tabanlı basit PDF üretim yardımcıları (fiş, cari hesap özeti vb.)."""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet


def build_statement_pdf(customer, transactions, start_date, end_date):
    """Müşterinin belirli bir tarih aralığındaki cari hesap hareketlerini PDF'e döker."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = [
        Paragraph('Cari Hesap Özeti', styles['Title']),
        Paragraph(f'Müşteri: {customer.name}', styles['Normal']),
        Paragraph(f'Telefon: {customer.phone or "-"}', styles['Normal']),
        Paragraph(f'Dönem: {start_date} — {end_date}', styles['Normal']),
        Spacer(1, 10 * mm),
    ]

    data = [['Tarih', 'Tür', 'Açıklama', 'Tutar']]
    for tx in transactions:
        data.append([
            tx.created_at.strftime('%d.%m.%Y %H:%M'),
            tx.get_transaction_type_display(),
            tx.note or '-',
            f'{tx.amount:.2f} TL',
        ])

    table = Table(data, colWidths=[35 * mm, 30 * mm, 70 * mm, 30 * mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')]),
        ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(f'<b>Güncel Bakiye: {customer.balance:.2f} TL</b>', styles['Normal']))

    doc.build(elements)
    buffer.seek(0)
    return buffer


def build_receipt_pdf(sale):
    """Bir satışın fiş/fatura çıktısını A5 formatında PDF olarak üretir."""
    from reportlab.lib.pagesizes import A5

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A5, topMargin=12 * mm, bottomMargin=12 * mm)
    styles = getSampleStyleSheet()

    payment_labels = dict(sale.PaymentType.choices)
    elements = [
        Paragraph('SATIŞ FİŞİ', styles['Title']),
        Paragraph(f'Fiş No: #{sale.id}', styles['Normal']),
        Paragraph(f'Tarih: {sale.created_at.strftime("%d.%m.%Y %H:%M")}', styles['Normal']),
        Paragraph(f'Ödeme Tipi: {payment_labels.get(sale.payment_type, sale.payment_type)}', styles['Normal']),
        Paragraph(f'Müşteri: {sale.customer.name if sale.customer else "Peşin Müşteri"}', styles['Normal']),
        Spacer(1, 6 * mm),
    ]

    data = [['Ürün', 'Adet', 'Birim Fiyat', 'Tutar']]
    for item in sale.items.select_related('product'):
        data.append([
            item.product.name,
            f'{item.quantity} {item.product.unit}',
            f'{item.unit_price:.2f} TL',
            f'{item.line_total:.2f} TL',
        ])

    table = Table(data, colWidths=[45 * mm, 25 * mm, 25 * mm, 25 * mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ALIGN', (1, 0), (3, -1), 'RIGHT'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 6 * mm))
    elements.append(Paragraph(f'<b>TOPLAM: {sale.total_amount:.2f} TL</b>', styles['Heading3']))

    if sale.status == sale.Status.CANCELLED:
        elements.append(Spacer(1, 4 * mm))
        elements.append(Paragraph('*** BU SATIŞ İPTAL EDİLMİŞTİR ***', styles['Heading4']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
