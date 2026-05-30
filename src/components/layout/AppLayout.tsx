// ============================================================
// التخطيط العام للتطبيق
// ============================================================

import React, { useState } from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import {
  Home,
  Triangle,
  Square,
  Columns3,
  Building2,
  Settings,
  Globe,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import type { Lang } from '@/types';

type Page = 'home' | 'foundation' | 'beams' | 'slabs' | 'columns' | 'settings';

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: Page; icon: React.ReactNode; labelAr: string; labelEn: string; disabled?: boolean }[] = [
  { id: 'home', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
  { id: 'foundation', icon: <Triangle size={18} />, labelAr: 'الأساسات', labelEn: 'Foundations' },
  { id: 'beams', icon: <Square size={18} />, labelAr: 'الجوائز', labelEn: 'Beams', disabled: true },
  { id: 'slabs', icon: <Columns3 size={18} />, labelAr: 'البلاطات', labelEn: 'Slabs', disabled: true },
  { id: 'columns', icon: <Building2 size={18} />, labelAr: 'الأعمدة', labelEn: 'Columns', disabled: true },
  { id: 'settings', icon: <Settings size={18} />, labelAr: 'الإعدادات', labelEn: 'Settings' },
];

export default function AppLayout({ currentPage, onNavigate, children }: AppLayoutProps) {
  const { lang, setLang } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* الشريط الجانبي - سطح المكتب */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-l border-gray-200 shadow-sm">
        {/* الشعار */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-bold">ه</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{t('app.shortTitle', lang)}</h1>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>

        {/* القائمة */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                item.disabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : currentPage === item.id
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
              {item.disabled && (
                <span className="mr-auto text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                  {lang === 'ar' ? 'قريباً' : 'Soon'}
                </span>
              )}
              {!item.disabled && currentPage === item.id && (
                <ChevronRight size={14} className="mr-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* تبديل اللغة */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Globe size={16} />
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>
      </aside>

      {/* الشريط الجانبي - الموبايل */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute top-0 right-0 bottom-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold">{t('app.shortTitle', lang)}</h2>
              <button onClick={() => setSidebarOpen(false)} className="cursor-pointer">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <nav className="py-3 px-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (!item.disabled) {
                      onNavigate(item.id);
                      setSidebarOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    item.disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : currentPage === item.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* شريط الموبايل العلوي */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="text-sm font-bold text-gray-900">{t('app.shortTitle', lang)}</h1>
          <div className="flex-1" />
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="text-xs text-gray-400 cursor-pointer"
          >
            <Globe size={18} />
          </button>
        </div>

        {/* محتوى الصفحة */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
