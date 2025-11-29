import React, { useState } from 'react';
import { Send, Bot, User, FileText } from 'lucide-react';
import { api } from '../services/api';
import type { AssistantResponse } from '../types';
import { companyConfig } from '../src/config/company';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: number;
  role: ChatRole;
  content: string;
  answer?: AssistantResponse;
};

const highlightKeywords = ['pendorya', 'özkaynak', 'nav', 'portföy', 'kira', 'değer'];

const renderHighlightedText = (text: string) => {
  const lower = text.toLowerCase();
  const indices: { start: number; end: number }[] = [];

  highlightKeywords.forEach((kw) => {
    let idx = lower.indexOf(kw);
    while (idx !== -1) {
      indices.push({ start: idx, end: idx + kw.length });
      idx = lower.indexOf(kw, idx + kw.length);
    }
  });

  if (!indices.length) return text;

  // çakışmaları temizle
  indices.sort((a, b) => a.start - b.start);
  const merged: typeof indices = [];
  for (const r of indices) {
    const last = merged[merged.length - 1];
    if (!last || r.start > last.end) {
      merged.push({ ...r });
    } else if (r.end > last.end) {
      last.end = r.end;
    }
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  merged.forEach((r, i) => {
    if (cursor < r.start) {
      parts.push(text.slice(cursor, r.start));
    }
    parts.push(
      <mark
        key={`h-${i}`}
        className="bg-amber-100 text-amber-900 rounded px-0.5"
      >
        {text.slice(r.start, r.end)}
      </mark>,
    );
    cursor = r.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};

export const Assistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { assistant } = companyConfig;

  const ask = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || loading) return;

    const baseId = Date.now();

    // Kullanıcı mesajını ekle
    setMessages((prev) => [
      ...prev,
      {
        id: baseId,
        role: 'user',
        content: trimmed,
      },
    ]);

    setQuestion('');
    setLoading(true);

    try {
      const res = await api.askAssistant(trimmed);

      setMessages((prev) => [
        ...prev,
        {
          id: baseId + 1,
          role: 'assistant',
          content: res.answer,
          answer: res,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: baseId + 1,
          role: 'assistant',
          content:
            'Şu anda isteği işlerken bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar dener misiniz?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void ask(question);
  };

  const handleSuggestionClick = (q: string) => {
    void ask(q);
  };

  return (
    <div className="space-y-3 aniamte-fade-in pb-10">
      {/* Sayfa başlığı */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{assistant.title}</h2>
          <p className="text-sm text-slate-500">{assistant.subtitle}</p>
        </div>
      </header>

      <p className="text-xs text-slate-400 max-w-3xl">{assistant.plannedFeatures}</p>

      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm min-h-[400px]">
        {/* HEADER BLOĞU – GÜNCEL HÂLİ */}
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-sky-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">Yatırımcı İlişkileri Asistanı</h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {companyConfig.name} hakkında portföy, NAV, KAP bildirimleri ve
              temel finansal sorularınızı doğal dilde sorabilirsiniz. Yanıtlar,
              demo amaçlı veri seti üzerinden üretilmektedir.
            </p>
          </div>
        </div>


        <div className="bg-white/5 rounded-xl p-4 sm:p-7 min-h-[430px] flex flex-col">
          {/* Mesaj listesi / boş durumda örnekler */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-slate-200">
              <div className="text-sm font-medium">Örnek sorular:</div>
              <div className="text-xs space-y-1">
                {assistant.sampleQuestions.map((questionText) => (
                  <p key={questionText}>• {questionText}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-br-sm'
                          : 'bg-white/95 text-slate-900 rounded-bl-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs text-slate-400">
                        {isUser ? (
                          <>
                            <User className="w-3.5 h-3.5" />
                            <span>Kullanıcı</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5" />
                            <span>Asistan</span>
                          </>
                        )}
                      </div>

                      <p className="whitespace-pre-line">
                        {isUser
                          ? m.content
                          : m.answer
                          ? renderHighlightedText(m.answer.answer)
                          : m.content}
                      </p>

                      {/* KAP kaynakları */}
                      {!isUser && m.answer?.sources && m.answer.sources.length > 0 && (
                        <div className="mt-3 border-t border-slate-100 pt-2">
                          <p className="text-[11px] font-medium text-slate-500 mb-1">
                            İlgili KAP kayıtları:
                          </p>
                          <ul className="space-y-1">
                            {m.answer.sources.map((s) => (
                              <li
                                key={s.id}
                                className="flex items-center gap-2 text-[11px] text-slate-600"
                              >
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline underline-offset-2 hover:text-slate-800"
                                >
                                  {s.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tek bir yerde, sade loading indicator */}
          {loading && (
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300">
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Asistan yanıt hazırlıyor…</span>
            </div>
          )}

          {/* Soru inputu */}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Sorunuzu buraya yazın..."
              disabled={loading}
              className="flex-1 text-sm rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Önerilen sorular (altta, tam genişlik) */}
          <div className="mt-2 flex flex-wrap gap-2">
            {assistant.sampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSuggestionClick(q)}
                className="text-[11px] px-3 py-1 rounded-full border border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Assistant;
