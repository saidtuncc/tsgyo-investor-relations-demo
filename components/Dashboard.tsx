import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FinancialKpi } from '../types';
import { api } from '../services/api';
import { PortfolioSection } from './Portfolio';
import { downloadCsv } from '../utils/export';

const KpiCard = ({
  title,
  value,
  prefix = '',
  suffix = '',
}: {
  title: string;
  value?: string | number | null;
  prefix?: string;
  suffix?: string;
}) => {
  const isMissing = value === null || value === undefined;

  const formatted = isMissing
    ? '—'
    : typeof value === 'number'
    ? value.toLocaleString('tr-TR')
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <span className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
        {title}
      </span>
      <span className="text-2xl font-bold text-slate-800">
        {isMissing ? formatted : `${prefix}${formatted}${suffix}`}
      </span>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<FinancialKpi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getKpis()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Finansal veriler yükleniyor...
      </div>
    );

  if (!data.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        Gösterilecek finansal veri bulunamadı.
      </div>
    );
  }

  const latest = data[data.length - 1];

  // Grafik için üst limit (max değerin %20 üstü)
  const maxValue = Math.max(
    ...data.map((d) => d.total_assets),
    ...data.map((d) => d.equity),
    0,
  );
  const yMax = maxValue ? maxValue * 1.2 : undefined;

  const formatPercent = (
    numerator?: number | null,
    denominator?: number | null,
  ) => {
    if (!denominator) return '—';
    if (numerator === null || numerator === undefined) return '—';
    const ratio = (numerator / denominator) * 100;
    return `${ratio.toFixed(1)} %`;
  };

  const equityToAssets = formatPercent(latest?.equity, latest?.total_assets);
  const investmentToAssets = formatPercent(
    latest?.investment_properties,
    latest?.total_assets,
  );

  const equityRatio =
    latest?.equity !== undefined && latest?.equity !== null && latest?.total_assets
      ? latest.equity / latest.total_assets
      : null;
  const ipRatio =
    latest?.investment_properties !== undefined &&
    latest?.investment_properties !== null &&
    latest?.total_assets
      ? latest.investment_properties / latest.total_assets
      : null;

  const equityComment = () => {
    if (equityRatio === null) return 'Özkaynak oranı hesaplanamadı.';
    if (equityRatio < 0.35)
      return 'Özkaynak / toplam varlık oranı görece düşük, kaldıraç seviyesi dikkatle izlenmelidir.';
    if (equityRatio <= 0.55)
      return 'Özkaynak / toplam varlık oranı dengeli bir seviyede.';
    return 'Özkaynak / toplam varlık oranı güçlü bir sermaye yapısına işaret ediyor.';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-800">Finansal Özet</h2>
          <button
            onClick={() => downloadCsv('tskb-gyo-kpi.csv', data)}
            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50"
          >
            KPI'ları Excel'e aktar
          </button>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded self-start sm:self-auto">
          Dönem: {latest?.period}
        </span>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <KpiCard
          title="Toplam Varlıklar"
          value={latest?.total_assets}
          suffix=" TL"
        />
        <KpiCard
          title="Özkaynaklar"
          value={latest?.equity}
          suffix=" TL"
        />
        <KpiCard
          title="Yatırım Amaçlı Gayrimenkuller"
          value={latest?.investment_properties}
          suffix=" TL"
        />
        <KpiCard
          title="Net Kâr"
          value={latest?.net_profit}
          suffix=" TL"
        />
        <KpiCard
          title="Özkaynak / Toplam Varlık (%)"
          value={equityToAssets}
        />
        <KpiCard
          title="Yatırım Amaçlı GM / Toplam Varlık (%)"
          value={investmentToAssets}
        />
      </div>

      {/* Büyüme Trendi */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">
          Büyüme Trendi (Varlıklar vs Özkaynak)
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                domain={yMax ? [0, yMax] : undefined}
                tickFormatter={(val) =>
                  `${(val / 1_000_000_000).toFixed(1)}B`
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  value.toLocaleString('tr-TR') + ' TL'
                }
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow:
                    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_assets"
                name="Toplam Varlıklar"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="equity"
                name="Özkaynaklar"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Öneri Merkezi (beta)</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Deneme
          </span>
        </div>
        <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
          <li>{equityComment()}</li>
          {ipRatio !== null ? (
            <li>
              Yatırım amaçlı gayrimenkullerin toplam varlıklara oranı yaklaşık{' '}
              {(ipRatio * 100).toFixed(1)} %. Portföyün varlık kompozisyonu ağırlıklı olarak
              gayrimenkullerde yoğunlaşmış durumda.
            </li>
          ) : (
            <li>Yatırım amaçlı gayrimenkul oranı hesaplanamadı.</li>
          )}
        </ul>
        <p className="text-xs text-gray-500">
          Bu alan, tam sürümde KAP ve finansal verilerden beslenen AI tabanlı önerilerle dinamik hale gelecektir.
        </p>
      </div>

      {/* Portföy Özeti */}
      <PortfolioSection />
    </div>
  );
};
