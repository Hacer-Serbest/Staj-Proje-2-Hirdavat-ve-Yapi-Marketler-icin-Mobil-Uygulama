import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { adjustStock, deleteProduct, fetchProduct } from '../../api/products';
import { formatCurrency } from '../../utils/formatCurrency';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustError, setAdjustError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadProduct = () => fetchProduct(id).then(setProduct).catch(() => setProduct(null));

  useEffect(() => {
    setIsLoading(true);
    loadProduct().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleQuickAdjust = async (movementType, quantity) => {
    setAdjustError('');
    setBusy(true);
    try {
      await adjustStock(id, { movement_type: movementType, quantity, reason: 'Hızlı düzeltme' });
      await loadProduct();
    } catch {
      setAdjustError('Stok güncellenemedi.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setBusy(true);
    try {
      await deleteProduct(id);
      navigate('/products', { replace: true });
    } catch {
      setAdjustError('Ürün silinemedi (satış geçmişi olan ürünler silinemez, pasif hale getirin).');
      setBusy(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;
  if (!product) {
    return (
      <div className="hirdavat-app-content">
        <TopBar title="Ürün" backTo="/products" />
        <p className="text-secondary">Ürün bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="hirdavat-app-content">
      <TopBar title={product.name} backTo="/products" />

      <div className="hirdavat-product-card__image mb-3" style={{ borderRadius: 12 }}>
        {product.image ? <img src={product.image} alt={product.name} /> : <span style={{ fontSize: '3rem' }}>🧰</span>}
      </div>

      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div className="small text-secondary">{product.category_name}</div>
          <h1 className="h5 fw-bold mb-0">{product.name}</h1>
          {product.barcode && <small className="text-secondary">Barkod: {product.barcode}</small>}
        </div>
        {product.is_low_stock && <span className="badge text-bg-warning">Kritik Stok</span>}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-4">
          <div className="border rounded p-2 text-center">
            <div className="small text-secondary">Satış</div>
            <div className="fw-bold text-success">{formatCurrency(product.price)}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="border rounded p-2 text-center">
            <div className="small text-secondary">Alış</div>
            <div className="fw-bold">{formatCurrency(product.cost_price)}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="border rounded p-2 text-center">
            <div className="small text-secondary">Toptan</div>
            <div className="fw-bold">{product.wholesale_price ? formatCurrency(product.wholesale_price) : '-'}</div>
          </div>
        </div>
      </div>

      <div className="border rounded p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Stok Durumu</span>
          <span>
            {product.stock_quantity} {product.unit} <small className="text-secondary">(min {product.min_stock_level})</small>
          </span>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary flex-fill"
            disabled={busy}
            onClick={() => handleQuickAdjust('out', 1)}
          >
            − 1
          </button>
          <button
            type="button"
            className="btn btn-outline-success flex-fill"
            disabled={busy}
            onClick={() => handleQuickAdjust('in', 1)}
          >
            + 1
          </button>
        </div>
        {adjustError && <div className="text-danger small mt-2">{adjustError}</div>}
      </div>

      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => navigate(`/products/${id}/edit`)}>
          Düzenle
        </button>
        <button type="button" className="btn btn-outline-danger flex-fill" onClick={handleDelete} disabled={busy}>
          Sil
        </button>
      </div>
    </div>
  );
}
