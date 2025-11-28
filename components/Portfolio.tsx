import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { PortfolioProperty } from '../types';
import { downloadCsv } from '../utils/export';

const formatTl = (value: number | null | undefined) => {
  if (value == null) return '-';
  return `${value.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  })} TL`;
};

const formatArea = (value: number | null | undefined) => {
  if (value == null) return '-';
  return `${value.toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  })} m²`;
};

export const PortfolioSection: React.FC = () => {
  const [items, setItems] = useState<PortfolioProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getPortfolio();
        setItems(data);
      } catch (e) {
        setError('Portföy verisi yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalValuation = items.reduce(
    (sum, p) => sum + (p.valuation_value_tl ?? 0),
    0,
  );

  const pendorya = items.find((p) =>
    p.name.toLowerCase().includes('pendorya'),
  );

  const pendoryaShare =
    totalValuation > 0 && pendorya?.valuation_value_tl
      ? (pendorya.valuation_value_tl / totalValuation) * 100
      : null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Portföy Özeti
            </h2>
            <button
              onClick={() => downloadCsv('tskb-gyo-portfolio.csv', items)}
              className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50"
            >
              Excel'e aktar
            </button>
          </div>
          <p className="text-sm text-gray-500">
            30.06.2025 tarihli ekspertiz değerleri baz alınmıştır. Demo amaçlı
            görselleştirme.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-gray-500">Toplam Ekspertiz Değeri</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatTl(totalValuation)}
          </p>
          {pendoryaShare !== null && (
            <div className="inline-flex mt-2 text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Pendorya payı: {pendoryaShare.toFixed(1)} %
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Portföy verisi yükleniyor…</div>
      )}

      {error && !loading && (
        <div className="text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && (
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
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.property_type || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.city || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.rooms
                      ? `${p.rooms} oda`
                      : formatArea(p.gross_area_sqm)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatArea(p.gla_sqm)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatTl(p.valuation_value_tl)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.valuation_date || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
