import { formatCurrency } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

export default function CartPanel() {
  const { items, updateQuantity, removeItem, unitPriceFor } = useCart();

  if (items.length === 0) {
    return <p className="text-secondary text-center py-4">Sepet boş. Ürün eklemek için ürünlere dokunun.</p>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      {items.map(({ product, quantity }) => {
        const unitPrice = unitPriceFor(product);
        return (
          <div key={product.id} className="d-flex align-items-center gap-2 border rounded p-2">
            <div className="flex-grow-1">
              <div className="fw-semibold small">{product.name}</div>
              <div className="text-secondary small">
                {formatCurrency(unitPrice)} / {product.unit}
              </div>
            </div>
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                −
              </button>
              <span style={{ minWidth: 28, textAlign: 'center' }}>{quantity}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => updateQuantity(product.id, quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="fw-semibold text-end" style={{ minWidth: 70 }}>
              {formatCurrency(unitPrice * quantity)}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-danger"
              onClick={() => removeItem(product.id)}
              aria-label="Ürünü kaldır"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
