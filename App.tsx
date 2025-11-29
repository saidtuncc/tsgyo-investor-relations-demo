import React, { useEffect, useState } from 'react';
import { LayoutDashboard, List, MessageSquareText } from 'lucide-react';
import { Tab } from './types';
import { Dashboard } from './components/Dashboard';
import { KapList } from './components/KapList';
import { Assistant } from './components/Assistant';
import { companyConfig } from './src/config/company';
import { api } from './services/api';

const navButtonBase =
  'flex items-center space-x-2 px-4 py-2 rounded-lg transition text-sm font-medium';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [demoMode, setDemoMode] = useState<boolean>(true);

  useEffect(() => {
    api
      .getMeta()
      .then((meta) => setDemoMode(meta.demo))
      .catch(() => setDemoMode(true));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard />;
      case Tab.KAP:
        return <KapList />;
      case Tab.ASSISTANT:
        return <Assistant />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header
        className="text-white border-b border-slate-800/40 sticky top-0 z-10 shadow-sm"
        style={{ backgroundColor: companyConfig.primaryColor }}
      >
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={companyConfig.logoUrl}
              alt={companyConfig.name}
              className="h-12 w-auto object-contain drop-shadow"
            />
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-wide">
                {companyConfig.name}
              </h1>
              <p className="text-xs text-white/80">{companyConfig.tagline}</p>
            </div>
          </div>

          <nav className="flex space-x-1 bg-white/5 rounded-lg p-1 backdrop-blur">
            <button
              onClick={() => setActiveTab(Tab.DASHBOARD)}
              className={`${navButtonBase} ${
                activeTab === Tab.DASHBOARD
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Özet</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.KAP)}
              className={`${navButtonBase} ${
                activeTab === Tab.KAP
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" />
              <span>KAP Bildirimleri</span>
            </button>
            <button
              onClick={() => setActiveTab(Tab.ASSISTANT)}
              className={`${navButtonBase} ${
                activeTab === Tab.ASSISTANT
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-100 hover:bg-white/10'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span>IR Asistanı</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          &copy; 2025 {companyConfig.name} Demo.
          {demoMode && <> {companyConfig.footerDisclaimer}</>}
        </div>
      </footer>
    </div>
  );
};

export default App;
