export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR');
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
