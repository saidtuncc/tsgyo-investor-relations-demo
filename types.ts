export interface KapNotification {
  id: number;
  company_code: string;
  kap_id: string;
  type: string;
  title: string;
  publish_datetime: string;
  url: string;
}

export interface FinancialKpi {
  id: number;
  period: string;
  total_assets: number;
  equity: number;
  investment_properties: number;
  net_rental_income: number;
  net_profit: number;
}

export interface AssistantResponse {
  answer: string;
  pendoryaResults?: KapNotification[];
  equityValue?: number;
  highlights?: string[];
}

export interface PortfolioProperty {
  id: number;
  name: string;
  property_type?: string | null;
  city?: string | null;
  gross_area_sqm?: number | null;
  gla_sqm?: number | null;
  rooms?: number | null;
  valuation_value_tl?: number | null;
  valuation_date?: string | null;
}

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  KAP = 'KAP',
  ASSISTANT = 'ASSISTANT',
}
