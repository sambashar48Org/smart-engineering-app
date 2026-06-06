// ============================================================
// لوحة نتائج الأساسات - الكود العربي السوري 2024
// المنطق الذكي:
//   منفرد/مستمر = بدون تسليح علوي "غير مطلوب إنشائياً كودياً"
//   حصيرة/مشترك = شبكتان كاملتان + تحقق جساءة
// الرموز الكودية: σ₁, σ₂, q_magnified, Base-PSR, F_s
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Card, StatusBadge } from '@/components/ui';
import type { Lang } from '@/types';

export default function ResultsPanel() {
  const { inputs, results } = useFoundationStore();
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

  const isIsolatedOrStrip = inputs.type === 'isolated' || inputs.type === 'continuous';
  const isRaft = inputs.type === 'mat';

  return (
    <div className="space-y-4 overflow-y-auto h-full p-1">
      {/* ملخص إجهاد التربة */}
      <Card title={lang === 'ar' ? 'إجهاد التربة' : 'Soil Bearing'}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'الإجهاد الأكبر σ₁' : 'Max Stress σ₁'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {results.sigma_1} <span className="text-xs text-gray-400">kN/m²</span>
              </span>
              <StatusBadge status={results.bearingSafe ? 'pass' : 'fail'} lang={lang} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'الإجهاد الأصغر σ₂' : 'Min Stress σ₂'}
            </span>
            <span className="text-sm font-mono">
              {results.sigma_2} <span className="text-xs text-gray-400">kN/m²</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {lang === 'ar' ? 'إجهاد التحميل المسموح المكبر' : 'Magnified Allowable'}
            </span>
            <span className="text-sm font-mono">
              {results.q_magnified} <span className="text-xs text-gray-400">kN/m²</span>
            </span>
          </div>

          {results.hasTension && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
              <span className="text-xs font-semibold text-red-700">
                {lang === 'ar' ? '⚠ وجود شد وانفصال جزئي!' : '⚠ Tension zone detected!'}
              </span>
            </div>
          )}

          {/* نسبة التحقق من إجهاد التربة */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                {lang === 'ar' ? 'نسبة التحقق من إجهاد التربة' : 'Bearing Verification Ratio'}
              </span>
              <span className={`text-xs font-bold ${
                results.bearingVerificationRatio <= 80 ? 'text-green-600' :
                results.bearingVerificationRatio <= 100 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {results.bearingVerificationRatio.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  results.bearingVerificationRatio <= 80 ? 'bg-green-500' :
                  results.bearingVerificationRatio <= 100 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min(results.bearingVerificationRatio, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* الاستقرار */}
      <Card title={lang === 'ar' ? 'الاستقرار والثبات' : 'Stability Checks'}>
        <div className="space-y-3">
          <StabilityRow
            label={lang === 'ar' ? 'درجة الاستقرار ضد الانقلاب (Base-PSR)' : 'Overturning Stability (Base-PSR)'}
            value={results.fs_overturning}
            safe={results.overturningSafe}
            lang={lang}
          />
          <StabilityRow
            label={lang === 'ar' ? 'معامل الأمان من الانزلاق (F_s)' : 'Sliding Safety Factor (F_s)'}
            value={results.fs_sliding}
            safe={results.slidingSafe}
            lang={lang}
          />
          <StabilityRow
            label={lang === 'ar' ? 'معامل الأمان من التعويم' : 'Buoyancy Safety Factor'}
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
            label={lang === 'ar' ? 'التحقق من جهد القص بالقطاع الحرج' : 'One-Way Shear Verification'}
            vMax={results.v_max_one_way}
            vRd={results.v_concrete_one_way}
            safe={results.oneWayShearSafe}
            lang={lang}
          />
          <ShearRow
            label={lang === 'ar' ? 'التحقق من إجهاد الثقب للخرسانة' : 'Punching Shear Verification'}
            vMax={results.v_max_punching}
            vRd={results.v_concrete_punching}
            safe={results.punchingShearSafe}
            lang={lang}
          />
        </div>
      </Card>

      {/* تحقق جساءة الحصيرة [بند 11] */}
      {isRaft && results.raftStiffnessCheck && (
        <Card title={lang === 'ar' ? 'تحقق جساءة الحصيرة [بند 11]' : 'Raft Stiffness Check [Clause 11]'}>
          <div className={`p-3 rounded-lg text-xs ${
            results.raftStiffnessCheck.isRigid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {results.raftStiffnessCheck.isRigid
                  ? (lang === 'ar' ? '✅ الحصيرة صلدة' : '✅ Raft is Rigid')
                  : (lang === 'ar' ? '❌ الحصيرة غير صلدة' : '❌ Raft is NOT Rigid')
                }
              </span>
              <StatusBadge status={results.raftStiffnessCheck.isRigid ? 'pass' : 'fail'} lang={lang} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'السمك الفعلي t' : 'Actual Thickness t'}</span>
                <span className="font-mono">{results.raftStiffnessCheck.actualThickness} m</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'الحد الأدنى المطلوب' : 'Required Minimum'}</span>
                <span className="font-mono">{results.raftStiffnessCheck.minThickness} m</span>
              </div>
            </div>
            <p className="mt-2">{results.raftStiffnessCheck.message}</p>
          </div>
        </Card>
      )}

      {/* التسليح */}
      <Card title={lang === 'ar' ? 'التسليح المقترح' : 'Proposed Reinforcement'}>
        <div className="space-y-3">
          {/* تسليح سفلي - دائماً موجود */}
          <RebarRowV2
            label={lang === 'ar' ? 'أسفل (X) - فرش' : 'Bottom (X) - Main'}
            rebar={results.bottomRebarX}
            lang={lang}
          />
          <RebarRowV2
            label={lang === 'ar' ? 'أسفل (Y) - غطاء' : 'Bottom (Y) - Distribution'}
            rebar={results.bottomRebarY}
            lang={lang}
          />

          {/* تسليح علوي - المنطق الذكي */}
          {isIsolatedOrStrip ? (
            // منفرد/مستمر: إلغاء كامل للتسليح العلوي
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-300">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-800">
                  {lang === 'ar' ? 'التسليح العلوي' : 'Top Reinforcement'}
                </span>
              </div>
              <p className="text-xs font-semibold text-amber-700">
                {lang === 'ar'
                  ? 'غير مطلوب إنشائياً كودياً (توفير هدر)'
                  : 'Not required structurally per code (material savings)'}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                {lang === 'ar'
                  ? 'الأساس المنفرد/المستمر يعمل ككنسة بظفر صاعد، لا توجد عزوم سلبية تتطلب تسليحاً علويّاً'
                  : 'Isolated/continuous footing acts as a cantilever with upward projection, no negative moments requiring top rebar'}
              </p>
            </div>
          ) : (
            // حصيرة/مشترك: شبكتان كاملتان
            <>
              <RebarRowV2
                label={lang === 'ar' ? 'أعلى (X) - شبكة علوية' : 'Top (X) - Upper Mesh'}
                rebar={results.topRebarX}
                lang={lang}
              />
              <RebarRowV2
                label={lang === 'ar' ? 'أعلى (Y) - شبكة علوية' : 'Top (Y) - Upper Mesh'}
                rebar={results.topRebarY}
                lang={lang}
              />
              {results.topRebarMessage && (
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">{results.topRebarMessage}</p>
                </div>
              )}
            </>
          )}
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
            results.flexureMessage.includes('أقل') || results.flexureMessage.includes('فشل')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : results.flexureMessage.includes('تقييد') || results.flexureMessage.includes('تم تقييد')
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {results.flexureMessage}
          </div>
        )}
      </Card>

      {/* جدول التحققات */}
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

/** صف تسليح */
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
