import { formatCurrency } from '../../utils/formatCurrency';

export default function ProductCard({ product, onClick, priceOverride, footer }) {
  const price = priceOverride ?? product.price;

  return (
    <button type="button" className="hirdavat-product-card" onClick={() => onClick?.(product)}>
      <div className="hirdavat-product-card__image">
        {product.image ? <img src={product.image} alt={product.name} /> : <span>🧰</span>}
      </div>
      <div className="hirdavat-product-card__body">
        <div className="small text-secondary text-truncate">{product.category_name}</div>
        <div className="fw-semibold text-truncate" title={product.name}>
          {product.name}
        </div>
        <div className="d-flex align-items-center justify-content-between mt-1">
          <span className="fw-bold text-success">{formatCurrency(price)}</span>
          {product.is_low_stock ? (
            <span className="badge text-bg-warning">Kritik</span>
          ) : (
            <span className="small text-secondary">
              {product.stock_quantity} {product.unit}
            </span>
          )}
        </div>
        {footer}
      </div>
    </button>
  );
}
