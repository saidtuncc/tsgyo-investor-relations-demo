# IR Console – TSKB GYO Demo

IR Console, Borsa İstanbul'da işlem gören şirketlerin finans ve yatırımcı ilişkileri ekipleri için tasarlanmış küçük ama odaklı bir iç paneldir.

Bu repo, IR Console'un **TSKB GYO** verileriyle çalışan demo uygulamasını içerir:

- 30.06.2025 dönemi için finansal özet ve temel oranlar
- Fındıklı Ofis Binaları, Pendorya AVM, Divan Adana Oteli ve Tahir Han'dan oluşan portföy görünümü
- Örnek KAP bildirim listesi (başlık, tarih, link)
- Şirkete özel çalışan, sınırlı kapsamlı bir IR asistanı

Amaç, her çeyrek tekrarlanan raporlama ve IR işleri (finansal özetler, portföy tabloları, grafikler, KAP özetleri, soru–cevap hazırlıkları) için tekrar kullanılabilir, şirket başına özelleştirilebilir bir konsol sunmaktır. GYO'lar için tasarlanan bu yapı, aynı mimariyle banka, finansal kurum, enerji ve altyapı şirketlerine de uyarlanabilecek şekilde kurgulanmıştır.

## Veri Kaynakları & Varsayımlar

Bu demo uygulama, TSKB GYO'nun kamuya açık verileri kullanılarak hazırlanmış, kurum içi kullanım senaryosuna yönelik bir prototiptir.

**Kullanılan başlıca veri kaynakları:**

- TSKB GYO kurumsal ve portföy sayfaları (aktif büyüklük, portföy değerleri, portföydeki varlık listesi, m² ve oda bilgileri).
- Gayrimenkul portföyü ve Net Aktif Değer (NAV) tablosunda yer alan ekspertiz tutarları.
- KAP'ta yayımlanan finansal raporlar, faaliyet raporları ve örnek bildirimler (demo'da sınırlı sayıda kayıt temsilî olarak kullanılmıştır).

**Demoda kullanılan rakamlar:**

- 30.06.2025 itibarıyla:
  - Toplam aktif büyüklük,
  - Gayrimenkul portföyü toplam ekspertiz değeri,
  - Portföydeki dört ana varlık (Fındıklı Ofis Binaları, Pendorya AVM, Divan Adana Oteli, Tahir Han) için ekspertiz değerleri ve temel özellikler (m², oda sayısı vb.)
- Finansal KPI tablosunda yalnızca en güncel dönem (2025/06) gerçek verilere dayanmaktadır; geçmiş dönemler için herhangi bir senaryo veya tahmin eklenmemiştir.
- Net kâr ve net kira geliri alanları, ilgili veriler bu prototipte işlenmediği için boş bırakılmakta, arayüzde `—` olarak gösterilmektedir.

Bu sayede demo, gerçek veriye dayalı bir görünüm sunarken, henüz entegrasyonu yapılmamış rapor ve kalemler için hayali veya yanıltıcı rakamlar üretmemektedir.

## Sonraki Adımlar (Geliştirme Fikirleri)

Bu prototip, TSKB GYO'nun yatırımcı ilişkileri ve finansal raporlama süreçlerini hızlandırmaya yönelik bir çekirdek olarak tasarlanmıştır. Bir sonraki aşamada aşağıdaki geliştirmeler yapılabilir:

1. **KAP Entegrasyonu**
   - KAP API veya kurum içi KAP log/Excel dosyalarıyla entegrasyon.
   - Bildirimlerin tür, konu ve etki bazında filtrelenmesi ve etiketlenmesi.
   - Yeni KAP bildirimi geldiğinde e-posta / Teams bildirimi gibi uyarı mekanizmaları.

2. **Finansal Rapor Otomasyonu**
   - Çeyreklik finansal tabloların (Excel/PDF) otomatik okunması.
   - Zaman serisi KPI setlerinin (toplam varlıklar, özkaynak, borçluluk vb.) her çeyrek güncellenmesi.
   - IR sunumlarında kullanılan grafik ve tabloların PowerPoint/Excel çıktılarının tek tıkla üretilmesi.

3. **Portföy Analizi ve Senaryo Modülü**
   - Portföy değer dağılımının grafiklerle (şehir bazında, varlık türü bazında) görselleştirilmesi.
   - Örneğin Pendorya kira gelirinde veya doluluk oranında belirli bir değişimin, toplam portföy ve gelir üzerindeki etkisini simüle eden basit senaryo ekranları.

4. **IR Asistanının Genişletilmesi**
   - Asistanın yalnızca demo veri setiyle sınırlı kalmayıp, şirketin güncel finansal veritabanına ve KAP açıklamalarına erişecek şekilde genişletilmesi.
   - Sık sorulan yatırımcı sorularına (temettü politikası, portföy dağılımı, borç yapısı vb.) hazır ve güncel yanıtlar üretebilmesi.

Bu aşamalar tamamlandığında, proje; TSKB GYO özelinde, her çeyrek tekrarlanan manuel raporlama iş yükünü azaltan ve yatırımcı ilişkileri ekibine hız kazandıran gerçek bir iç araç haline getirilebilir.

> Not: Uygulamadaki veriler tanıtım amaçlıdır ve kamuya açık kaynaklardan yaklaşık olarak alınmıştır. Yatırım kararı için kullanılmamalıdır.
