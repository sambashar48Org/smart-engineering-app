// ============================================================
// لوحة نتائج الأساسات - الكود العربي السوري - ملحق 5
// واجهة رشيقة فائقة الاحترافية: أرقام بارزة، بطاقات منظمة، بدون تكرار لفظي
// الرموز الكودية: σ₁, σ₂, q_all, M_u, Φ
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
      <div className="flex items-center justify-center h-full text-center p-6 bg-slate-50">
        <div className="space-y-2 text-slate-400">
          <div className="text-4xl">📊</div>
          <p className="text-xs">{lang === 'ar' ? 'النتائج تظهر فور الحساب' : 'Awaiting Calculations...'}</p>
        </div>
      </div>
    );
  }

  const isIsolatedOrStrip = inputs.type === 'isolated' || inputs.type === 'continuous';
  const isRaft = inputs.type === 'mat';
  const isCombined = inputs.type === 'combined';
  const isDynamicLoad = inputs.loadCase === 2 || inputs.loadCase === 3;

  // تنسيق رسائل التسليح
  const fmtRebar = (rebar: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number }) => {
    if (rebar.diameter === 0) return '';
    return `Φ${rebar.diameter}/${rebar.spacing}mm | n=${rebar.count} | A=${rebar.areaProvided.toFixed(0)}/${rebar.areaRequired.toFixed(0)}`;
  };

  return (
    <div className="space-y-3 overflow-y-auto h-full p-3 bg-slate-100 select-none">

      {/* تنبيه الأحمال الديناميكية */}
      {isDynamicLoad && results.loadCaseWarning && (
        <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs font-semibold text-amber-700 leading-relaxed">
            ⚠️ {lang === 'ar'
              ? 'أدخل M_x, M_y, H لصحة توزيع σ₁ و σ₂'
              : 'Enter M_x, M_y, H for correct σ₁ and σ₂ distribution'}
          </p>
        </div>
      )}

      {/* ═══ 1. إجهاد التربة المحسوب ═══ */}
      <div className="p-3 bg-white space-y-2 shadow-sm border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between border-b pb-1.5">
          <h4 className="text-xs font-bold text-slate-800">{lang === 'ar' ? '🎯 إجهاد التربة (SLS)' : 'Soil Bearing Check'}</h4>
          <StatusBadge status={results.bearingSafe ? 'pass' : 'fail'} lang={lang} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500">{lang === 'ar' ? 'σ₁ الإجهاد الأقصى' : 'σ₁ Max Stress'}</span>
            <strong className="font-mono text-sm block text-slate-800 mt-0.5">{results.sigma_1} kN/m²</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500">{lang === 'ar' ? 'σ₂ الإجهاد الأدنى' : 'σ₂ Min Stress'}</span>
            <strong className="font-mono text-sm block text-slate-800 mt-0.5">{results.sigma_2} kN/m²</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500">{lang === 'ar' ? 'الإجهاد المسموح المكبّر' : 'Magnified Allowable'}</span>
            <strong className="font-mono text-sm block text-blue-700 mt-0.5">{results.q_magnified} kN/m²</strong>
          </div>
          <div className="bg-slate-50 p-2 rounded">
            <span className="text-slate-500">{lang === 'ar' ? 'نسبة استثمار التربة' : 'Utilization Ratio'}</span>
            <strong className={`font-mono text-sm block mt-0.5 ${
              results.bearingVerificationRatio <= 80 ? 'text-emerald-700' :
              results.bearingVerificationRatio <= 100 ? 'text-amber-700' : 'text-rose-700'
            }`}>{results.bearingVerificationRatio.toFixed(1)}%</strong>
          </div>
        </div>

        {/* شريط نسبة التحقق */}
        <div className="pt-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                results.bearingVerificationRatio <= 80 ? 'bg-emerald-500' :
                results.bearingVerificationRatio <= 100 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(results.bearingVerificationRatio, 100)}%` }}
            />
          </div>
        </div>

        {/* تنبيه شد */}
        {results.hasTension && (
          <div className="p-1.5 bg-red-50 rounded border border-red-200">
            <span className="text-xs font-semibold text-red-700">
              {lang === 'ar' ? '⚠ شد وانفصال جزئي!' : '⚠ Tension zone!'}
            </span>
          </div>
        )}
      </div>

      {/* ═══ 2. الاستقرار والثبات الميكانيكي ═══ */}
      <div className="p-3 bg-white space-y-2 shadow-sm border border-slate-200 rounded-xl">
        <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5">{lang === 'ar' ? '⚖️ الاستقرار والثبات' : 'Stability Safety'}</h4>
        <div className="space-y-1.5">
          <CompactResultRow
            label={lang === 'ar' ? 'عامل أمان الانقلاب' : 'Overturning F.S'}
            value={results.fs_overturning}
            safe={results.overturningSafe}
            limit="≥ 1.5"
          />
          <CompactResultRow
            label={lang === 'ar' ? 'عامل أمان الانزلاق' : 'Sliding F.S'}
            value={results.fs_sliding}
            safe={results.slidingSafe}
            limit="≥ 1.5"
          />
          <CompactResultRow
            label={lang === 'ar' ? 'عامل أمان التعويم' : 'Buoyancy F.S'}
            value={results.fs_buoyancy}
            safe={results.buoyancySafe}
            limit="≥ 1.1"
          />
        </div>
      </div>

      {/* ═══ 3. مقاومة المقاطع للقص والانثقاب ═══ */}
      <div className="p-3 bg-white space-y-2 shadow-sm border border-slate-200 rounded-xl">
        <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5">{lang === 'ar' ? '⚔️ تحققات القص (ULS)' : 'Shear & Punching Checks'}</h4>
        <div className="space-y-1.5">
          <CompactShearRow
            label={lang === 'ar' ? 'القص أحادي الاتجاه' : 'One-way Shear'}
            vMax={results.v_max_one_way}
            vRd={results.v_concrete_one_way}
            safe={results.oneWayShearSafe}
          />
          <CompactShearRow
            label={lang === 'ar' ? 'القص الثاقب (الانثقاب)' : 'Punching Shear'}
            vMax={results.v_max_punching}
            vRd={results.v_concrete_punching}
            safe={results.punchingShearSafe}
          />
        </div>

        {/* جساءة الحصيرة */}
        {isRaft && results.raftStiffnessCheck && (
          <div className={`p-2 rounded-lg text-xs mt-1 ${
            results.raftStiffnessCheck.isRigid
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">
                {results.raftStiffnessCheck.isRigid
                  ? (lang === 'ar' ? '✅ صلدة [بند 11]' : '✅ Rigid [11]')
                  : (lang === 'ar' ? '❌ غير صلدة [بند 11]' : '❌ Not Rigid [11]')}
              </span>
              <StatusBadge status={results.raftStiffnessCheck.isRigid ? 'pass' : 'fail'} lang={lang} />
            </div>
            <div className="flex justify-between font-mono">
              <span>t_فعلي = {results.raftStiffnessCheck.actualThickness} m</span>
              <span>t_min = {results.raftStiffnessCheck.minThickness} m</span>
            </div>
          </div>
        )}

        {/* ملاحظة شريحة العمود */}
        {results.columnStripNote && (
          <p className="text-[11px] text-purple-700 font-medium bg-purple-50 p-1.5 rounded border border-purple-100 mt-1">
            💡 {results.columnStripNote}
          </p>
        )}
      </div>

      {/* ═══ 4. التسليح الإنشائي النهائي المقترح ═══ */}
      <div className="p-3 bg-white space-y-2 shadow-sm border border-slate-200 rounded-xl">
        <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5">{lang === 'ar' ? '🏗️ التسليح النهائي المعتمد' : 'Required Reinforcement'}</h4>
        <div className="divide-y divide-slate-100 text-xs">
          {/* تسليح سفلي X */}
          <CompactRebarRow
            label={lang === 'ar' ? '• تسليح سفلي رئيسي (X) - فرش' : 'Bottom Rebar (X)'}
            msg={fmtRebar(results.bottomRebarX)}
          />
          {/* تسليح سفلي Y */}
          <CompactRebarRow
            label={lang === 'ar' ? '• تسليح سفلي عارض (Y) - غطاء' : 'Bottom Rebar (Y)'}
            msg={fmtRebar(results.bottomRebarY)}
          />

          {/* تسليح علوي - المنطق الذكي */}
          {isIsolatedOrStrip ? (
            <div className="py-2">
              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-semibold text-amber-700">
                  {lang === 'ar'
                    ? 'التسليح العلوي: غير مطلوب كودياً (توفير هدر)'
                    : 'Top rebar: Not required per code (material savings)'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <CompactRebarRow
                label={lang === 'ar' ? '• تسليح علوي رئيسي (X)' : 'Top Rebar (X)'}
                msg={fmtRebar(results.topRebarX)}
              />
              <CompactRebarRow
                label={lang === 'ar' ? '• تسليح علوي عارض (Y)' : 'Top Rebar (Y)'}
                msg={fmtRebar(results.topRebarY)}
              />
              {/* ملاحظات مقتضبة */}
              {isRaft && (
                <p className="text-xs text-purple-600 font-semibold py-1">
                  ↗ {lang === 'ar' ? 'تسليح إضافي فوق الأعمدة (شريحة العمود)' : 'Additional rebar over columns (column strip)'}
                </p>
              )}
              {isCombined && (
                <p className="text-xs text-indigo-600 font-semibold py-1">
                  ↗ {lang === 'ar' ? 'شبكة علوية كاملة (عزم سالب بين العمودين)' : 'Full top mesh (negative moment between columns)'}
                </p>
              )}
            </>
          )}
        </div>

        {/* العزم */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-500">M_u</span>
            <span className="text-sm font-mono font-bold text-gray-900">
              {results.M_u.toFixed(2)} <span className="text-xs font-normal text-gray-400">kN.m</span>
            </span>
          </div>
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

      {/* رسالة إجهاد التربة */}
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
   عناصر الواجهة الرشيقة والمدمجة
   ══════════════════════════════════════════════ */

/** صف عامل أمان */
function CompactResultRow({ label, value, safe, limit }: {
  label: string; value: number; safe: boolean; limit: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 bg-slate-50 px-2 rounded">
      <span className="text-slate-600 text-xs">{label} <small className="text-slate-400">({limit})</small></span>
      <span className={`font-mono font-bold text-xs ${safe ? 'text-emerald-600' : 'text-rose-600'}`}>
        {value > 100 ? '∞' : value.toFixed(2)} {safe ? '✓' : '❌'}
      </span>
    </div>
  );
}

/** صف قص مختصر */
function CompactShearRow({ label, vMax, vRd, safe }: {
  label: string; vMax: number; vRd: number; safe: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 bg-slate-50 px-2 rounded">
      <div className="flex flex-col">
        <span className="text-slate-600 text-xs">{label}</span>
        <small className="text-slate-400 font-mono">{vMax.toFixed(3)} / {vRd.toFixed(2)} MPa</small>
      </div>
      <span className={`font-bold text-xs ${safe ? 'text-emerald-600' : 'text-rose-600'}`}>
        {safe ? 'آمن ✓' : 'غير آمن ❌'}
      </span>
    </div>
  );
}

/** صف تسليح مختصر: سطر واحد مباشر */
function CompactRebarRow({ label, msg, isWarning }: { label: string; msg: string; isWarning?: boolean }) {
  if (!msg) return null;
  return (
    <div className="py-2 flex flex-col gap-0.5">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className={`font-mono text-xs font-bold ${
        isWarning
          ? 'text-amber-600 bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-100 w-fit'
          : 'text-slate-800'
      }`}>
        {msg}
      </span>
    </div>
  );
}
