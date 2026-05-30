// ============================================================
// المكون الرئيسي للتطبيق
// ============================================================

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import FoundationPage from '@/modules/foundation/FoundationPage';
import SettingsPage from '@/pages/SettingsPage';

type Page = 'home' | 'foundation' | 'beams' | 'slabs' | 'columns' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'foundation':
        return <FoundationPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="text-5xl">🚧</div>
              <h2 className="text-lg font-bold text-gray-700">
                {currentPage === 'beams' ? 'الجوائز' :
                 currentPage === 'slabs' ? 'البلاطات' :
                 'الأعمدة'}
              </h2>
              <p className="text-sm text-gray-400">قيد التطوير</p>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}
