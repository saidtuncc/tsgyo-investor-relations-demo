const escapeValue = (value: unknown) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return value.toLocaleString('tr-TR');
  if (typeof value === 'string') return value.replace(/"/g, '""');
  return JSON.stringify(value).replace(/"/g, '""');
};

export const downloadCsv = <T extends object>(filename: string, rows: T[]): void => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0] as Record<string, unknown>);
  if (!headers.length) return;

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const raw = (row as Record<string, unknown>)[header];
          const escaped = escapeValue(raw);
          return `"${escaped}"`;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
