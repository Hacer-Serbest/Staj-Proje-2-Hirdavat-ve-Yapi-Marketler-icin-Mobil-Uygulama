export default function EmptyState({ title = 'Kayıt bulunamadı', description, icon = '📦' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center text-secondary py-5">
      <div style={{ fontSize: '2.5rem' }}>{icon}</div>
      <p className="fw-semibold mb-1 mt-2">{title}</p>
      {description && <small>{description}</small>}
    </div>
  );
}
