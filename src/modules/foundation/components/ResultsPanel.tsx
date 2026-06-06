// ============================================================
// لوحة نتائج الأساسات - الكود العربي السوري 2024
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
      {/* ملخص إجهاد التربة */}
      <Card title={lang === 'ar' ? 'إجهاد التربة' : 'Soil Bearing'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'الإجهاد الأقصى q_max' : 'Max Stress q_max'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {results.maxStress} <span className="text-xs text-gray-400">kN/m²</span>
              </span>
              <StatusBadge status={results.bearingSafe ? 'pass' : 'fail'} lang={lang} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'الإجهاد الأدنى q_min' : 'Min Stress q_min'}
            </span>
            <span className="text-sm font-mono">
              {results.minStress} <span className="text-xs text-gray-400">kN/m²</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'الإجهاد المسموح المعدّل' : 'Modified Allowable'}
            </span>
            <span className="text-sm font-mono">
              {results.allowableModified} <span className="text-xs text-gray-400">kN/m²</span>
            </span>
          </div>

          {results.hasTension && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs font-semibold text-red-700">
                {lang === 'ar' ? '⚠ وجود شد وانفصال جزئي!' : '⚠ Tension zone detected!'}
              </span>
            </div>
          )}

          {/* نسبة الاستثمار */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{t('result.utilization', lang)}</span>
              <span className={`text-xs font-bold ${
                results.investmentRatio <= 80 ? 'text-green-600' :
                results.investmentRatio <= 100 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {results.investmentRatio.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  results.investmentRatio <= 80 ? 'bg-green-500' :
                  results.investmentRatio <= 100 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(results.investmentRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* الاستقرار */}
      <Card title={lang === 'ar' ? 'الاستقرار والثبات' : 'Stability Checks'}>
        <div className="space-y-3">
          <StabilityRow
            label={lang === 'ar' ? 'معامل أمان الانقلاب' : 'Overturning FS'}
            value={results.fs_overturning}
            safe={results.overturningSafe}
            lang={lang}
          />
          <StabilityRow
            label={lang === 'ar' ? 'معامل أمان الانزلاق' : 'Sliding FS'}
            value={results.fs_sliding}
            safe={results.slidingSafe}
            lang={lang}
          />
          <StabilityRow
            label={lang === 'ar' ? 'معامل أمان التعويم' : 'Buoyancy FS'}
            value={results.fs_buoyancy}
            safe={results.buoyancySafe}
            lang={lang}
          />
        </div>
      </Card>

      {/* القص */}
      <Card title={lang === 'ar' ? 'تحققات القص' : 'Shear Checks'}>
        <div className="space-y-3">
          <ShearRow
            label={lang === 'ar' ? 'القص أحادي الاتجاه' : 'One-Way Shear'}
            vMax={results.v_max_one_way}
            vRd={results.v_concrete_one_way}
            safe={results.oneWayShearSafe}
            lang={lang}
          />
          <ShearRow
            label={lang === 'ar' ? 'القص الثاقب' : 'Punching Shear'}
            vMax={results.v_max_punching}
            vRd={results.v_concrete_punching}
            safe={results.punchingShearSafe}
            lang={lang}
          />
        </div>
      </Card>

      {/* جدول التحققات الموحد */}
      <Card title={lang === 'ar' ? 'جدول التحققات الكودية' : 'Code Checks Table'}>
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
          <RebarRowV2
            label={lang === 'ar' ? 'أسفل (X)' : 'Bottom (X)'}
            rebar={results.bottomRebarX}
            lang={lang}
          />
          <RebarRowV2
            label={lang === 'ar' ? 'أسفل (Y)' : 'Bottom (Y)'}
            rebar={results.bottomRebarY}
            lang={lang}
          />
          <RebarRowV2
            label={lang === 'ar' ? 'أعلى (X) - انكماش' : 'Top (X) - Shrinkage'}
            rebar={results.topRebarX}
            lang={lang}
          />
          <RebarRowV2
            label={lang === 'ar' ? 'أعلى (Y) - انكماش' : 'Top (Y) - Shrinkage'}
            rebar={results.topRebarY}
            lang={lang}
          />
        </div>

        {/* العزم */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {lang === 'ar' ? 'العزم الحدي M_u' : 'Ultimate Moment M_u'}
            </span>
            <span className="text-sm font-mono font-semibold">
              {results.M_u} <span className="text-xs text-gray-400">kN.m</span>
            </span>
          </div>
        </div>

        {/* رسالة التفصيل */}
        {results.flexureMessage && (
          <div className={`mt-3 p-2 rounded-lg text-xs ${
            results.flexureMessage.includes('❌') || results.flexureMessage.includes('أقل')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : results.flexureMessage.includes('⚠') || results.flexureMessage.includes('تقييد')
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {results.flexureMessage}
          </div>
        )}
      </Card>

      {/* رسالة إجهاد التربة */}
      {results.bearingMessage && (
        <Card title={lang === 'ar' ? 'رسالة الحالة' : 'Status Message'}>
          <div className={`p-2 rounded-lg text-xs ${
            results.bearingSafe
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {results.bearingMessage}
          </div>
        </Card>
      )}
    </div>
  );
}

/** صف استقرار */
function StabilityRow({ label, value, safe, lang }: {
  label: string; value: number; safe: boolean; lang: Lang;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-semibold">{value}</span>
        <StatusBadge status={safe ? 'pass' : 'fail'} lang={lang} />
      </div>
    </div>
  );
}

/** صف قص */
function ShearRow({ label, vMax, vRd, safe, lang }: {
  label: string; vMax: number; vRd: number; safe: boolean; lang: Lang;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <span className="text-sm text-gray-600 block">{label}</span>
        <span className="text-xs text-gray-400">
          {vMax} / {vRd} MPa
        </span>
      </div>
      <StatusBadge status={safe ? 'pass' : 'fail'} lang={lang} />
    </div>
  );
}

/** صف تسليح محدّث */
function RebarRowV2({
  label,
  rebar,
  lang,
}: {
  label: string;
  rebar: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  lang: Lang;
}) {
  if (rebar.diameter === 0) return null;

  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-mono font-semibold text-gray-900">
          Φ{rebar.diameter}/{rebar.spacing}mm
        </span>
      </div>
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-xs text-gray-400">
          {lang === 'ar' ? 'عدد' : 'Count'}: {rebar.count}
        </span>
        <span className="text-xs text-gray-400">
          {lang === 'ar' ? 'مساحة' : 'Area'}: {rebar.areaProvided.toFixed(0)} / {rebar.areaRequired.toFixed(0)} mm²
        </span>
      </div>
    </div>
  );
}
