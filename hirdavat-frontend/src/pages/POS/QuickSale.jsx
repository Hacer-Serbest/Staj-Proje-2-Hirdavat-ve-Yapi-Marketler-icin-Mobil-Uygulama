import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CartPanel from '../../components/pos/CartPanel';
import CustomerPicker from '../../components/pos/CustomerPicker';
import CategoryTabs from '../../components/products/CategoryTabs';
import ProductCard from '../../components/products/ProductCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { fetchCategories, fetchProducts } from '../../api/products';
import { createSale } from '../../api/sales';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatCurrency';

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Nakit' },
  { value: 'card', label: 'Kredi Kartı' },
  { value: 'transfer', label: 'Havale/EFT' },
  { value: 'credit', label: 'Veresiye' },
];

export default function QuickSale() {
  const navigate = useNavigate();
  const { items, customer, setCustomer, addItem, total, itemCount, clearCart, unitPriceFor } = useCart();

  const [view, setView] = useState('browse'); // 'browse' | 'checkout'
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [paymentType, setPaymentType] = useState('cash');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedSale, setCompletedSale] = useState(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (view !== 'browse') return;
    setIsLoading(true);
    const params = { is_active: true };
    if (activeCategory) params.category = activeCategory;
    if (search.trim()) params.search = search.trim();

    const timeoutId = setTimeout(() => {
      fetchProducts(params)
        .then((data) => setProducts(data.results ?? data))
        .catch(() => setProducts([]))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeCategory, search, view]);

  const handleCompleteSale = async () => {
    setError('');
    if (paymentType === 'credit' && !customer) {
      setError('Veresiye satış için müşteri seçmelisiniz.');
      return;
    }
    setSubmitting(true);
    try {
      const sale = await createSale({
        customer: customer?.id ?? null,
        payment_type: paymentType,
        note,
        items: items.map((item) => ({ product: item.product.id, quantity: item.quantity })),
      });
      setCompletedSale(sale);
      clearCart();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Satış tamamlanamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  const startNewSale = () => {
    setCompletedSale(null);
    setPaymentType('cash');
    setNote('');
    setView('browse');
  };

  if (completedSale) {
    return (
      <div className="hirdavat-app-content d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '80vh' }}>
        <div style={{ fontSize: '3rem' }}>✅</div>
        <h2 className="h5 fw-bold mt-2">Satış Tamamlandı</h2>
        <p className="text-secondary">Fiş No: #{completedSale.id}</p>
        <p className="fs-3 fw-bold text-success">{formatCurrency(completedSale.total_amount)}</p>
        <div className="d-flex gap-2 mt-3">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(`/sales/${completedSale.id}`)}>
            Fişi Görüntüle
          </button>
          <button type="button" className="btn btn-success" onClick={startNewSale}>
            Yeni Satış
          </button>
        </div>
      </div>
    );
  }

  if (view === 'checkout') {
    return (
      <div className="hirdavat-app-content">
        <TopBar title="Ödeme" />
        <button type="button" className="btn btn-sm btn-link px-0 mb-2" onClick={() => setView('browse')}>
          ← Ürünlere dön
        </button>

        <CartPanel />

        <hr />

        <div className="mb-3">
          <label className="form-label small fw-semibold">Müşteri</label>
          <CustomerPicker customer={customer} onSelect={setCustomer} required={paymentType === 'credit'} />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Ödeme Tipi</label>
          <div className="d-flex gap-2 flex-wrap">
            {PAYMENT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                className={`btn btn-sm ${paymentType === pt.value ? 'btn-success' : 'btn-outline-secondary'}`}
                onClick={() => setPaymentType(pt.value)}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Not (opsiyonel)</label>
          <textarea className="form-control" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
          <span className="fw-semibold">Toplam</span>
          <span className="fs-4 fw-bold text-success">{formatCurrency(total)}</span>
        </div>

        <button type="button" className="btn btn-success btn-lg w-100" onClick={handleCompleteSale} disabled={submitting || items.length === 0}>
          {submitting ? 'İşleniyor...' : 'Satışı Tamamla'}
        </button>
      </div>
    );
  }

  return (
    <div className="hirdavat-app-content">
      <TopBar title="Hızlı Satış" />

      <div className="input-group mb-3">
        <span className="input-group-text bg-white">🔍</span>
        <input
          type="search"
          className="form-control"
          placeholder="Ürün adı veya barkod ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CategoryTabs categories={categories} activeId={activeCategory} onChange={setActiveCategory} />

      {isLoading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState title="Ürün bulunamadı" icon="🔍" />
      ) : (
        <div className="hirdavat-product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              priceOverride={unitPriceFor(product)}
              onClick={(p) => addItem(p, 1)}
            />
          ))}
        </div>
      )}

      {itemCount > 0 && (
        <div className="hirdavat-cart-bar">
          <button type="button" className="btn btn-success w-100 shadow d-flex justify-content-between align-items-center px-3" onClick={() => setView('checkout')}>
            <span>{itemCount} ürün</span>
            <span>Sepete Git</span>
            <span>{formatCurrency(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
