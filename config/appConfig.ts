import { companyConfig } from '../src/config/company';

export const appConfig = {
  ...companyConfig,
  assistantRoadmap:
    'Planlanan geliştirmeler: KAP ve iç raporlardan beslenen tam metin arama, canlı KAP API entegrasyonu, portföy risk/ senaryo analizleri, n8n/OpenAI orkestrasyonu.',
};

export type AppConfig = typeof appConfig;
