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
import { MetricCard, PageSection, EmptyState } from './ui';
import { companyConfig } from '../src/config/company';
import { formatTl } from '../src/utils/format';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<FinancialKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    api
      .getKpis()
      .then(setData)
      .catch(() => setError('Finansal KPI verisi alınamadı.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const latest = data[data.length - 1];
  const allValues = data
    .flatMap((d) => [d.total_assets, d.equity])
    .filter((v): v is number => typeof v === 'number');
  const maxValue = allValues.length ? Math.max(...allValues) : 0;
  const minValue = allValues.length ? Math.min(...allValues) : 0;
  const rangePadding = maxValue === minValue ? maxValue * 0.1 || 1 : (maxValue - minValue) * 0.1;
  const domain: [number, number] | undefined = allValues.length
    ? [Math.max(0, minValue - rangePadding), maxValue + rangePadding]
    : undefined;

  const formatPercent = (numerator?: number | null, denominator?: number | null) => {
    if (!denominator) return '—';
    if (numerator === null || numerator === undefined) return '—';
    const ratio = (numerator / denominator) * 100;
    return `${ratio.toFixed(1)} %`;
  };

  const equityToAssets = formatPercent(latest?.equity, latest?.total_assets);
  const investmentToAssets = formatPercent(latest?.investment_properties, latest?.total_assets);

  const equityRatio =
    latest?.equity !== undefined && latest?.equity !== null && latest?.total_assets
      ? latest.equity / latest.total_assets
      : null;
  const ipRatio =
    latest?.investment_properties !== undefined && latest?.investment_properties !== null && latest?.total_assets
      ? latest.investment_properties / latest.total_assets
      : null;

  const equityComment = () => {
    if (equityRatio === null) return companyConfig.dashboard.equityComments.missing;
    if (equityRatio < 0.35) return companyConfig.dashboard.equityComments.low;
    if (equityRatio <= 0.55) return companyConfig.dashboard.equityComments.balanced;
    return companyConfig.dashboard.equityComments.strong;
  };

  if (loading) {
    return (
      <PageSection
        title={companyConfig.dashboard.financialSummaryTitle}
        subtitle={companyConfig.dashboard.financialSummarySubtitle}
      >
        <div className="p-8 text-center text-gray-500">Finansal veriler yükleniyor...</div>
      </PageSection>
    );
  }

  if (error || !data.length) {
    return (
      <PageSection
        title={companyConfig.dashboard.financialSummaryTitle}
        subtitle={companyConfig.dashboard.financialSummarySubtitle}
      >
        <EmptyState
          title="Finansal veriler bulunamadı"
          description={
            error ?? 'Demo verisi eksik görünüyor. Backend seed veya API bağlantısını kontrol edebilirsiniz.'
          }
          actionLabel="Tekrar dene"
          onAction={loadData}
        />
      </PageSection>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageSection
        title={companyConfig.dashboard.financialSummaryTitle}
        subtitle={companyConfig.dashboard.financialSummarySubtitle}
        actions={
          <>
            <button
              onClick={() =>
                downloadCsv(`${companyConfig.code.toLowerCase()}-kpi.csv`, data)
              }
              className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50"
            >
              KPI'ları Excel'e aktar
            </button>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded self-start">
              Dönem: {latest?.period}
            </span>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <MetricCard title="Toplam Varlıklar" value={latest?.total_assets} suffix=" TL" />
          <MetricCard title="Özkaynaklar" value={latest?.equity} suffix=" TL" />
          <MetricCard
            title="Yatırım Amaçlı Gayrimenkuller"
            value={latest?.investment_properties}
            suffix=" TL"
          />
          <MetricCard title="Net Kâr" value={latest?.net_profit} suffix=" TL" />
          <MetricCard title="Özkaynak / Toplam Varlık (%)" value={equityToAssets} />
          <MetricCard title="Yatırım Amaçlı GM / Toplam Varlık (%)" value={investmentToAssets} />
        </div>
      </PageSection>

      <PageSection
        title={companyConfig.dashboard.growthTrendTitle}
        subtitle={companyConfig.dashboard.growthTrendSubtitle}
        className="bg-white"
      >
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                domain={domain}
                tickFormatter={(val) => `${(val / 1_000_000_000).toFixed(1)}B`}
              />
              <Tooltip
                formatter={(value: number) => formatTl(value)}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend />
              <Line
                type={data.length === 1 ? 'linear' : 'monotone'}
                dataKey="total_assets"
                name="Toplam Varlıklar"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type={data.length === 1 ? 'linear' : 'monotone'}
                dataKey="equity"
                name="Özkaynaklar"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {data.length === 1 && (
            <p className="text-xs text-gray-500 mt-2">
              Tek dönem mevcut. Trend grafiği yeni dönemlerle otomatik güncellenecektir.
            </p>
          )}
        </div>
      </PageSection>

      <PageSection
        title={companyConfig.dashboard.recommendationCenterTitle}
        subtitle={companyConfig.dashboard.recommendationCenterSubtitle}
      >
        <div className="space-y-3">
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
            <li>{equityComment()}</li>
            {ipRatio !== null ? (
              <li>
                {companyConfig.dashboard.ipRatioText.replace(
                  '{value}',
                  (ipRatio * 100).toFixed(1),
                )}
              </li>
            ) : (
              <li>{companyConfig.dashboard.ipRatioMissing}</li>
            )}
            {companyConfig.dashboard.recommendationCenterBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </PageSection>

      <PortfolioSection />
    </div>
  );
};
