// ============================================================
// صفحة تصميم الأساسات الرئيسية (Tri-Panel Layout)
// ============================================================

import React, { useState, useCallback } from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Button } from '@/components/ui';
import { Calculator, FileText, RotateCcw, Download, Settings2 } from 'lucide-react';
import FoundationForm from './inputs/FoundationForm';
import DrawingCanvas from './components/DrawingCanvas';
import ResultsPanel from './components/ResultsPanel';
import { calculateFoundation } from './calculations';

export default function FoundationPage() {
  const { inputs, results, setResults, resetAll } = useFoundationStore();
  const { lang } = useAppStore();
  const [isCalculating, setIsCalculating] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState<'inputs' | 'results'>('inputs');

  /** حساب الأساس */
  const handleCalculate = useCallback(() => {
    setIsCalculating(true);

    // تأخير قصير لعرض حالة الحساب
    requestAnimationFrame(() => {
      const newResults = calculateFoundation(inputs);
      setResults(newResults);
      setIsCalculating(false);

      // على الموبايل، الانتقال تلقائياً للنتائج
      setShowMobilePanel('results');
    });
  }, [inputs, setResults]);

  return (
    <div className="h-full flex flex-col">
      {/* شريط الأدوات العلوي */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              {t('foundation.title', lang)}
            </h1>
            <p className="text-xs text-gray-400">
              {lang === 'ar' ? 'أساس منفرد' : 'Isolated Foundation'}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={resetAll}
        >
          <RotateCcw size={14} />
          {t('btn.reset', lang)}
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={handleCalculate}
          disabled={isCalculating}
        >
          <Calculator size={16} />
          {isCalculating
            ? (lang === 'ar' ? 'جاري الحساب...' : 'Calculating...')
            : t('btn.calculate', lang)
          }
        </Button>

        {results.calculated && (
          <>
            <Button variant="secondary" size="sm">
              <FileText size={14} />
              PDF
            </Button>
            <Button variant="secondary" size="sm">
              <Download size={14} />
              DXF
            </Button>
          </>
        )}
      </div>

      {/* المحتوى الرئيسي - ثلاث لوحات */}
      <div className="flex-1 flex overflow-hidden">
        {/* لوحة المدخلات (يسار) */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-white overflow-y-auto">
          <div className="p-4">
            <FoundationForm />
          </div>
        </div>

        {/* لوحة الرسم (وسط) */}
        <div className="flex-1 border-l border-gray-200">
          <DrawingCanvas />
        </div>

        {/* لوحة النتائج (يمين) */}
        <div className="hidden lg:block w-80 bg-gray-50/50 overflow-y-auto">
          <div className="p-4">
            <ResultsPanel />
          </div>
        </div>
      </div>

      {/* شريط الموبايل للتبديل بين اللوحات */}
      <div className="lg:hidden flex items-center border-t border-gray-200 bg-white">
        <button
          onClick={() => setShowMobilePanel('inputs')}
          className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
            showMobilePanel === 'inputs'
              ? 'text-teal-700 border-t-2 border-teal-700 bg-teal-50/50'
              : 'text-gray-500'
          }`}
        >
          {lang === 'ar' ? 'المدخلات' : 'Inputs'}
        </button>
        <button
          onClick={() => setShowMobilePanel('results')}
          className={`flex-1 py-3 text-sm font-medium transition-colors cursor-pointer ${
            showMobilePanel === 'results'
              ? 'text-teal-700 border-t-2 border-teal-700 bg-teal-50/50'
              : 'text-gray-500'
          }`}
        >
          {lang === 'ar' ? 'النتائج' : 'Results'}
        </button>
      </div>

      {/* اللوحات المنبثقة للموبايل */}
      {showMobilePanel === 'inputs' && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-white overflow-y-auto">
          <div className="p-4">
            <FoundationForm />
          </div>
        </div>
      )}
      {showMobilePanel === 'results' && (
        <div className="lg:hidden fixed inset-0 top-14 z-40 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <ResultsPanel />
          </div>
        </div>
      )}

      {/* شريط الحالة */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-gray-900 text-gray-300 text-xs">
        <span>{lang === 'ar' ? 'الكود: ACI 318-19' : 'Code: ACI 318-19'}</span>
        <span className="text-gray-600">|</span>
        <span>{lang === 'ar' ? 'الوحدات: kN, m, mm' : 'Units: kN, m, mm'}</span>
        <span className="text-gray-600">|</span>
        <span>
          {results.calculated
            ? (lang === 'ar' ? '✓ محسوب' : '✓ Calculated')
            : (lang === 'ar' ? 'في انتظار الحساب' : 'Awaiting calculation')
          }
        </span>
      </div>
    </div>
  );
}
