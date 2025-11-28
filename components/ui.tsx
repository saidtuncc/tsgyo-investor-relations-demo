import React from 'react';

export const MetricCard: React.FC<{
  title: string;
  value?: string | number | null;
  prefix?: string;
  suffix?: string;
  hint?: string;
}> = ({ title, value, prefix = '', suffix = '', hint }) => {
  const isMissing = value === null || value === undefined;
  const formatted = isMissing
    ? '—'
    : typeof value === 'number'
    ? value.toLocaleString('tr-TR')
    : value;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
          <div className="text-2xl font-bold text-slate-800 leading-tight">
            {isMissing ? formatted : `${prefix}${formatted}${suffix}`}
          </div>
        </div>
      </div>
      {hint && <p className="text-xs text-gray-500 mt-2 leading-snug">{hint}</p>}
    </div>
  );
};

export const PageSection: React.FC<{
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, actions, children, className }) => (
  <section className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className ?? ''}`}>
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
    {children}
  </section>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="p-10 text-center text-gray-500 space-y-3">
    <p className="text-lg font-semibold text-slate-800">{title}</p>
    <p className="text-sm text-gray-500 max-w-xl mx-auto">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center justify-center text-sm px-4 py-2 rounded-lg border border-gray-200 text-slate-700 hover:bg-gray-50"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
