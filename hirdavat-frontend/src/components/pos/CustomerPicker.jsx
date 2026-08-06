import { useEffect, useState } from 'react';

import { fetchCustomers } from '../../api/customers';

export default function CustomerPicker({ customer, onSelect, required }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeoutId = setTimeout(() => {
      fetchCustomers({ search: query.trim() })
        .then((data) => setResults(data.results ?? data))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [query]);

  if (customer) {
    return (
      <div className="d-flex align-items-center justify-content-between border rounded p-2">
        <div>
          <div className="fw-semibold">{customer.name}</div>
          {customer.phone && <small className="text-secondary">{customer.phone}</small>}
        </div>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onSelect(null)}>
          Değiştir
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control"
        placeholder={required ? 'Müşteri ara (zorunlu — veresiye)' : 'Müşteri ara (opsiyonel)'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && results.length > 0 && (
        <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1050, maxHeight: 200, overflowY: 'auto' }}>
          {results.map((c) => (
            <li
              key={c.id}
              className="list-group-item list-group-item-action"
              role="button"
              onClick={() => {
                onSelect(c);
                setQuery('');
                setIsOpen(false);
              }}
            >
              <div className="fw-semibold">{c.name}</div>
              {c.phone && <small className="text-secondary">{c.phone}</small>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
