import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { createProduct, fetchCategories, fetchProduct, updateProduct } from '../../api/products';

const UNITS = [
  { value: 'adet', label: 'Adet' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'metre', label: 'Metre' },
  { value: 'litre', label: 'Litre' },
  { value: 'paket', label: 'Paket' },
];

const EMPTY_FORM = {
  name: '',
  category: '',
  barcode: '',
  unit: 'adet',
  cost_price: '',
  price: '',
  wholesale_price: '',
  stock_quantity: '',
  min_stock_level: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchProduct(id)
      .then((product) =>
        setForm({
          name: product.name,
          category: product.category,
          barcode: product.barcode || '',
          unit: product.unit,
          cost_price: product.cost_price,
          price: product.price,
          wholesale_price: product.wholesale_price || '',
          stock_quantity: product.stock_quantity,
          min_stock_level: product.min_stock_level,
        }),
      )
      .catch(() => setError('Ürün yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('category', form.category);
      payload.append('unit', form.unit);
      payload.append('cost_price', form.cost_price || 0);
      payload.append('price', form.price);
      if (form.wholesale_price) payload.append('wholesale_price', form.wholesale_price);
      if (form.barcode) payload.append('barcode', form.barcode);
      if (!isEdit) payload.append('stock_quantity', form.stock_quantity || 0);
      payload.append('min_stock_level', form.min_stock_level || 0);
      if (imageFile) payload.append('image', imageFile);

      const saved = isEdit ? await updateProduct(id, payload) : await createProduct(payload);
      navigate(`/products/${saved.id}`, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Ürün kaydedilemedi. Alanları kontrol edin.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;

  return (
    <div className="hirdavat-app-content">
      <TopBar title={isEdit ? 'Ürünü Düzenle' : 'Yeni Ürün'} backTo={isEdit ? `/products/${id}` : '/products'} />

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div>
          <label className="form-label small fw-semibold">Ürün Adı</label>
          <input className="form-control" value={form.name} onChange={handleChange('name')} required />
        </div>

        <div>
          <label className="form-label small fw-semibold">Kategori</label>
          <select className="form-select" value={form.category} onChange={handleChange('category')} required>
            <option value="">Seçiniz</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-semibold">Birim</label>
            <select className="form-select" value={form.unit} onChange={handleChange('unit')}>
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small fw-semibold">Barkod</label>
            <input className="form-control" value={form.barcode} onChange={handleChange('barcode')} />
          </div>
        </div>

        <div className="row g-2">
          <div className="col-4">
            <label className="form-label small fw-semibold">Alış Fiyatı</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={form.cost_price}
              onChange={handleChange('cost_price')}
            />
          </div>
          <div className="col-4">
            <label className="form-label small fw-semibold">Satış Fiyatı</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={form.price}
              onChange={handleChange('price')}
              required
            />
          </div>
          <div className="col-4">
            <label className="form-label small fw-semibold">Toptan Fiyat</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={form.wholesale_price}
              onChange={handleChange('wholesale_price')}
            />
          </div>
        </div>

        <div className="row g-2">
          {!isEdit && (
            <div className="col-6">
              <label className="form-label small fw-semibold">Başlangıç Stoğu</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                value={form.stock_quantity}
                onChange={handleChange('stock_quantity')}
              />
            </div>
          )}
          <div className={isEdit ? 'col-12' : 'col-6'}>
            <label className="form-label small fw-semibold">Minimum Stok Seviyesi</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              value={form.min_stock_level}
              onChange={handleChange('min_stock_level')}
            />
          </div>
        </div>

        <div>
          <label className="form-label small fw-semibold">Fotoğraf</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}

        <button type="submit" className="btn btn-success btn-lg" disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}
