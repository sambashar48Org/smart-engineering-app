// ============================================================
// نموذج إدخال بيانات الأساس - الكود العربي السوري 2024
// الرموز الكودية: V, t, D_f, q_allowable, c_w, δ, f'_c, f_y
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { NumberInput, SelectInput, Button } from '@/components/ui';
import type { FoundationType, LoadCase } from '@/types';

const FOUNDATION_TYPES: { value: FoundationType; labelAr: string; labelEn: string }[] = [
  { value: 'isolated', labelAr: 'أساس منفرد', labelEn: 'Isolated' },
  { value: 'continuous', labelAr: 'أساس مستمر', labelEn: 'Continuous/Strip' },
  { value: 'combined', labelAr: 'أساس مشترك', labelEn: 'Combined' },
  { value: 'mat', labelAr: 'حصيرة عامة', labelEn: 'Mat/Raft' },
];

const LOAD_CASES: { value: LoadCase; labelAr: string; labelEn: string; color: string }[] = [
  { value: 1, labelAr: 'أحمال دائمة + حية', labelEn: 'Dead + Live', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 2, labelAr: 'أحمال + رياح', labelEn: 'Loads + Wind', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 3, labelAr: 'أحمال + زلزال', labelEn: 'Loads + Seismic', color: 'bg-red-100 text-red-800 border-red-300' },
];

const CONCRETE_GRADES = [
  { value: 'C20/25', label: 'C20/25 (f\'c=20)' },
  { value: 'C25/30', label: 'C25/30 (f\'c=25)' },
  { value: 'C30/37', label: 'C30/37 (f\'c=30)' },
  { value: 'C35/45', label: 'C35/45 (f\'c=35)' },
  { value: 'C40/50', label: 'C40/50 (f\'c=40)' },
];

const STEEL_GRADES = [
  { value: 'B240', label: 'B240 (fy=240)' },
  { value: 'B300', label: 'B300 (fy=300)' },
  { value: 'B400', label: 'B400 (fy=400)' },
  { value: 'B500', label: 'B500 (fy=500)' },
  { value: 'B520', label: 'B520 (fy=520)' },
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

  return (
    <div className="space-y-5">
      {/* نوع الأساس */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {lang === 'ar' ? 'نوع الأساس' : 'Foundation Type'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {FOUNDATION_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => setInputs({ type: ft.value })}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all duration-200 cursor-pointer ${
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
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {lang === 'ar' ? 'حالة التحميل (كود سوري)' : 'Load Case (Syrian Code)'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LOAD_CASES.map((lc) => (
            <button
              key={lc.value}
              onClick={() => setInputs({ loadCase: lc.value })}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border-2 transition-all duration-200 cursor-pointer ${
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
                ? '⚠ يجب إدخال قيم العزوم (M_x, M_y) والقوى الأفقية (H) المصاحبة لحالة التحميل الديناميكية لضمان صحة توزيع الإجهادات σ₁ و σ₂'
                : '⚠ You must enter moments (M_x, M_y) and horizontal forces (H) for this dynamic load case to ensure correct stress distribution σ₁ and σ₂'}
            </p>
          </div>
        )}
      </div>

      {/* الأبعاد */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'الأبعاد' : 'Dimensions'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={lang === 'ar' ? 'العرض B (m)' : 'Width B (m)'}
            value={inputs.B}
            onChange={(v) => setInputs({ B: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'الطول L (m)' : 'Length L (m)'}
            value={inputs.L}
            onChange={(v) => setInputs({ L: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'منسوب التأسيس D_f (m)' : 'Founding Depth D_f (m)'}
            value={inputs.D_f}
            onChange={(v) => setInputs({ D_f: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={lang === 'ar' ? 'سمك بلاطة الأساس t (m)' : 'Slab Thickness t (m)'}
            value={inputs.t}
            onChange={(v) => setInputs({ t: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
        </div>
      </div>

      {/* الأحمال التشغيلية المؤثرة (Service Loads) */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'الأحمال التشغيلية المؤثرة (Service Loads)' : 'Service Loads'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={lang === 'ar' ? 'الحمولة الشاقولية الكلية V (kN)' : 'Total Vertical Load V (kN)'}
            value={inputs.V}
            onChange={(v) => setInputs({ V: v })}
            unit="kN"
            min={0}
            step={10}
          />
          <NumberInput
            label={lang === 'ar' ? 'العزم المركزي M_x (kN.m)' : 'Moment M_x (kN.m)'}
            value={inputs.M_x}
            onChange={(v) => setInputs({ M_x: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'العزم المركزي M_y (kN.m)' : 'Moment M_y (kN.m)'}
            value={inputs.M_y}
            onChange={(v) => setInputs({ M_y: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'القوة الأفقية H (kN)' : 'Horizontal Force H (kN)'}
            value={inputs.H}
            onChange={(v) => setInputs({ H: v })}
            unit="kN"
            min={0}
            step={5}
          />
        </div>
      </div>

      {/* التربة */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'خصائص التربة' : 'Soil Properties'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={lang === 'ar' ? 'إجهاد التحميل المسموح به للتربة q (kN/m²)' : 'Allowable Bearing q (kN/m²)'}
            value={inputs.q_allowable}
            onChange={(v) => setInputs({ q_allowable: v })}
            unit="kN/m²"
            min={10}
            step={10}
          />
          <NumberInput
            label={lang === 'ar' ? 'كثافة التربة γ (kN/m³)' : 'Soil Density γ (kN/m³)'}
            value={inputs.soilDensity}
            onChange={(v) => setInputs({ soilDensity: v })}
            unit="kN/m³"
            min={10}
            step={1}
          />
          <NumberInput
            label={lang === 'ar' ? 'إجهاد التماسك c_w (kN/m²)' : 'Cohesion c_w (kN/m²)'}
            value={inputs.c_w}
            onChange={(v) => setInputs({ c_w: v })}
            unit="kN/m²"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'زاوية الاحتكاك بين الأساس والتربة δ (°)' : 'Friction Angle δ (°)'}
            value={inputs.delta_friction}
            onChange={(v) => setInputs({ delta_friction: v })}
            unit="°"
            min={0}
            step={5}
          />
        </div>
      </div>

      {/* المواد */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'المواد' : 'Materials'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label={lang === 'ar' ? 'فئة الخرسانة (المقاومة الأسطوانية f\'_c)' : 'Concrete Grade (f\'_c)'}
            value={inputs.concreteGrade}
            onChange={(v) => setInputs({ concreteGrade: v })}
            options={CONCRETE_GRADES}
          />
          <SelectInput
            label={lang === 'ar' ? 'فئة الحديد (إجهاد الخضوع f_y)' : 'Steel Grade (f_y)'}
            value={inputs.steelGrade}
            onChange={(v) => setInputs({ steelGrade: v })}
            options={STEEL_GRADES}
          />
          <div className="space-y-1">
            <NumberInput
              label={lang === 'ar' ? 'سمك طبقة التغطية الخرسانية (mm)' : 'Concrete Cover (mm)'}
              value={inputs.cover}
              onChange={(v) => setInputs({ cover: v })}
              unit="mm"
              min={20}
              step={5}
            />
            {/* تنبيه الغطاء الخرساني */}
            {inputs.cover < 50 && (
              <div className="flex items-center gap-1 p-1.5 bg-red-50 rounded border border-red-200">
                <span className="text-xs font-semibold text-red-600">
                  {lang === 'ar' ? '⚠ الغطاء أقل من 50mm الموصى به للأساسات!' : '⚠ Cover less than 50mm recommended for foundations!'}
                </span>
              </div>
            )}
          </div>
          <SelectInput
            label={lang === 'ar' ? 'قطر السيخ (لا يقل عن 12mm)' : 'Bar Diameter (min 12mm)'}
            value={String(inputs.barDiameterChosen)}
            onChange={(v) => setInputs({ barDiameterChosen: parseInt(v) })}
            options={BAR_DIAMETERS}
          />
        </div>
      </div>

      {/* العمود */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'أبعاد العمود' : 'Column Dimensions'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={lang === 'ar' ? 'عرض العمود (m)' : 'Column Width (m)'}
            value={inputs.columnWidth}
            onChange={(v) => setInputs({ columnWidth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
          <NumberInput
            label={lang === 'ar' ? 'عمق العمود (m)' : 'Column Depth (m)'}
            value={inputs.columnDepth}
            onChange={(v) => setInputs({ columnDepth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
        </div>

        {/* نوع العمود */}
        <div className="flex items-center gap-3 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inputs.isSteelColumn}
              onChange={(e) => setInputs({ isSteelColumn: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              {lang === 'ar' ? 'عمود معدني مع صفيحة ارتكاز' : 'Steel Column with Base Plate'}
            </span>
          </label>
        </div>

        {/* أبعاد الصفيحة المعدنية */}
        {inputs.isSteelColumn && (
          <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <NumberInput
              label={lang === 'ar' ? 'عرض صفيحة الارتكاز (m)' : 'Base Plate Width (m)'}
              value={inputs.basePlateWidth}
              onChange={(v) => setInputs({ basePlateWidth: v })}
              unit="m"
              min={0.1}
              step={0.05}
            />
            <NumberInput
              label={lang === 'ar' ? 'عمق صفيحة الارتكاز (m)' : 'Base Plate Depth (m)'}
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
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'معاملات إضافية' : 'Additional Factors'}
        </h4>
        <NumberInput
          label={lang === 'ar' ? 'معامل β للقص الثاقب' : 'Punching Shear β Factor'}
          value={inputs.betaEccentricity}
          onChange={(v) => setInputs({ betaEccentricity: v })}
          unit=""
          min={1.0}
          step={0.05}
        />
      </div>

      {/* حقل خاص بالحصيرة: أكبر مسافة بين أعمدة */}
      {inputs.type === 'mat' && (
        <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            {lang === 'ar' ? 'بيانات الحصيرة العامة' : 'Raft-Specific Data'}
          </h4>
          <NumberInput
            label={lang === 'ar' ? 'أكبر مسافة بين عمودين متجاورين (m)' : 'Max Column Spacing (m)'}
            value={inputs.maxColumnSpacing}
            onChange={(v) => setInputs({ maxColumnSpacing: v })}
            unit="m"
            min={1.0}
            step={0.5}
          />
          <p className="text-xs text-purple-600">
            {lang === 'ar'
              ? 'يُستخدم لتحقق جساءة الحصيرة: t ≥ (أكبر مسافة / 8) [بند 11]'
              : 'Used for raft stiffness check: t ≥ (max spacing / 8) [Clause 11]'}
          </p>
        </div>
      )}

      {/* أزرار */}
      <div className="pt-3 border-t border-gray-100">
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
