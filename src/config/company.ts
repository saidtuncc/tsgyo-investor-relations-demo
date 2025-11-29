export const companyConfig = {
  code: 'TSGYO',
  name: 'TSKB GYO',
  tagline: 'Portföy & NAV kokpiti · Demo',
  logoUrl:
    'https://tskb-app.fra1.digitaloceanspaces.com/files/logo/logo_image_file_url_1/ff4705ef-29e9-4768-a05c-d53eb4872383.svg?1688739387131',
  primaryColor: '#881506',
  footerDisclaimer:
    'Uygulamadaki veriler tanıtım amaçlıdır ve kamuya açık kaynaklardan yaklaşık olarak alınmıştır. Yatırım kararı için kullanılmamalıdır.',
  assistant: {
    title: 'IR Asistanı',
    subtitle:
      'Portföy, NAV ve KAP sorularınıza hızlı yanıtlar. Yatırımcı ilişkileri ve yönetim ekibini desteklemek için tasarlanmış, kurum içi bir asistan.',
    plannedFeatures:
      'Planlanan geliştirmeler: canlı KAP entegrasyonu, iç raporlardan tam metin arama ve OpenAI orkestrasyonuyla gelişmiş senaryo analizleri.',
    sampleQuestions: [
      'Portföy toplam değeri nedir?',
      'Pendorya AVM portföy içindeki payı nedir?',
      'Divan Adana oteli için özet verir misin?',
      'Son özkaynak değeri ve NAV ne durumda?',
    ],
  },
  dashboard: {
    financialSummaryTitle: 'Finansal Özet',
    financialSummarySubtitle: 'TSKB GYO portföy & NAV kokpitinde temel KPI ve oran görünümü',
    growthTrendTitle: 'Büyüme Trendi',
    growthTrendSubtitle: 'Varlıklar ve özkaynaklar zaman içindeki seyri',
    recommendationCenterTitle: 'Öneri Merkezi (beta)',
    recommendationCenterSubtitle: 'Erken aşama AI öneri paneli – temel oranlara dayalı yorumlar',
    recommendationCenterBullets: [
      'Bu alan, tam sürümde KAP ve finansal verilerden beslenen AI tabanlı önerilerle dinamik hale gelecektir.',
    ],
    equityComments: {
      missing: 'Özkaynak oranı hesaplanamadı.',
      low: 'Özkaynak / toplam varlık oranı görece düşük, kaldıraç seviyesi dikkatle izlenmelidir.',
      balanced: 'Özkaynak / toplam varlık oranı dengeli bir seviyede.',
      strong: 'Özkaynak / toplam varlık oranı güçlü bir sermaye yapısına işaret ediyor.',
    },
    ipRatioText:
      'Yatırım amaçlı gayrimenkullerin toplam varlıklara oranı yaklaşık {value} %. Portföyün varlık kompozisyonu ağırlıklı olarak gayrimenkullerde yoğunlaşmış durumda.',
    ipRatioMissing: 'Yatırım amaçlı gayrimenkul oranı hesaplanamadı.',
    portfolioSummaryTitle: 'Portföy Özeti',
    portfolioSummarySubtitle: 'Mevcut gayrimenkul portföyü ve ekspertiz değerleri',
  },
} as const;

export type CompanyConfig = typeof companyConfig;
