from __future__ import annotations

from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import init_db, fetch_all, execute
from settings import settings

app = FastAPI(title=f"{settings.COMPANY_CODE} Investor Relations Demo API")

# CORS: gerekirse originleri kısıtlarsın
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # dev için
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class KapNotification(BaseModel):
    id: int
    company_code: str
    kap_id: str
    type: Optional[str] = None
    title: Optional[str] = None
    publish_datetime: Optional[str] = None
    url: Optional[str] = None
    created_at: Optional[str] = None


class FinancialKpi(BaseModel):
    id: int
    period: str
    total_assets: Optional[float] = None
    equity: Optional[float] = None
    investment_properties: Optional[float] = None
    net_rental_income: Optional[float] = None
    net_profit: Optional[float] = None


class PortfolioProperty(BaseModel):
    id: int
    name: str
    property_type: Optional[str] = None
    city: Optional[str] = None
    gross_area_sqm: Optional[float] = None
    gla_sqm: Optional[float] = None
    rooms: Optional[int] = None
    valuation_value_tl: Optional[float] = None
    valuation_date: Optional[str] = None


class AssistantQuestion(BaseModel):
    question: str


class AssistantResponse(BaseModel):
    answer: str
    # IR Assistant bileşeni types.ts'te 'sources?: KapNotification[]' bekliyor
    sources: Optional[List[KapNotification]] = None


def answer_with_demo_rules(question: str) -> AssistantResponse:
    q = (question or "").lower().strip()

    sources: Optional[List[KapNotification]] = None

    # 1) Portföy toplam değeri / NAV tarzı sorular
    if "portföy" in q and ("toplam" in q or "değer" in q or "nav" in q):
        rows = fetch_all(
            """
            SELECT name, valuation_value_tl
            FROM portfolio_properties
            ORDER BY valuation_value_tl DESC;
            """,
        )
        if not rows:
            return AssistantResponse(
                answer="Portföy tablosunda veri bulunamadı."
            )

        total = sum((r["valuation_value_tl"] or 0) for r in rows)
        biggest = rows[0]
        answer = (
            "30.06.2025 tarihli ekspertizlere göre gayrimenkul portföyünün toplam değeri "
            f"yaklaşık {total:,.0f} TL. En büyük pay {biggest['name']} varlığına ait."
        )
        return AssistantResponse(answer=answer)

    # 2) Pendorya AVM soruları
    if "pendorya" in q:
        # İlgili KAP kayıtlarını kaynak olarak getir
        notif_rows = fetch_all(
            """
            SELECT id, company_code, kap_id, type, title,
                   publish_datetime, url, created_at
            FROM kap_notifications
            WHERE title LIKE '%' || ? || '%'
            ORDER BY
              CASE WHEN publish_datetime IS NULL THEN 1 ELSE 0 END,
              publish_datetime DESC,
              id DESC
            LIMIT 5;
            """,
            ("Pendorya",),
        )
        if notif_rows:
            sources = [KapNotification(**r) for r in notif_rows]

        # Portföy tablosundan Pendorya satırı
        prop_rows = fetch_all(
            """
            SELECT name, valuation_value_tl, gla_sqm, gross_area_sqm
            FROM portfolio_properties
            WHERE name LIKE '%' || ? || '%'
            LIMIT 1;
            """,
            ("Pendorya",),
        )

        if prop_rows:
            p = prop_rows[0]
            parts = []
            if p["valuation_value_tl"]:
                parts.append(
                    f"ekspertiz değeri yaklaşık {p['valuation_value_tl']:,.0f} TL"
                )
            if p["gross_area_sqm"]:
                parts.append(
                    f"brüt kapalı alan {p['gross_area_sqm']:,.0f} m²"
                )
            if p["gla_sqm"]:
                parts.append(
                    f"kiralanabilir alan {p['gla_sqm']:,.0f} m²"
                )
            details = ", ".join(parts) if parts else "detaylar portföy tablosunda yer almaktadır"
            answer = f"Pendorya AVM portföydeki dört ana varlıktan biri; {details}."
        elif sources:
            answer = "Pendorya ile ilgili bazı KAP bildirimlerini aşağıda listeliyorum."
        else:
            answer = "Pendorya ile ilgili kayıt bulunamadı. Önce KAP verisini senkronize etmeyi deneyebilirsin."

        return AssistantResponse(answer=answer, sources=sources)

    # 3) Divan Adana soruları
    if "divan" in q or "adana otel" in q or "adana oteli" in q:
        rows = fetch_all(
            """
            SELECT name, rooms, valuation_value_tl
            FROM portfolio_properties
            WHERE name LIKE '%' || ? || '%'
            LIMIT 1;
            """,
            ("Divan Adana",),
        )
        if rows:
            r = rows[0]
            rooms = r["rooms"]
            val = r["valuation_value_tl"]
            room_info = f"{rooms} odalı" if rooms else "oda sayısı bilgisi portföy tablosunda"
            value_info = (
                f"ekspertiz değeri yaklaşık {val:,.0f} TL"
                if val
                else "ekspertiz değeri portföy tablosunda yer alıyor"
            )
            answer = f"{r['name']} portföyde yer alan bir şehir otelidir; {room_info}, {value_info}."
        else:
            answer = "Divan Adana Oteli için portföy tablosunda kayıt bulunamadı."

        return AssistantResponse(answer=answer)

    # 4) Portföyde kaç şehir var? (İstanbul + Adana vb.)
    if ("kaç şehir" in q) or ("kaç il" in q) or ("şehir sayısı" in q):
        rows = fetch_all(
            """
            SELECT COUNT(DISTINCT city) AS c
            FROM portfolio_properties
            WHERE city IS NOT NULL;
            """,
        )
        count = rows[0]["c"] if rows else 0
        if count:
            answer = f"Portföy şu anda {count} farkl şehirde gayrimenkul içermektedir."
        else:
            answer = "Portföy tablosunda şehir bilgisi bulunamadı."
        return AssistantResponse(answer=answer)

    # 5) Özkaynak / equity soruları
    if "öz kaynak" in q or "özkaynak" in q or "equity" in q:
        rows = fetch_all(
            """
            SELECT equity, period
            FROM financial_kpi
            ORDER BY id DESC
            LIMIT 1;
            """,
        )
        if rows and rows[0]["equity"] is not None:
            equity_value = rows[0]["equity"]
            period = rows[0]["period"]
            answer = (
                f"En güncel dönemde ({period}) özkaynak değeri yaklaşık "
                f"{equity_value:,.0f} TL'dir."
            )
        else:
            answer = "Finansal KPI tablosunda özkaynak bilgisi bulunamadı."

        return AssistantResponse(answer=answer)

    # 6) Diğer sorular için basit fallback
    answer = (
        "Şu anda demo modundayım. Portföy toplam değeri, Pendorya AVM, Divan Adana Oteli, "
        "portföydeki şehir sayısı ve özkaynak gibi konularda soru sorabilirsiniz."
    )
    return AssistantResponse(answer=answer)


def answer_with_external_ai(question: str) -> Optional[AssistantResponse]:
    """
    Placeholder for production AI pipeline.
    In production, this function should call n8n/OpenAI using the company's private corpus
    and return an AssistantResponse. The rest of the system should not depend on which
    engine produces the answer.
    """
    return None



@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/meta")
def get_meta():
    return {
        "company_code": settings.COMPANY_CODE,
        "company_name": settings.COMPANY_NAME,
        "demo": settings.DEMO_MODE,
    }


@app.get("/kap", response_model=List[KapNotification])
def list_kap_notifications() -> List[KapNotification]:
    rows = fetch_all(
        """
        SELECT id, company_code, kap_id, type, title,
               publish_datetime, url, created_at
        FROM kap_notifications
        ORDER BY
          CASE WHEN publish_datetime IS NULL THEN 1 ELSE 0 END,
          publish_datetime DESC,
          id DESC
        LIMIT 50;
        """
    )
    return [KapNotification(**r) for r in rows]


@app.post("/kap/sync")
def sync_kap_notifications():
    """
    DEMO: Şimdilik tabloya 3 örnek kayıt ekliyoruz.
    İleride gerçek KAP entegrasyonu eklenir.
    """
    demo_notifs = [
        {
            "company_code": settings.COMPANY_CODE,
            "kap_id": "1508439",
            "type": "Özel Durum",
            "title": f"{settings.COMPANY_NAME} - Özel Durum Açıklaması (Genel Bilgilendirme)",
            "publish_datetime": "2024-10-27 10:45:00",
            "url": "https://www.kap.org.tr/tr/Bildirim/1508439",
        },
        {
            "company_code": settings.COMPANY_CODE,
            "kap_id": "1495001",
            "type": "Finansal Rapor",
            "title": f"{settings.COMPANY_NAME} - 2024/06 Ara Dönem Finansal Rapor",
            "publish_datetime": "2024-07-31 18:30:00",
            "url": "https://www.kap.org.tr/tr/Bildirim/1495001",
        },
        {
            "company_code": settings.COMPANY_CODE,
            "kap_id": "1480000",
            "type": "Faaliyet Raporu",
            "title": f"{settings.COMPANY_NAME} - 2023 Yılı Faaliyet Raporu",
            "publish_datetime": "2024-03-15 09:00:00",
            "url": "https://www.kap.org.tr/tr/Bildirim/1480000",
        },
    ]

    inserted = 0
    for n in demo_notifs:
        execute(
            """
            INSERT OR IGNORE INTO kap_notifications
                (company_code, kap_id, type, title, publish_datetime, url)
            VALUES (?, ?, ?, ?, ?, ?);
            """,
            (
                n["company_code"],
                n["kap_id"],
                n["type"],
                n["title"],
                n["publish_datetime"],
                n["url"],
            ),
        )
        inserted += 1

    return {"status": "ok", "count": inserted}


@app.get("/api/kpi", response_model=List[FinancialKpi])
def get_kpis() -> List[FinancialKpi]:
    rows = fetch_all(
        """
        SELECT id, period, total_assets, equity,
               investment_properties, net_rental_income, net_profit
        FROM financial_kpi
        ORDER BY period;
        """
    )
    return [FinancialKpi(**r) for r in rows]


@app.get("/api/portfolio", response_model=List[PortfolioProperty])
def get_portfolio() -> List[PortfolioProperty]:
    rows = fetch_all(
        """
        SELECT id, name, property_type, city,
               gross_area_sqm, gla_sqm, rooms,
               valuation_value_tl, valuation_date
        FROM portfolio_properties
        ORDER BY valuation_value_tl DESC;
        """
    )
    return [PortfolioProperty(**r) for r in rows]


@app.post("/assistant/ask", response_model=AssistantResponse)
def ask_assistant(payload: AssistantQuestion) -> AssistantResponse:
    question = payload.question or ""

    external_answer = answer_with_external_ai(question)
    if settings.DEMO_MODE or external_answer is None:
        return answer_with_demo_rules(question)

    return external_answer
