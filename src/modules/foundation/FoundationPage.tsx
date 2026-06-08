// ============================================================
// صفحة تصميم الأساسات الرئيسية (Tri-Panel Layout)
// الكود العربي السوري 2024 - ملحق 5
// الرموز الكودية: σ₁, σ₂, V, t, D_f, q_magnified
// ============================================================

import React, { useState, useCallback } from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Button } from '@/components/ui';
import { Calculator, FileText, RotateCcw, Download, Settings2, Shield } from 'lucide-react';
import FoundationForm from './inputs/FoundationForm';
import DrawingCanvas from './components/DrawingCanvas';
import ResultsPanel from './components/ResultsPanel';
import { calculateFoundation, optimizeFoundationDimensions } from './calculations';

const FOUNDATION_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  isolated: { ar: 'أساس منفرد', en: 'Isolated Foundation' },
  continuous: { ar: 'أساس مستمر', en: 'Continuous Foundation' },
  combined: { ar: 'أساس مشترك', en: 'Combined Foundation' },
  mat: { ar: 'حصيرة عامة', en: 'Mat/Raft Foundation' },
};

const LOAD_CASE_LABELS = {
  1: { ar: 'دائمة + حية', en: 'Dead + Live', color: 'bg-green-100 text-green-800' },
  2: { ar: 'رياح', en: 'Wind', color: 'bg-blue-100 text-blue-800' },
  3: { ar: 'زلزال', en: 'Seismic', color: 'bg-red-100 text-red-800' },
};

export default function FoundationPage() {
  const { inputs, results, setResults, setInputs, resetAll } = useFoundationStore();
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

  /** تصدير المذكرة الحسابية PDF */
  const exportCalculationReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dateStr = new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });

    printWindow.document.write(`
      <html>
        <head>
          <title>المذكرة الحسابية - smart-engineering-app</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; color: #1e293b; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #0f766e; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; color: #0f766e; }
            .header p { margin: 5px 0 0 0; font-size: 13px; color: #64748b; }
            .section-title { font-size: 16px; font-weight: bold; color: #0f766e; border-right: 4px solid #0f766e; padding-right: 10px; margin-top: 25px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: right; }
            th { background-color: #f8fafc; color: #334155; font-weight: bold; }
            .pass { color: #16a34a; font-weight: bold; }
            .fail { color: #dc2626; font-weight: bold; }
            .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>smart-engineering-app — التقرير الحسابي الهندسي</h1>
            <p>مطابق للملحق رقم 5 - الكود العربي السوري لتأسيس المباني | تاريخ الإصدار: ${dateStr}</p>
          </div>

          <div class="section-title">اولاً: بيانات وعناصر الإدخال (Design Inputs)</div>
          <table>
            <tr><th>البارامتر الهندسي</th><th>القيمة المدخلة</th><th>البارامتر الهندسي</th><th>القيمة المدخلة</th></tr>
            <tr><td>نوع الأساس</td><td>${inputs.type === 'combined' ? 'مشترك' : inputs.type === 'mat' ? 'حصيرة عامة' : inputs.type === 'continuous' ? 'مستمر' : 'منفرد'}</td><td>إجهاد التأسيس المسموح (q)</td><td>${inputs.q_allowable} kN/m²</td></tr>
            <tr><td>أبعاد الأساس (B × L)</td><td>${inputs.B}m × ${inputs.L}m</td><td>سمك بلاطة الأساس (t)</td><td>${inputs.t} m</td></tr>
            <tr><td>حمل العمود (V)</td><td>${inputs.V} kN</td><td>حمل العمود الثاني (V₂)</td><td>${inputs.type === 'combined' ? (inputs.V2 || 0) + ' kN' : 'غير مدرج'}</td></tr>
            <tr><td>المجاز (L_span)</td><td>${inputs.type === 'combined' ? (inputs.L_span || 0) + ' m' : 'غير مدرج'}</td><td>حالة التحميل</td><td>الحالة رقم ${inputs.loadCase}</td></tr>
          </table>

          <div class="section-title">ثانياً: خلاصة نتائج التحققات (Verification Summary)</div>
          <table>
            <thead>
              <tr><th>التحقق الإنشائي</th><th>القيمة المحسوبة</th><th>الحد الحرج</th><th>حالة الأمان</th></tr>
            </thead>
            <tbody>
              ${results.checks.map((c: any) => `
                <tr>
                  <td>${c.nameAr}</td>
                  <td>${typeof c.value === 'number' ? c.value.toFixed(3) : c.value} ${c.unit}</td>
                  <td>${typeof c.limit === 'number' ? c.limit.toFixed(2) : c.limit} ${c.unit}</td>
                  <td class="${c.status === 'pass' ? 'pass' : 'fail'}">${c.status === 'pass' ? 'محقق ✓' : 'غير محقق ✗'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">ثالثاً: تفاصيل حديد التسليح (Reinforcement Details)</div>
          <p><b>التسليح السفلي:</b> X: ${results.bottomRebarX.count} Φ${results.bottomRebarX.diameter}/${results.bottomRebarX.spacing}mm | Y: ${results.bottomRebarY.count} Φ${results.bottomRebarY.diameter}/${results.bottomRebarY.spacing}mm</p>
          ${results.topRebarRequired ? `<p><b>الشبكة العلوية:</b> ${results.topRebarMessage}</p>` : ''}

          <div class="footer">
            تمت المراجعة والحساب برمجياً عبر منصة smart-engineering-app الهندسية
            <br><button class="no-print" onclick="window.print()" style="margin-top:15px; padding:6px 16px; background:#0f766e; color:white; border:none; border-radius:4px; cursor:pointer;">اطبع التقرير أو احفظه كـ PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const loadCaseInfo = LOAD_CASE_LABELS[inputs.loadCase];
  const typeLabel = FOUNDATION_TYPE_LABELS[inputs.type] || FOUNDATION_TYPE_LABELS.isolated;

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
              {lang === 'ar' ? typeLabel.ar : typeLabel.en}
            </p>
          </div>
        </div>

        {/* شارة حالة التحميل */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${loadCaseInfo.color}`}>
          {lang === 'ar' ? loadCaseInfo.ar : loadCaseInfo.en}
        </span>

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
          variant="secondary"
          size="md"
          onClick={() => {
            const optimized = optimizeFoundationDimensions(inputs);
            setInputs(optimized);
            // Then calculate
            const newResults = calculateFoundation(optimized);
            setResults(newResults);
          }}
          title={lang === 'ar' ? 'تحديد الأبعاد تلقائياً' : 'Auto-size dimensions'}
        >
          <Settings2 size={16} />
          {lang === 'ar' ? 'تحسين' : 'Auto-Size'}
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
            <Button variant="secondary" size="sm" onClick={exportCalculationReport}>
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
        <span className="flex items-center gap-1">
          <Shield size={12} />
          {lang === 'ar' ? 'الكود: العربي السوري 2024 - ملحق 5' : 'Code: Syrian Arabic 2024 - Annex 5'}
        </span>
        <span className="text-gray-600">|</span>
        <span>{lang === 'ar' ? 'الوحدات: kN, m, mm' : 'Units: kN, m, mm'}</span>
        <span className="text-gray-600">|</span>
        <span>
          {lang === 'ar' ? 'تربة: SLS' : 'Soil: SLS'}
        </span>
        <span className="text-gray-600">+</span>
        <span>
          {lang === 'ar' ? 'إنشائي: ULS' : 'Structural: ULS'}
        </span>
        <span className="text-gray-600">|</span>
        <span>
          {results.calculated
            ? (lang === 'ar' ? '✓ محسوب' : '✓ Calculated')
            : (lang === 'ar' ? 'في انتظار الحساب' : 'Awaiting calculation')
          }
        </span>
        {results.calculated && (
          <>
            <span className="text-gray-600">|</span>
            <span className={results.bearingSafe ? 'text-green-400' : 'text-red-400'}>
              {results.bearingSafe
                ? (lang === 'ar' ? '✓ التربة آمنة' : '✓ Soil Safe')
                : (lang === 'ar' ? '✗ تجاوز' : '✗ Exceeded')
              }
            </span>
          </>
        )}
      </div>
    </div>
  );
}
