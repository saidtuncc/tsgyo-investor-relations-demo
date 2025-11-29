import React, { useEffect, useState } from 'react';
import { RefreshCcw, ExternalLink, AlertCircle } from 'lucide-react';
import { KapNotification } from '../types';
import { api } from '../services/api';
import { downloadCsv } from '../utils/export';
import { companyConfig } from '../src/config/company';
import { formatDateTime } from '../src/utils/format';
import { PageSection, EmptyState } from './ui';

export const KapList: React.FC = () => {
  const [notifications, setNotifications] = useState<KapNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTypeBadge = (type: string) => {
    const base = 'text-xs px-2 py-0.5 rounded-full font-medium';

    if (type.toLowerCase().includes('finansal')) return `${base} bg-blue-50 text-blue-700`;
    if (type.toLowerCase().includes('özel')) return `${base} bg-amber-50 text-amber-700`;
    return `${base} bg-slate-100 text-slate-700`;
  };

  const openKap = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const loadNotifications = () => {
    setLoading(true);
    api
      .getKapNotifications()
      .then(setNotifications)
      .catch(() => setError('Veri çekilemedi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      await api.syncKap();
      loadNotifications();
    } catch (err) {
      setError('KAP senkronizasyonu başarısız oldu.');
    } finally {
      setSyncing(false);
    }
  };

  const exportButton = (
    <button
      onClick={() => downloadCsv(`${companyConfig.code.toLowerCase()}-kap.csv`, notifications)}
      className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-slate-600 hover:bg-gray-50"
    >
      KAP listesini Excel'e aktar
    </button>
  );

  return (
    <PageSection
      title="KAP Bildirimleri"
      subtitle="Temsilî bildirimler: tarih, tür ve hızlı bağlantılar"
      actions={
        <div className="flex items-center gap-2">
          {exportButton}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-70"
          >
            <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Senkronize Ediliyor...' : 'KAP Verisini Güncelle'}</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="KAP bildirimi bulunamadı"
          description="Demo datası henüz yüklenmemiş olabilir. Senkronizasyonu başlatarak listeyi güncelleyebilirsiniz."
          actionLabel="KAP verisini senkronize et"
          onAction={handleSync}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Tarih</th>
                <th className="p-4 font-medium">Tür</th>
                <th className="p-4 font-medium">Başlık</th>
                <th className="p-4 font-medium text-right">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <tr
                  key={notif.id}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => openKap(notif.url)}
                >
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                    {formatDateTime(notif.publish_datetime)}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={getTypeBadge(notif.type)}>{notif.type}</span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-800">{notif.title}</td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openKap(notif.url);
                      }}
                      className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                      aria-label="KAP'ta aç"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageSection>
  );
};
