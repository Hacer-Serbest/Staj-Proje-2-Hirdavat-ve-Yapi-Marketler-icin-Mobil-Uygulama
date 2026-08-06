import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export default function TopBar({ title, backTo }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <header className="hirdavat-topbar">
      <div className="d-flex align-items-center gap-2">
        {backTo && (
          <button
            type="button"
            className="btn btn-sm btn-light border-0"
            onClick={() => navigate(backTo)}
            aria-label="Geri"
          >
            ←
          </button>
        )}
        <div>
          <div className="fw-semibold">{title}</div>
          {user?.shop_name && <small className="text-secondary">{user.shop_name}</small>}
        </div>
      </div>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={logout}>
        Çıkış
      </button>
    </header>
  );
}
