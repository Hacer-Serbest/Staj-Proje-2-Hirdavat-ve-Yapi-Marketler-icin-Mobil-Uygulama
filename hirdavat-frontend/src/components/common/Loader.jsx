export default function Loader({ fullscreen = false, label = 'Yükleniyor...' }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center gap-2 text-secondary ${
        fullscreen ? 'vh-100' : 'py-5'
      }`}
    >
      <div className="spinner-border text-success" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <small>{label}</small>
    </div>
  );
}
