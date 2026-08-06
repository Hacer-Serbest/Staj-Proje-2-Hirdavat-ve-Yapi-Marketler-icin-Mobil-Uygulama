import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { fetchCustomer, fetchStatement, fetchStatementPdf, recordDebt, recordPayment } from '../../api/customers';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';

const TX_LABELS = { debt: 'Veresiye Borcu', payment: 'Tahsilat' };

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [statement, setStatement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'payment' | 'debt' | null
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    const [customerData, statementData] = await Promise.all([fetchCustomer(id), fetchStatement(id)]);
    setCustomer(customerData);
    setStatement(statementData);
  };

  useEffect(() => {
    setIsLoading(true);
    loadData()
      .catch(() => setCustomer(null))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openModal = (type) => {
    setModal(type);
    setAmount('');
    setNote('');
    setError('');
  };

  const handleSubmitTransaction = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const action = modal === 'payment' ? recordPayment : recordDebt;
      await action(id, { amount, note });
      await loadData();
      setModal(null);
    } catch {
      setError('İşlem kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadStatement = async () => {
    setBusy(true);
    try {
      const blob = await fetchStatementPdf(id);
      window.open(window.URL.createObjectURL(blob), '_blank');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <Loader fullscreen />;
  if (!customer) {
    return (
      <div className="hirdavat-app-content">
        <TopBar title="Müşteri" backTo="/customers" />
        <p className="text-secondary">Müşteri bulunamadı.</p>
      </div>
    );
  }

  const balance = Number(customer.balance);

  return (
    <div className="hirdavat-app-content">
      <TopBar title={customer.name} backTo="/customers" />

      <div className="text-center border rounded p-3 mb-3">
        <div className="small text-secondary">Cari Bakiye</div>
        <div className={`fs-2 fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(balance)}</div>
        <small className="text-secondary">{balance > 0 ? 'Müşteri borçlu' : 'Borç yok'}</small>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button type="button" className="btn btn-success flex-fill" onClick={() => openModal('payment')}>
          Tahsilat Al
        </button>
        <button type="button" className="btn btn-outline-danger flex-fill" onClick={() => openModal('debt')}>
          Veresiye Ekle
        </button>
      </div>

      <div className="d-flex gap-2 mb-4">
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => navigate(`/customers/${id}/edit`)}>
          Düzenle
        </button>
        <button type="button" className="btn btn-outline-secondary flex-fill" onClick={handleDownloadStatement} disabled={busy}>
          Cari Özet PDF
        </button>
      </div>

      <h2 className="h6 fw-bold mb-2">Hareketler (Bu Ay)</h2>
      {statement?.transactions?.length ? (
        <div className="d-flex flex-column gap-2">
          {statement.transactions
            .slice()
            .reverse()
            .map((tx) => (
              <div key={tx.id} className="d-flex justify-content-between border-bottom pb-2">
                <div>
                  <div className="small fw-semibold">{TX_LABELS[tx.transaction_type]}</div>
                  <small className="text-secondary">{formatDateTime(tx.created_at)}</small>
                  {tx.note && <div className="small text-secondary">{tx.note}</div>}
                </div>
                <div className={`fw-semibold ${tx.transaction_type === 'debt' ? 'text-danger' : 'text-success'}`}>
                  {tx.transaction_type === 'debt' ? '+' : '−'}
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-secondary small">Bu ay için hareket bulunmuyor.</p>
      )}

      {modal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}
          onClick={() => setModal(null)}
        >
          <div className="bg-white w-100 p-4 rounded-top" style={{ maxWidth: 480, margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="h6 fw-bold mb-3">{modal === 'payment' ? 'Tahsilat Kaydı' : 'Veresiye Borcu Ekle'}</h3>
            <form onSubmit={handleSubmitTransaction} className="d-flex flex-column gap-3">
              <div>
                <label className="form-label small fw-semibold">Tutar</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control form-control-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="form-label small fw-semibold">Not (opsiyonel)</label>
                <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setModal(null)}>
                  Vazgeç
                </button>
                <button type="submit" className="btn btn-success flex-fill" disabled={busy}>
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
