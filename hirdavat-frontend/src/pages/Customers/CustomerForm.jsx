import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { createCustomer, fetchCustomer, updateCustomer } from '../../api/customers';

const EMPTY_FORM = { name: '', phone: '', address: '', is_wholesale: false, notes: '' };

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    fetchCustomer(id)
      .then((customer) =>
        setForm({
          name: customer.name,
          phone: customer.phone || '',
          address: customer.address || '',
          is_wholesale: customer.is_wholesale,
          notes: customer.notes || '',
        }),
      )
      .catch(() => setError('Müşteri yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const saved = isEdit ? await updateCustomer(id, form) : await createCustomer(form);
      navigate(`/customers/${saved.id}`, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : detail?.phone?.[0] || 'Müşteri kaydedilemedi. Alanları kontrol edin.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;

  return (
    <div className="hirdavat-app-content">
      <TopBar title={isEdit ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'} backTo={isEdit ? `/customers/${id}` : '/customers'} />

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div>
          <label className="form-label small fw-semibold">Ad Soyad / Firma</label>
          <input className="form-control" value={form.name} onChange={handleChange('name')} required />
        </div>

        <div>
          <label className="form-label small fw-semibold">Telefon</label>
          <input
            className="form-control"
            placeholder="5XXXXXXXXX"
            value={form.phone}
            onChange={handleChange('phone')}
          />
        </div>

        <div>
          <label className="form-label small fw-semibold">Adres</label>
          <textarea className="form-control" rows={2} value={form.address} onChange={handleChange('address')} />
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="is_wholesale"
            checked={form.is_wholesale}
            onChange={(e) => setForm((prev) => ({ ...prev, is_wholesale: e.target.checked }))}
          />
          <label className="form-check-label" htmlFor="is_wholesale">
            Toptan müşteri (özel fiyat listesi uygulanır)
          </label>
        </div>

        <div>
          <label className="form-label small fw-semibold">Notlar</label>
          <textarea className="form-control" rows={2} value={form.notes} onChange={handleChange('notes')} />
        </div>

        {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}

        <button type="submit" className="btn btn-success btn-lg" disabled={isSaving}>
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}
