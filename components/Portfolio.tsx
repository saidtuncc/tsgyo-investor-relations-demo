import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { PortfolioProperty } from '../types';
import { downloadCsv } from '../utils/export';
import { EmptyState, PageSection } from './ui';
import { companyConfig } from '../src/config/company';
import { formatArea, formatDate, formatTl } from '../src/utils/format';

export const PortfolioSection: React.FC = () => {
  const [items, setItems] = useState<PortfolioProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPortfolio();
      setItems(data);
    } catch (e) {
      setError('Portföy verisi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const totalValuation = items.reduce((sum, p) => sum + (p.valuation_value_tl ?? 0), 0);

  const pendorya = items.find((p) => p.name.toLowerCase().includes('pendorya'));

  const pendoryaShare =
    totalValuation > 0 && pendorya?.valuation_value_tl
      ? (pendorya.valuation_value_tl / totalValuation) * 100
      : null;

  const handleExport = () => {
    if (!items.length) return;

    downloadCsv(
      `${companyConfig.code.toLowerCase()}-portfoy-ozeti.csv`,
      items.map((p) => ({
        Varlik: p.name,
        Tur: p.property_type ?? '',
        Sehir: p.city ?? '',
        BrutAlanVeyaOda: p.rooms ?? p.gross_area_sqm ?? '',
        KiralanabilirAlan: p.gla_sqm ?? '',
        EkspertizDegeriTL: p.valuation_value_tl ?? '',
        EkspertizTarihi: p.valuation_date ?? '',
      })),
    );
  };

  return (
    <PageSection
      title={companyConfig.dashboard.portfolioSummaryTitle}
      subtitle={companyConfig.dashboard.portfolioSummarySubtitle}
      actions={
        <button
          onClick={handleExport}
          className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50"
        >
          Excel'e aktar
        </button>
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-xs uppercase text-gray-500">Toplam Ekspertiz Değeri</p>
          <p className="text-lg font-semibold text-gray-900">{formatTl(totalValuation)}</p>
        </div>
        {pendoryaShare !== null && (
          <div className="inline-flex text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Pendorya payı: {pendoryaShare.toFixed(1)} %
          </div>
        )}
      </div>

      {loading && <div className="text-sm text-gray-500">Portföy verisi yükleniyor…</div>}

      {error && !loading && (
        <EmptyState
          title="Portföy verisi alınamadı"
          description={error}
          actionLabel="Tekrar dene"
          onAction={load}
        />
      )}

      {!loading && !error && !items.length && (
        <EmptyState
          title="Portföy listesi boş"
          description="Demo veri seti henüz yüklenmemiş görünüyor. Backend bağlantısını veya seed verisini kontrol edin."
          actionLabel="Yenile"
          onAction={load}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-500">
                <th className="px-4 py-3">Varlık</th>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Şehir</th>
                <th className="px-4 py-3">Brüt Alan / Oda</th>
                <th className="px-4 py-3">Kiralanabilir Alan</th>
                <th className="px-4 py-3">Ekspertiz Değeri</th>
                <th className="px-4 py-3">Ekspertiz Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-700">{p.property_type || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{p.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.rooms ? `${p.rooms} oda` : formatArea(p.gross_area_sqm)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatArea(p.gla_sqm)}</td>
                  <td className="px-4 py-3 text-gray-900">{formatTl(p.valuation_value_tl)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(p.valuation_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageSection>
  );
};
