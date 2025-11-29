import {
  KapNotification,
  FinancialKpi,
  AssistantResponse,
  PortfolioProperty,
} from '../types';

const API_BASE = 'http://3.74.130.157:8000';
// eski hali
//const API_BASE = 'http://localhost:8100';
//const API_BASE =
  //import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8100';

export type MetaResponse = {
  company_code: string;
  company_name: string;
  demo: boolean;
};


export const api = {
  async getMeta(): Promise<MetaResponse> {
    const res = await fetch(`${API_BASE}/meta`);
    if (!res.ok) throw new Error('Failed to fetch meta');
    return res.json();
  },

  async getKapNotifications(): Promise<KapNotification[]> {
    const res = await fetch(`${API_BASE}/kap`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async syncKap(): Promise<{ status: string; count: number }> {
    const res = await fetch(`${API_BASE}/kap/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync KAP data');
    return res.json();
  },

  async getKpis(): Promise<FinancialKpi[]> {
    const res = await fetch(`${API_BASE}/api/kpi`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },

  async getPortfolio(): Promise<PortfolioProperty[]> {
    const res = await fetch(`${API_BASE}/api/portfolio`);
    if (!res.ok) throw new Error('Failed to fetch portfolio');
    return res.json();
  },

  async askAssistant(question: string): Promise<AssistantResponse> {
    const res = await fetch(`${API_BASE}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Assistant failed to respond');
    return res.json();
  },
};
