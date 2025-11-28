import React, { useState } from 'react';
import { Send, Bot, User, FileText, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { AssistantResponse, KapNotification } from '../types';
import { PageSection } from './ui';
import { appConfig } from '../config/appConfig';

type ChatMessage = { type: 'user' | 'bot'; content: AssistantResponse | string };

const suggestedQuestions = [
  'Portföy toplam değeri nedir?',
  'Pendorya AVM portföy içindeki payı nedir?',
  'Divan Adana oteli için özet verir misin?',
  'Son özkaynak değeri ve NAV ne durumda?',
  'Gayrimenkul portföyünün şehir dağılımı hakkında bilgi verir misin?',
  'Kira geliri ve risk görünümü hakkında kısa bir özet paylaşır mısın?',
];

const getHighlights = (answer: string) => {
  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const keywords = ['pendorya', 'özkaynak', 'equity', 'portföy', 'nav', 'risk'];

  const matched = sentences.filter((sentence) =>
    keywords.some((keyword) => sentence.toLowerCase().includes(keyword)),
  );

  return Array.from(new Set(matched));
};

const TypeBadge: React.FC<{ notification: KapNotification }> = ({ notification }) => {
  const base = 'text-[11px] px-2 py-0.5 rounded-full font-medium';
  const type = notification.type.toLowerCase();
  if (type.includes('finansal')) return <span className={`${base} bg-blue-50 text-blue-700`}>{notification.type}</span>;
  if (type.includes('özel')) return <span className={`${base} bg-amber-50 text-amber-700`}>{notification.type}</span>;
  return <span className={`${base} bg-slate-100 text-slate-700`}>{notification.type}</span>;
};

type ChatMessage = { type: 'user' | 'bot'; content: AssistantResponse | string };

const suggestedQuestions = [
  'Portföy toplam değeri nedir?',
  'Pendorya AVM hakkında bilgi verir misin?',
  'Divan Adana oteli için özet verir misin?',
  'Son özkaynak durumunu söyle.',
];

const getHighlights = (answer: string) => {
  const sentences = answer
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const keywords = ['pendorya', 'özkaynak', 'equity', 'portföy'];

  const matched = sentences.filter((sentence) =>
    keywords.some((keyword) => sentence.toLowerCase().includes(keyword)),
  );

  return Array.from(new Set(matched));
};

export const Assistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const askQuestion = async (text: string, options?: { clearAfterSend?: boolean }) => {
    const prepared = text.trim();
    if (!prepared) return;

    setHistory((prev) => [...prev, { type: 'user', content: prepared }]);
    setLoading(true);

    try {
      const response = await api.askAssistant(prepared);
      setHistory((prev) => [...prev, { type: 'bot', content: response }]);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        {
          type: 'bot',
          content: {
            answer: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          },
        },
      ]);
    } finally {
      if (options?.clearAfterSend !== false) {
        setQuestion('');
      }
      setLoading(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    await askQuestion(question);
  };

  const handleSuggestion = (text: string) => {
    setQuestion(text);
    void askQuestion(text);
  };

  return (
    <PageSection
      title="IR Asistanı"
      subtitle="Portföy, NAV ve KAP sorularına hızlı yanıtlar"
      actions={
        <span className="text-xs text-gray-500">{appConfig.assistantRoadmap}</span>
      }
    >
      <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-800 p-4 text-white flex items-center space-x-3">
          <Bot className="w-6 h-6" />
          <div>
            <h2 className="font-semibold">Yatırımcı İlişkileri Asistanı</h2>
            <p className="text-xs text-slate-300">{appConfig.shortName} hakkında sorularınızı sorun</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[520px]">
          {history.length === 0 && (
            <div className="text-center text-gray-400 mt-6">
              <p className="mb-3 font-medium text-slate-600">Örnek sorular</p>
              <ul className="text-sm space-y-1 text-gray-500">
                {suggestedQuestions.slice(0, 4).map((example) => (
                  <li key={example}>• {example}</li>
                ))}
              </ul>
            </div>
          )}

          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white border border-gray-200 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.type === 'user' ? (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5" />
                    <p className="leading-relaxed">{msg.content as string}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const response = msg.content as AssistantResponse;
                      const highlights = response.highlights ?? getHighlights(response.answer);
                      return (
                        <>
                          <p className="leading-relaxed whitespace-pre-line text-[15px]">{response.answer}</p>
                          {response.equityValue !== undefined && response.equityValue !== null && (
                            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                              Son özkaynak değeri:{' '}
                              <span className="font-semibold">
                                {response.equityValue.toLocaleString('tr-TR')} TL
                              </span>
                            </div>
                          )}
                          {highlights.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {highlights.map((highlight, index) => (
                                <div
                                  key={`${highlight}-${index}`}
                                  className="border border-indigo-100 bg-indigo-50 text-indigo-800 rounded-lg p-3 text-sm flex items-start gap-2"
                                >
                                  <MessageSquare className="w-4 h-4 mt-0.5" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {response.pendoryaResults && response.pendoryaResults.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-100 space-y-2">
                              <p className="text-xs font-semibold text-gray-600 uppercase">
                                Eşleşen KAP Bildirimleri
                              </p>
                              <ul className="space-y-2">
                                {response.pendoryaResults.map((source) => (
                                  <li
                                    key={source.id}
                                    className="flex items-start justify-between gap-3 bg-white border border-gray-100 rounded-lg p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      <FileText className="w-4 h-4 mt-0.5 text-blue-500 shrink-0" />
                                      <div className="space-y-1">
                                        <TypeBadge notification={source} />
                                        <div className="font-semibold text-slate-800 leading-snug">{source.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {source.publish_datetime
                                            ? new Date(source.publish_datetime).toLocaleString('tr-TR')
                                            : '—'}
                                        </div>
                                      </div>
                                    </div>
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 text-xs font-medium hover:underline"
                                    >
                                      KAP'ta aç
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              <span>Asistan düşünüyor...</span>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
                <span>Asistan düşünüyor...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 space-y-3">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestion(item)}
                disabled={loading}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-60"
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleAsk} className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Sorunuzu buraya yazın..."
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </PageSection>
  );
};
