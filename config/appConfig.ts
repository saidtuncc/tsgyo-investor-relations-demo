export const appConfig = {
  companyName: 'TSKB Gayrimenkul Yatırım Ortaklığı',
  shortName: 'TSKB GYO',
  ticker: 'TSGYO',
  logoUrl:
    'https://tskb-app.fra1.digitaloceanspaces.com/files/logo/logo_image_file_url_1/ff4705ef-29e9-4768-a05c-d53eb4872383.svg?1688739387131',
  primaryColor: '#881506',
  headerSubtitle: 'Portföy & NAV kokpiti · Demo',
  footerDisclaimer:
    'Uygulamadaki veriler tanıtım amaçlıdır ve kamuya açık kaynaklardan yaklaşık olarak alınmıştır. Yatırım kararı için kullanılmamalıdır.',
  assistantRoadmap:
    'Planlanan geliştirmeler: KAP ve iç raporlardan beslenen tam metin arama, canlı KAP API entegrasyonu, portföy risk/ senaryo analizleri, n8n/OpenAI orkestrasyonu.',
};

export type AppConfig = typeof appConfig;
