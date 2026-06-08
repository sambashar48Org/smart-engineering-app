// ============================================================
// لوحة نتائج الأساسات - الكود العربي السوري 2024
// واجهة رشيقة: عناوين مختصرة، أرقام بارزة، بدون تكرار
// الرموز الكودية: σ₁, σ₂, q, M_u, Φ
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
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
            {lang === 'ar' ? 'النتائج بعد الحساب' : 'Results after calculation'}
          </p>
        </div>
      </div>
    );
  }

  const isIsolatedOrStrip = inputs.type === 'isolated' || inputs.type === 'continuous';
  const isRaft = inputs.type === 'mat';
  const isCombined = inputs.type === 'combined';
  const isContinuous = inputs.type === 'continuous';
  const isDynamicLoad = inputs.loadCase === 2 || inputs.loadCase === 3;

  return (
    <div className="space-y-3 overflow-y-auto h-full p-1">
      {/* تنبيه الأحمال الديناميكية */}
      {isDynamicLoad && results.loadCaseWarning && (
        <div className="p-2 bg-amber-50 rounded-lg border border-amber-300">
          <p className="text-xs font-semibold text-amber-700">
            {lang === 'ar' ? '⚠ أدخل M_x, M_y, H لصحة σ₁ و σ₂' : '⚠ Enter M_x, M_y, H for correct σ₁, σ₂'}
          </p>
        </div>
      )}

      {/* ═══ إجهاد التربة ═══ */}
      <Card title={lang === 'ar' ? 'إجهاد التربة' : 'Soil Stress'}>
        <div className="space-y-2">
          <ResultRow
            label={lang === 'ar' ? 'σ₁ الإجهاد الأقصى' : 'σ₁ Max Stress'}
            value={`${results.sigma_1}`}
            unit="kN/m²"
            badge={results.bearingSafe ? 'pass' : 'fail'}
            lang={lang}
          />
          <ResultRow
            label={lang === 'ar' ? 'σ₂ الإجهاد الأدنى' : 'σ₂ Min Stress'}
            value={`${results.sigma_2}`}
            unit="kN/m²"
          />
          <ResultRow
            label={lang === 'ar' ? 'الإجهاد المسموح المكبّر' : 'Magnified Allowable'}
            value={`${results.q_magnified}`}
            unit="kN/m²"
          />

          {results.hasTension && (
            <div className="p-1.5 bg-red-50 rounded border border-red-200">
              <span className="text-xs font-semibold text-red-700">
                {lang === 'ar' ? '⚠ شد وانفصال جزئي!' : '⚠ Tension zone!'}
              </span>
            </div>
          )}

          {/* نسبة التحقق */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-gray-400">
                {lang === 'ar' ? 'نسبة التحقق' : 'Verification'}
              </span>
              <span className={`text-xs font-bold ${
                results.bearingVerificationRatio <= 80 ? 'text-green-600' :
                results.bearingVerificationRatio <= 100 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {results.bearingVerificationRatio.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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

      {/* ═══ الاستقرار ═══ */}
      <Card title={lang === 'ar' ? 'الاستقرار' : 'Stability'}>
        <div className="space-y-2">
          <SafetyRow
            label={lang === 'ar' ? 'عامل أمان الانقلاب' : 'Overturning FS'}
            value={results.fs_overturning}
            safe={results.overturningSafe}
            lang={lang}
          />
          <SafetyRow
            label={lang === 'ar' ? 'عامل أمان الانزلاق' : 'Sliding FS'}
            value={results.fs_sliding}
            safe={results.slidingSafe}
            lang={lang}
          />
          <SafetyRow
            label={lang === 'ar' ? 'عامل أمان التعويم' : 'Buoyancy FS'}
            value={results.fs_buoyancy}
            safe={results.buoyancySafe}
            lang={lang}
          />
        </div>
      </Card>

      {/* ═══ القص ═══ */}
      <Card title={lang === 'ar' ? 'القص' : 'Shear'}>
        <div className="space-y-2">
          <ShearRowCompact
            label={lang === 'ar' ? 'القص أحادي الاتجاه' : 'One-Way Shear'}
            vMax={results.v_max_one_way}
            vRd={results.v_concrete_one_way}
            safe={results.oneWayShearSafe}
            lang={lang}
          />
          {!isContinuous && (
            <ShearRowCompact
              label={lang === 'ar' ? 'القص الثاقب' : 'Punching Shear'}
              vMax={results.v_max_punching}
              vRd={results.v_concrete_punching}
              safe={results.punchingShearSafe}
              lang={lang}
            />
          )}
        </div>
      </Card>

      {/* ═══ جساءة الحصيرة ═══ */}
      {isRaft && results.raftStiffnessCheck && (
        <Card title={lang === 'ar' ? 'جساءة الحصيرة [بند 11]' : 'Raft Stiffness [11]'}>
          <div className={`p-2 rounded-lg text-xs ${
            results.raftStiffnessCheck.isRigid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">
                {results.raftStiffnessCheck.isRigid
                  ? (lang === 'ar' ? '✅ صلدة' : '✅ Rigid')
                  : (lang === 'ar' ? '❌ غير صلدة' : '❌ Not Rigid')
                }
              </span>
              <StatusBadge status={results.raftStiffnessCheck.isRigid ? 'pass' : 'fail'} lang={lang} />
            </div>
            <div className="flex justify-between">
              <span>t<sub>فعلي</sub> = {results.raftStiffnessCheck.actualThickness} m</span>
              <span>t<sub>min</sub> = {results.raftStiffnessCheck.minThickness} m</span>
            </div>
          </div>
        </Card>
      )}

      {/* ═══ جائز التقويم ═══ */}
      {(isCombined || isContinuous) && results.strapBeamCheck && (
        <Card title={lang === 'ar' ? 'جائز التقويم' : 'Strap Beam'}>
          <div className={`p-2 rounded-lg text-xs ${
            results.strapBeamCheck.isSafe
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {results.strapBeamCheck.message}
          </div>
        </Card>
      )}

      {/* ═══ العزم السالب (مشترك) ═══ */}
      {isCombined && results.M_negative !== undefined && (
        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-200 text-xs">
          <span className="font-semibold text-indigo-700">
            {lang === 'ar' ? 'العزم السالب المحسوب:' : 'Calculated Negative Moment:'}
          </span>
          <span className="font-mono font-bold text-indigo-900 mr-2">
            M⁻ = {results.M_negative.toFixed(1)} kN.m
          </span>
        </div>
      )}

      {/* ═══ التسليح ═══ */}
      <Card title={lang === 'ar' ? 'التسليح' : 'Reinforcement'}>
        <div className="space-y-2">
          {/* تسليح سفلي */}
          <RebarCompact
            label={lang === 'ar' ? 'سفلي (X)' : 'Bottom (X)'}
            rebar={results.bottomRebarX}
          />
          <RebarCompact
            label={lang === 'ar' ? 'سفلي (Y)' : 'Bottom (Y)'}
            rebar={results.bottomRebarY}
          />

          {/* تسليح علوي - المنطق الذكي */}
          {isIsolatedOrStrip ? (
            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-semibold text-amber-700">
                {lang === 'ar'
                  ? 'التسليح العلوي: غير مطلوب كودياً (توفير هدر)'
                  : 'Top rebar: Not required per code (material savings)'}
              </p>
            </div>
          ) : (
            <>
              <RebarCompact
                label={lang === 'ar' ? 'علوي (X)' : 'Top (X)'}
                rebar={results.topRebarX}
              />
              <RebarCompact
                label={lang === 'ar' ? 'علوي (Y)' : 'Top (Y)'}
                rebar={results.topRebarY}
              />
              {/* ملاحظات مقتضبة */}
              {isRaft && (
                <p className="text-xs text-purple-600 font-semibold">
                  {lang === 'ar' ? '↗ تسليح إضافي فوق الأعمدة (شريحة العمود)' : '↗ Additional rebar over columns (column strip)'}
                </p>
              )}
              {isCombined && (
                <p className="text-xs text-indigo-600 font-semibold">
                  {lang === 'ar' ? '↗ شبكة علوية كاملة (عزم سالب بين العمودين)' : '↗ Full top mesh (negative moment between columns)'}
                </p>
              )}
            </>
          )}

          {/* العزم */}
          <div className="pt-2 border-t border-gray-100">
            <ResultRow
              label="M_u"
              value={`${results.M_u}`}
              unit="kN.m"
            />
          </div>

          {/* رسالة التفصيل */}
          {results.flexureMessage && (
            <div className={`p-1.5 rounded text-xs ${
              results.flexureMessage.includes('أقل') || results.flexureMessage.includes('فشل')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : results.flexureMessage.includes('تقييد') || results.flexureMessage.includes('تم تقييد')
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {results.flexureMessage}
            </div>
          )}
        </div>
      </Card>

      {/* رسالة إجهاد التربة - مقتضبة */}
      {results.bearingMessage && (
        <div className={`p-2 rounded-lg text-xs ${
          results.bearingSafe
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {results.bearingMessage}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   مكونات مساعدة رشيقة
   ══════════════════════════════════════════════ */

/** صف نتيجة عام: تسمية + قيمة + وحدة + شارة اختيارية */
function ResultRow({ label, value, unit, badge, lang }: {
  label: string; value: string; unit: string; badge?: 'pass' | 'fail' | 'warn'; lang?: Lang;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-bold text-gray-900">
          {value} <span className="text-xs font-normal text-gray-400">{unit}</span>
        </span>
        {badge && lang && <StatusBadge status={badge} lang={lang} />}
      </div>
    </div>
  );
}

/** صف عامل أمان */
function SafetyRow({ label, value, safe, lang }: {
  label: string; value: number; safe: boolean; lang: Lang;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-bold">{value}</span>
        <StatusBadge status={safe ? 'pass' : 'fail'} lang={lang} />
      </div>
    </div>
  );
}

/** صف قص مختصر */
function ShearRowCompact({ label, vMax, vRd, safe, lang }: {
  label: string; vMax: number; vRd: number; safe: boolean; lang: Lang;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs text-gray-400 mr-1">
          {vMax}/{vRd} MPa
        </span>
      </div>
      <StatusBadge status={safe ? 'pass' : 'fail'} lang={lang} />
    </div>
  );
}

/** صف تسليح مختصر: سطر واحد مباشر */
function RebarCompact({ label, rebar }: {
  label: string;
  rebar: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
}) {
  if (rebar.diameter === 0) return null;

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono font-bold text-gray-900">
          Φ{rebar.diameter}/{rebar.spacing}mm
        </span>
        <span className="text-xs text-gray-400">
          n={rebar.count} | A={rebar.areaProvided.toFixed(0)}/{rebar.areaRequired.toFixed(0)}
        </span>
      </div>
    </div>
  );
}
