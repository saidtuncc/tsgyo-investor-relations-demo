export const downloadCsv = <T extends object>(filename: string, rows: T[]): void => {
  if (!rows.length) return;

  const headers = Object.keys(rows[0] as Record<string, unknown>);

  const escapeValue = (value: unknown) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value).replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => escapeValue((row as Record<string, unknown>)[header]))
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
