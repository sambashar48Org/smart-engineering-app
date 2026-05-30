// ============================================================
// لوحة نتائج الأساسات
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Card, StatusBadge } from '@/components/ui';
import type { Lang } from '@/types';

export default function ResultsPanel() {
  const { results } = useFoundationStore();
  const { lang } = useAppStore();

  if (!results.calculated) {
    return (
      <div className="flex items-center justify-center h-full text-center p-6">
        <div className="space-y-3">
          <div className="text-4xl">📊</div>
          <p className="text-sm text-gray-400">
            {lang === 'ar' ? 'النتائج ستظهر هنا بعد الحساب' : 'Results will appear here after calculation'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 overflow-y-auto h-full p-1">
      {/* ملخص سريع */}
      <Card title={lang === 'ar' ? 'ملخص الحسابات' : 'Calculation Summary'}>
        <div className="space-y-3">
          {/* إجهاد التربة */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('result.bearingStress', lang)}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {results.maxStress} <span className="text-xs text-gray-400">kN/m²</span>
              </span>
              <StatusBadge status={results.utilizationRatio <= 1 ? 'pass' : 'fail'} lang={lang} />
            </div>
          </div>

          {/* نسبة الاستثمار */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{t('result.utilization', lang)}</span>
              <span className={`text-xs font-bold ${
                results.utilizationRatio <= 0.8 ? 'text-green-600' :
                results.utilizationRatio <= 1.0 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {(results.utilizationRatio * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  results.utilizationRatio <= 0.8 ? 'bg-green-500' :
                  results.utilizationRatio <= 1.0 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(results.utilizationRatio * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* جدول التحققات */}
      <Card title={lang === 'ar' ? 'جدول التحققات' : 'Checks Table'}>
        <div className="space-y-2">
          {results.checks.map((check, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-gray-800">
                  {check.nameAr}
                </span>
                <span className="text-xs text-gray-400">
                  {check.value} / {check.limit} {check.unit}
                </span>
              </div>
              <StatusBadge status={check.status} lang={lang} />
            </div>
          ))}
        </div>
      </Card>

      {/* التسليح */}
      <Card title={lang === 'ar' ? 'التسليح المقترح' : 'Proposed Reinforcement'}>
        <div className="space-y-3">
          {/* أسفل اتجاه X */}
          <RebarRow
            label={lang === 'ar' ? 'أسفل (X)' : 'Bottom (X)'}
            rebar={results.bottomRebarX}
            lang={lang}
          />
          {/* أسفل اتجاه Y */}
          <RebarRow
            label={lang === 'ar' ? 'أسفل (Y)' : 'Bottom (Y)'}
            rebar={results.bottomRebarY}
            lang={lang}
          />
          {/* أعلى X */}
          <RebarRow
            label={lang === 'ar' ? 'أعلى (X)' : 'Top (X)'}
            rebar={results.topRebarX}
            lang={lang}
          />
          {/* أعلى Y */}
          <RebarRow
            label={lang === 'ar' ? 'أعلى (Y)' : 'Top (Y)'}
            rebar={results.topRebarY}
            lang={lang}
          />
        </div>
      </Card>
    </div>
  );
}

/** صف تسليح */
function RebarRow({
  label,
  rebar,
  lang,
}: {
  label: string;
  rebar: { diameter: number; spacing: number; area: number };
  lang: Lang;
}) {
  if (rebar.diameter === 0) return null;

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-mono font-semibold text-gray-900">
        Φ{rebar.diameter}/{rebar.spacing}mm
      </span>
    </div>
  );
}
