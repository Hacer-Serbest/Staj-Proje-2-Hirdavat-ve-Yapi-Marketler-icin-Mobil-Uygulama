import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { cancelSale, fetchReceiptPdf, fetchSale } from '../../api/sales';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const PAYMENT_LABELS = { cash: 'Nakit', card: 'Kredi Kartı', transfer: 'Havale/EFT', credit: 'Veresiye' };

export default function SaleReceipt() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadSale = () => fetchSale(id).then(setSale).catch(() => setSale(null));

  useEffect(() => {
    setIsLoading(true);
    loadSale().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownloadPdf = async () => {
    setBusy(true);
    try {
      const blob = await fetchReceiptPdf(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('İptal nedeni (opsiyonel):', '');
    if (reason === null) return;
    setBusy(true);
    try {
      await cancelSale(id, { reason });
      await loadSale();
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;
  if (!sale) {
    return (
      <div className="hirdavat-app-content">
        <TopBar title="Satış" backTo="/pos" />
        <p className="text-secondary">Satış bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="hirdavat-app-content">
      <TopBar title={`Fiş #${sale.id}`} backTo="/pos" />

      {sale.status === 'cancelled' && <div className="alert alert-danger py-2 small">Bu satış iptal edilmiştir.</div>}

      <div className="border rounded p-3 mb-3">
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Tarih</span>
          <span>{formatDateTime(sale.created_at)}</span>
        </div>
        <div className="d-flex justify-content-between small text-secondary mb-1">
          <span>Ödeme</span>
          <span>{PAYMENT_LABELS[sale.payment_type]}</span>
        </div>
        <div className="d-flex justify-content-between small text-secondary">
          <span>Müşteri</span>
          <span>{sale.customer_name || 'Peşin Müşteri'}</span>
        </div>
      </div>

      <div className="d-flex flex-column gap-2 mb-3">
        {sale.items.map((item) => (
          <div key={item.id} className="d-flex justify-content-between border-bottom pb-2">
            <div>
              <div className="fw-semibold small">{item.product_name}</div>
              <small className="text-secondary">
                {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
              </small>
            </div>
            <div className="fw-semibold">{formatCurrency(item.line_total)}</div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
        <span className="fw-semibold">Toplam</span>
        <span className="fs-4 fw-bold text-success">{formatCurrency(sale.total_amount)}</span>
      </div>

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={handleDownloadPdf} disabled={busy}>
          Fiş PDF
        </button>
        {sale.status !== 'cancelled' && (
          <button type="button" className="btn btn-outline-danger flex-fill" onClick={handleCancel} disabled={busy}>
            Satışı İptal Et
          </button>
        )}
      </div>
    </div>
  );
}
