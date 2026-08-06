import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import TopBar from '../../components/common/TopBar';
import { fetchCustomers } from '../../api/customers';
import { formatCurrency } from '../../utils/formatCurrency';

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      fetchCustomers(search.trim() ? { search: search.trim() } : {})
        .then((data) => setCustomers(data.results ?? data))
        .catch(() => setCustomers([]))
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="hirdavat-app-content">
      <TopBar title="Müşteriler" />

      <div className="input-group mb-3">
        <span className="input-group-text bg-white">🔍</span>
        <input
          type="search"
          className="form-control"
          placeholder="Müşteri adı veya telefon ara"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : customers.length === 0 ? (
        <EmptyState title="Müşteri bulunamadı" icon="👤" />
      ) : (
        <div className="d-flex flex-column gap-2">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              className="btn btn-light border text-start d-flex justify-content-between align-items-center"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              <div>
                <div className="fw-semibold">{customer.name}</div>
                <small className="text-secondary">{customer.phone || 'Telefon yok'}</small>
                {customer.is_wholesale && <span className="badge text-bg-secondary ms-2">Toptan</span>}
              </div>
              <div className={`fw-bold ${Number(customer.balance) > 0 ? 'text-danger' : 'text-success'}`}>
                {formatCurrency(customer.balance)}
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-success rounded-circle shadow"
        style={{ position: 'absolute', bottom: 88, right: 16, width: 56, height: 56, fontSize: 24 }}
        onClick={() => navigate('/customers/new')}
        aria-label="Yeni müşteri ekle"
      >
        +
      </button>
    </div>
  );
}
