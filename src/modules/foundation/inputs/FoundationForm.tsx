// ============================================================
// نموذج إدخال بيانات الأساس - الكود العربي السوري 2024
// الرموز الكودية: V, t, D_f, q, c_w, δ, f'_c, f_y, b, h, c, Φ
// واجهة رشيقة: العناوين مختصرة والوحدات داخل الحقول
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { NumberInput, SelectInput, Button } from '@/components/ui';
import type { FoundationType, LoadCase } from '@/types';

const FOUNDATION_TYPES: { value: FoundationType; labelAr: string; labelEn: string }[] = [
  { value: 'isolated', labelAr: 'منفردة', labelEn: 'Isolated' },
  { value: 'continuous', labelAr: 'مستمرة', labelEn: 'Strip' },
  { value: 'combined', labelAr: 'مشتركة', labelEn: 'Combined' },
  { value: 'mat', labelAr: 'حصيرة عامة', labelEn: 'Mat/Raft' },
];

const LOAD_CASES: { value: LoadCase; labelAr: string; labelEn: string; color: string }[] = [
  { value: 1, labelAr: 'دائمة + حية', labelEn: 'Dead + Live', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 2, labelAr: '+ رياح', labelEn: '+ Wind', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 3, labelAr: '+ زلزال', labelEn: '+ Seismic', color: 'bg-red-100 text-red-800 border-red-300' },
];

const CONCRETE_GRADES = [
  { value: 'C20/25', label: "f'c=20" },
  { value: 'C25/30', label: "f'c=25" },
  { value: 'C30/37', label: "f'c=30" },
  { value: 'C35/45', label: "f'c=35" },
  { value: 'C40/50', label: "f'c=40" },
];

const STEEL_GRADES = [
  { value: 'B240', label: 'fy=240' },
  { value: 'B300', label: 'fy=300' },
  { value: 'B400', label: 'fy=400' },
  { value: 'B500', label: 'fy=500' },
  { value: 'B520', label: 'fy=520' },
];

const BAR_DIAMETERS = [
  { value: '12', label: 'Φ12' },
  { value: '14', label: 'Φ14' },
  { value: '16', label: 'Φ16' },
  { value: '18', label: 'Φ18' },
  { value: '20', label: 'Φ20' },
  { value: '22', label: 'Φ22' },
  { value: '25', label: 'Φ25' },
];

export default function FoundationForm() {
  const { lang } = useAppStore();
  const { inputs, setInputs, resetInputs } = useFoundationStore();

  const isCombined = inputs.type === 'combined';
  const isContinuous = inputs.type === 'continuous';
  const isRaft = inputs.type === 'mat';

  // تحقق تداخل الأعمدة (مشترك)
  const isColumnOverlapping = isCombined &&
    (inputs.L_span || 0) < (((inputs.columnDepth || 0) + (inputs.c_depth2 || 0)) / 2);

  // تحقق السماكة الدنيا
  const isThicknessTooLow = (isRaft || isCombined) && inputs.t < 0.30;

  return (
    <div className="space-y-4">
      {/* نوع الأساس */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-600">
          {lang === 'ar' ? 'نوع الأساس' : 'Foundation Type'}
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {FOUNDATION_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setInputs({ type: ft.value })}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                inputs.type === ft.value
                  ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {lang === 'ar' ? ft.labelAr : ft.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* حالة التحميل الكودية */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-600">
          {lang === 'ar' ? 'حالة التحميل' : 'Load Case'}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {LOAD_CASES.map((lc) => (
            <button
              key={lc.value}
              onClick={() => setInputs({ loadCase: lc.value })}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                inputs.loadCase === lc.value
                  ? lc.color + ' border-current shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {lang === 'ar' ? lc.labelAr : lc.labelEn}
            </button>
          ))}
        </div>
        {/* تنبيه تراكيب الأحمال الديناميكية */}
        {(inputs.loadCase === 2 || inputs.loadCase === 3) && (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-300">
            <p className="text-xs font-semibold text-amber-700 leading-relaxed">
              {lang === 'ar'
                ? '⚠ أدخل M_x, M_y, H لصحة توزيع σ₁ و σ₂'
                : '⚠ Enter M_x, M_y, H for correct σ₁ and σ₂ distribution'}
            </p>
          </div>
        )}
      </div>

      {/* الأبعاد */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'الأبعاد' : 'Dimensions'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'العرض B' : 'Width B'}
            value={inputs.B}
            onChange={(v) => setInputs({ B: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'الطول L' : 'Length L'}
            value={inputs.L}
            onChange={(v) => setInputs({ L: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'منسوب التأسيس D_f' : 'Founding Depth D_f'}
            value={inputs.D_f}
            onChange={(v) => setInputs({ D_f: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'سماكة الأساس t' : 'Thickness t'}
            value={inputs.t}
            onChange={(v) => setInputs({ t: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
        </div>
      </div>

      {/* الأحمال */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'الأحمال التشغيلية' : 'Service Loads'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar'
              ? (isContinuous ? 'حمولات المتر الطولي V' : 'الحمولة الشاقولية V')
              : (isContinuous ? 'Load per Meter V' : 'Vertical Load V')}
            value={inputs.V}
            onChange={(v) => setInputs({ V: v })}
            unit="kN"
            min={0}
            step={10}
          />
          <NumberInput
            label={lang === 'ar' ? 'العزم M_x' : 'Moment M_x'}
            value={inputs.M_x}
            onChange={(v) => setInputs({ M_x: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'العزم M_y' : 'Moment M_y'}
            value={inputs.M_y}
            onChange={(v) => setInputs({ M_y: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'القوة الأفقية H' : 'Horizontal Force H'}
            value={inputs.H}
            onChange={(v) => setInputs({ H: v })}
            unit="kN"
            min={0}
            step={5}
          />
        </div>

        {/* بيانات العمود الثاني (مشترك) */}
        {isCombined && (
          <div className="space-y-2 p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              {lang === 'ar' ? 'بيانات العمود الثاني' : 'Second Column Data'}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label={lang === 'ar' ? 'حمولة العمود 2 V₂' : 'Column 2 Load V₂'}
                value={inputs.V2 || 350}
                onChange={(v) => setInputs({ V2: v })}
                unit="kN"
                min={0}
                step={10}
              />
              <NumberInput
                label={lang === 'ar' ? 'المسافة المحورية L_span' : 'Span L_span'}
                value={inputs.L_span || 4.5}
                onChange={(v) => setInputs({ L_span: v })}
                unit="m"
                min={1.0}
                step={0.5}
              />
              <NumberInput
                label={lang === 'ar' ? 'عرض العمود 2 b₂' : 'Col 2 Width b₂'}
                value={inputs.c_width2 || 0.4}
                onChange={(v) => setInputs({ c_width2: v })}
                unit="m"
                min={0.1}
                step={0.05}
              />
              <NumberInput
                label={lang === 'ar' ? 'عمق العمود 2 h₂' : 'Col 2 Depth h₂'}
                value={inputs.c_depth2 || 0.4}
                onChange={(v) => setInputs({ c_depth2: v })}
                unit="m"
                min={0.1}
                step={0.05}
              />
            </div>
          </div>
        )}
      </div>

      {/* جائز التقويم (مشترك/مستمر) */}
      {(isCombined || isContinuous) && (
        <div className="space-y-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            {lang === 'ar' ? 'جائز التقويم' : 'Strap Beam'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label={lang === 'ar' ? 'عرض الجائز' : 'Beam Width'}
              value={inputs.strapWidth || 0.3}
              onChange={(v) => setInputs({ strapWidth: v })}
              unit="m"
              min={0.2}
              step={0.05}
            />
            <NumberInput
              label={lang === 'ar' ? 'ارتفاع الجائز' : 'Beam Height'}
              value={inputs.strapHeight || 0.5}
              onChange={(v) => setInputs({ strapHeight: v })}
              unit="m"
              min={0.3}
              step={0.05}
            />
          </div>
        </div>
      )}

      {/* تحذيرات التحقق */}
      {isColumnOverlapping && (
        <div className="p-2.5 my-2 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-md">
          ⚠️ <b>خطأ هندسي:</b> المسافة المحورية بين العمودين ({inputs.L_span}m) أقل من أبعاد الأعمدة نفسها، يرجى مراجعة تباعد المحاور.
        </div>
      )}

      {isThicknessTooLow && (
        <div className="p-2.5 my-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-md">
          ⚠️ <b>تنبيه كودي:</b> سماكة بلاطة الأساس ({inputs.t}m) تقل عن الحد الأدنى الموصى به (0.30m) للحصائر والأساسات المشتركة.
        </div>
      )}

      {/* التربة */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'خصائص التربة' : 'Soil Properties'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'إجهاد التربة المسموح q' : 'Allowable Bearing q'}
            value={inputs.q_allowable}
            onChange={(v) => setInputs({ q_allowable: v })}
            unit="kN/m²"
            min={10}
            step={10}
          />
          <NumberInput
            label={lang === 'ar' ? 'كثافة التربة γ' : 'Soil Density γ'}
            value={inputs.soilDensity}
            onChange={(v) => setInputs({ soilDensity: v })}
            unit="kN/m³"
            min={10}
            step={1}
          />
          <NumberInput
            label={lang === 'ar' ? 'إجهاد التماسك c_w' : 'Cohesion c_w'}
            value={inputs.c_w}
            onChange={(v) => setInputs({ c_w: v })}
            unit="kN/m²"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'زاوية احتكاك التربة δ' : 'Soil Friction Angle δ'}
            value={inputs.delta_friction}
            onChange={(v) => setInputs({ delta_friction: v })}
            unit="°"
            min={0}
            step={5}
          />
        </div>
      </div>

      {/* المواد */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'المواد' : 'Materials'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <SelectInput
            label={lang === 'ar' ? "المقاومة الأسطوانية f'_c" : "Concrete f'_c"}
            value={inputs.concreteGrade}
            onChange={(v) => setInputs({ concreteGrade: v })}
            options={CONCRETE_GRADES}
          />
          <SelectInput
            label={lang === 'ar' ? 'إجهاد الخضوع f_y' : 'Yield Strength f_y'}
            value={inputs.steelGrade}
            onChange={(v) => setInputs({ steelGrade: v })}
            options={STEEL_GRADES}
          />
          <div className="space-y-1">
            <NumberInput
              label={lang === 'ar' ? 'سماكة التغطية c' : 'Cover c'}
              value={inputs.cover}
              onChange={(v) => setInputs({ cover: v })}
              unit="mm"
              min={20}
              step={5}
            />
            {inputs.cover < 50 && (
              <div className="flex items-center gap-1 p-1 bg-red-50 rounded border border-red-200">
                <span className="text-xs font-semibold text-red-600">
                  {lang === 'ar' ? '⚠ الغطاء < 50mm!' : '⚠ Cover < 50mm!'}
                </span>
              </div>
            )}
          </div>
          <SelectInput
            label={lang === 'ar' ? 'قطر السيخ Φ' : 'Bar Diameter Φ'}
            value={String(inputs.barDiameterChosen)}
            onChange={(v) => setInputs({ barDiameterChosen: parseInt(v) })}
            options={BAR_DIAMETERS}
          />
        </div>
      </div>

      {/* العمود */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'العمود' : 'Column'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'عرض العمود b' : 'Column Width b'}
            value={inputs.columnWidth}
            onChange={(v) => setInputs({ columnWidth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
          <NumberInput
            label={lang === 'ar' ? 'عمق العمود h' : 'Column Depth h'}
            value={inputs.columnDepth}
            onChange={(v) => setInputs({ columnDepth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
        </div>

        {/* نوع العمود */}
        <div className="flex items-center gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.isSteelColumn}
              onChange={(e) => setInputs({ isSteelColumn: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-xs text-gray-700 font-medium">
              {lang === 'ar' ? 'عمود معدني + صفيحة ارتكاز' : 'Steel Column + Base Plate'}
            </span>
          </label>
        </div>

        {/* أبعاد الصفيحة المعدنية */}
        {inputs.isSteelColumn && (
          <div className="grid grid-cols-2 gap-2 mt-1 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <NumberInput
              label={lang === 'ar' ? 'عرض الصفيحة' : 'Plate Width'}
              value={inputs.basePlateWidth}
              onChange={(v) => setInputs({ basePlateWidth: v })}
              unit="m"
              min={0.1}
              step={0.05}
            />
            <NumberInput
              label={lang === 'ar' ? 'عمق الصفيحة' : 'Plate Depth'}
              value={inputs.basePlateDepth}
              onChange={(v) => setInputs({ basePlateDepth: v })}
              unit="m"
              min={0.1}
              step={0.05}
            />
          </div>
        )}
      </div>

      {/* معامل β */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">
          {lang === 'ar' ? 'معاملات' : 'Factors'}
        </h4>
        <NumberInput
          label={lang === 'ar' ? 'معامل β للقص الثاقب' : 'Punching Shear β'}
          value={inputs.betaEccentricity}
          onChange={(v) => setInputs({ betaEccentricity: v })}
          unit=""
          min={1.0}
          step={0.05}
        />
      </div>

      {/* حقل خاص بالحصيرة */}
      {inputs.type === 'mat' && (
        <div className="space-y-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">
            {lang === 'ar' ? 'بيانات الحصيرة' : 'Raft Data'}
          </h4>
          <NumberInput
            label={lang === 'ar' ? 'أكبر مسافة بين أعمدة' : 'Max Column Spacing'}
            value={inputs.maxColumnSpacing}
            onChange={(v) => setInputs({ maxColumnSpacing: v })}
            unit="m"
            min={1.0}
            step={0.5}
          />
          <p className="text-xs text-purple-600">
            {lang === 'ar'
              ? 'تحقق الجساءة: t ≥ (المسافة / 8) [بند 11]'
              : 'Stiffness check: t ≥ (spacing / 8) [Clause 11]'}
          </p>
        </div>
      )}

      {/* أزرار */}
      <div className="pt-2 border-t border-gray-100">
        <Button
          variant="secondary"
          size="sm"
          onClick={resetInputs}
          className="w-full"
        >
          {t('btn.reset', lang)}
        </Button>
      </div>
    </div>
  );
}
