export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '-';
  return Number(value).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

export function statusClass(status = '') {
  const key = String(status).toLowerCase();
  if (key.includes('approve') || key.includes('complete') || key.includes('receive')) return 'status success';
  if (key.includes('pending') || key.includes('progress')) return 'status warning';
  if (key.includes('reject') || key.includes('cancel') || key.includes('discrep')) return 'status danger';
  return 'status neutral';
}
