export const formatTl = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
) => {
  if (value == null) return '—';
  const formatted = value.toLocaleString('tr-TR', options);
  return `${formatted} TL`;
};

export const formatArea = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
) => {
  if (value == null) return '—';
  const formatted = value.toLocaleString('tr-TR', options);
  return `${formatted} m²`;
};

export const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('tr-TR');
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
