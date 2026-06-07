// ============================================================
// نموذج إدخال بيانات الأساس - الكود العربي السوري - ملحق 5
// واجهة هندسية سيادية رشيقة: بدون حشو، بدون تداخل نصوص
// الرموز الكودية المعتمدة: V, M_x, M_y, q, f'_c, f_y, b, h, c, Φ
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { NumberInput, SelectInput } from '@/components/ui';
import type { FoundationType, LoadCase } from '@/types';

const FOUNDATION_TYPES: { value: FoundationType; labelAr: string; labelEn: string }[] = [
  { value: 'isolated', labelAr: 'منفردة', labelEn: 'Isolated' },
  { value: 'continuous', labelAr: 'مستمرة', labelEn: 'Strip' },
  { value: 'combined', labelAr: 'مشتركة', labelEn: 'Combined' },
  { value: 'mat', labelAr: 'حصيرة عامة', labelEn: 'Mat/Raft' },
];

const LOAD_CASES: { value: LoadCase; labelAr: string; labelEn: string }[] = [
  { value: 1, labelAr: 'دائمة + حية', labelEn: 'Dead + Live' },
  { value: 2, labelAr: '+ رياح', labelEn: '+ Wind' },
  { value: 3, labelAr: '+ زلزال', labelEn: '+ Seismic' },
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
  const { inputs, setInputs, resetInputs } = useFoundationStore();
  const { lang } = useAppStore();

  const isRaft = inputs.type === 'mat';
  const isDynamicLoad = inputs.loadCase === 2 || inputs.loadCase === 3;

  return (
    <div className="space-y-4 p-4 bg-slate-50 border-r border-slate-200 h-full overflow-y-auto select-none">
      {/* نوع الأساس وحالة التحميل */}
      <div className="grid grid-cols-2 gap-3">
        <SelectInput
          label={lang === 'ar' ? 'نوع الأساس' : 'Foundation Type'}
          value={inputs.type}
          options={FOUNDATION_TYPES.map(f => ({ value: f.value, label: lang === 'ar' ? f.labelAr : f.labelEn }))}
          onChange={(v) => setInputs({ type: v as FoundationType })}
        />
        <SelectInput
          label={lang === 'ar' ? 'حالة التحميل' : 'Load Case'}
          value={String(inputs.loadCase)}
          options={LOAD_CASES.map(l => ({ value: String(l.value), label: lang === 'ar' ? l.labelAr : l.labelEn }))}
          onChange={(v) => setInputs({ loadCase: Number(v) as LoadCase })}
        />
      </div>

      {/* تنبيه تراكيب الأحمال الديناميكية */}
      {isDynamicLoad && (
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs font-medium leading-relaxed">
          ⚠️ {lang === 'ar'
            ? 'يجب إدخال قيم العزوم والقوى الأفقية المصاحبة لحالة التحميل الديناميكية لضمان صحة توزيع الإجهادات (σ₁, σ₂).'
            : 'Dynamic load selected: Ensure entering combined moments and shear for correct soil pressure calculation.'}
        </div>
      )}

      {/* الحمولات التصميمية */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{lang === 'ar' ? 'الحمولات والأحمال' : 'Design Loads'}</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'القوة الشاقولية V' : 'Vertical Load V'}
            value={inputs.V}
            onChange={(v) => setInputs({ V: v })}
            unit="kN"
            min={0}
            step={10}
          />
          <NumberInput
            label={lang === 'ar' ? 'القوة الأفقية H' : 'Horizontal Force H'}
            value={inputs.H}
            onChange={(v) => setInputs({ H: v })}
            unit="kN"
            min={0}
            step={5}
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
        </div>
      </div>

      {/* أبعاد الخرسانة والتأسيس */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{lang === 'ar' ? 'أبعاد الخرسانة والتأسيس' : 'Geometry & Levels'}</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'عرض الأساس B' : 'Width B'}
            value={inputs.B}
            onChange={(v) => setInputs({ B: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'طول الأساس L' : 'Length L'}
            value={inputs.L}
            onChange={(v) => setInputs({ L: v })}
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
          <NumberInput
            label={lang === 'ar' ? 'منسوب التأسيس D_f' : 'Depth D_f'}
            value={inputs.D_f}
            onChange={(v) => setInputs({ D_f: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
        </div>
      </div>

      {/* خواص التربة */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{lang === 'ar' ? 'معاملات وخواص التربة' : 'Soil Properties'}</h4>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'إجهاد التربة المسموح q' : 'Allowable q'}
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
            label={lang === 'ar' ? 'زاوية احتكاك التربة δ' : 'Friction angle δ'}
            value={inputs.delta_friction}
            onChange={(v) => setInputs({ delta_friction: v })}
            unit="°"
            min={0}
            step={5}
          />
        </div>
      </div>

      {/* المواد والتسليح */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{lang === 'ar' ? 'خصائص المواد والتغطية' : 'Material Properties'}</h4>
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

      {/* أبعاد العمود وعمود حديدي */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b pb-1">
          <h4 className="text-xs font-bold text-slate-700">{lang === 'ar' ? 'بيانات العمود الركيزة' : 'Column Data'}</h4>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.isSteelColumn}
              onChange={(e) => setInputs({ isSteelColumn: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-400 cursor-pointer"
            />
            {lang === 'ar' ? 'عمود معدني' : 'Steel Column'}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label={lang === 'ar' ? 'عرض العمود b' : 'Width b'}
            value={inputs.columnWidth}
            onChange={(v) => setInputs({ columnWidth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
          <NumberInput
            label={lang === 'ar' ? 'عمق العمود h' : 'Depth h'}
            value={inputs.columnDepth}
            onChange={(v) => setInputs({ columnDepth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
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
      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 border-b pb-1">{lang === 'ar' ? 'معاملات' : 'Factors'}</h4>
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
      {isRaft && (
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
          <h4 className="text-xs font-bold text-purple-700">{lang === 'ar' ? 'تحقق الجساءة والصلابة' : 'Stiffness Parameters'}</h4>
          <NumberInput
            label={lang === 'ar' ? 'أكبر مسافة بين عمودين' : 'Max Column Spacing'}
            value={inputs.maxColumnSpacing || 0}
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

      {/* زر إعادة التعيين */}
      <div className="pt-2 border-t border-slate-200">
        <button
          onClick={resetInputs}
          className="w-full px-3 py-2 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          {t('btn.reset', lang)}
        </button>
      </div>
    </div>
  );
}
