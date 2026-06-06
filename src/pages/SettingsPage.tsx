// ============================================================
// صفحة الإعدادات
// ============================================================

import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Card, SelectInput } from '@/components/ui';
import { Globe, BookOpen, Moon, Info } from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang, designCode, setDesignCode } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        {t('settings.title', lang)}
      </h1>

      {/* اللغة */}
      <Card title={lang === 'ar' ? 'اللغة' : 'Language'}>
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-teal-600" />
          <div className="flex-1">
            <SelectInput
              label=""
              value={lang}
              onChange={(v) => setLang(v as 'ar' | 'en')}
              options={[
                { value: 'ar', label: 'العربية' },
                { value: 'en', label: 'English' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* كود التصميم */}
      <Card title={lang === 'ar' ? 'كود التصميم' : 'Design Code'}>
        <div className="flex items-center gap-3">
          <BookOpen size={20} className="text-teal-600" />
          <div className="flex-1">
            <SelectInput
              label=""
              value={designCode}
              onChange={(v) => setDesignCode(v as 'syrian-code' | 'aci318' | 'eurocode2')}
              options={[
                { value: 'syrian-code', label: t('code.syrian', lang) },
                { value: 'aci318', label: t('code.aci318', lang) },
                { value: 'eurocode2', label: t('code.eurocode2', lang) },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* حول التطبيق */}
      <Card title={lang === 'ar' ? 'حول التطبيق' : 'About'}>
        <div className="flex items-start gap-3">
          <Info size={20} className="text-teal-600 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              {t('app.title', lang)}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {lang === 'ar'
                ? 'تطبيق هندسي ذكي للتصميم الإنشائي يعمل بالكامل في المتصفح. يدعم الحسابات الهندسية الدقيقة والرسوم التفاعلية وتوليد التقارير المهنية. يعمل بدون إنترنت كتطبيق PWA.'
                : 'A smart engineering app for structural design that runs entirely in the browser. Supports precise calculations, interactive drawings, and professional report generation. Works offline as a PWA.'
              }
            </p>
            <p className="text-xs text-gray-400">
              Version 1.0.0 | Vite + React + TypeScript + PWA
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
