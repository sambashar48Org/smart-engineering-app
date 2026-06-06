// ============================================================
// نموذج إدخال بيانات الأساس - الكود العربي السوري 2024
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { NumberInput, SelectInput, Button } from '@/components/ui';
import type { FoundationType, LoadCase } from '@/types';

const FOUNDATION_TYPES: { value: FoundationType; labelAr: string; labelEn: string }[] = [
  { value: 'isolated', labelAr: 'أساس منفرد', labelEn: 'Isolated' },
  { value: 'combined', labelAr: 'أساس متصل', labelEn: 'Combined' },
  { value: 'strap', labelAr: 'أساس لَبّي', labelEn: 'Strap' },
  { value: 'mat', labelAr: 'حصيرة أساسات', labelEn: 'Mat/Raft' },
];

const LOAD_CASES: { value: LoadCase; labelAr: string; labelEn: string; color: string }[] = [
  { value: 1, labelAr: 'أحمال دائمة + حية', labelEn: 'Dead + Live', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 2, labelAr: 'أحمال + رياح', labelEn: 'Loads + Wind', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 3, labelAr: 'أحمال + زلزال', labelEn: 'Loads + Seismic', color: 'bg-red-100 text-red-800 border-red-300' },
];

const CONCRETE_GRADES = [
  { value: 'C20/25', label: 'C20/25' },
  { value: 'C25/30', label: 'C25/30' },
  { value: 'C30/37', label: 'C30/37' },
  { value: 'C35/45', label: 'C35/45' },
  { value: 'C40/50', label: 'C40/50' },
];

const STEEL_GRADES = [
  { value: 'B240', label: 'B240' },
  { value: 'B300', label: 'B300' },
  { value: 'B400', label: 'B400' },
  { value: 'B500', label: 'B500' },
  { value: 'B520', label: 'B520' },
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
      </div>

      {/* الأبعاد */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'الأبعاد' : 'Dimensions'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={t('input.width', lang)}
            value={inputs.width}
            onChange={(v) => setInputs({ width: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={t('input.length', lang)}
            value={inputs.length}
            onChange={(v) => setInputs({ length: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={t('input.depth', lang)}
            value={inputs.depth}
            onChange={(v) => setInputs({ depth: v })}
            unit="m"
            min={0.1}
            step={0.1}
          />
          <NumberInput
            label={t('input.thickness', lang)}
            value={inputs.thickness}
            onChange={(v) => setInputs({ thickness: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
        </div>
      </div>

      {/* الأحمال */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {lang === 'ar' ? 'الأحمال التشغيلية' : 'Service Loads'}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={t('input.axialLoad', lang)}
            value={inputs.axialLoad}
            onChange={(v) => setInputs({ axialLoad: v })}
            unit="kN"
            min={0}
            step={10}
          />
          <NumberInput
            label={t('input.momentX', lang)}
            value={inputs.momentX}
            onChange={(v) => setInputs({ momentX: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={t('input.momentY', lang)}
            value={inputs.momentY}
            onChange={(v) => setInputs({ momentY: v })}
            unit="kN.m"
            min={0}
            step={5}
          />
          <NumberInput
            label={t('input.horizontalForce', lang)}
            value={inputs.horizontalForce}
            onChange={(v) => setInputs({ horizontalForce: v })}
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
            label={t('input.bearingCapacity', lang)}
            value={inputs.bearingCapacity}
            onChange={(v) => setInputs({ bearingCapacity: v })}
            unit="kN/m²"
            min={10}
            step={10}
          />
          <NumberInput
            label={t('input.soilDensity', lang)}
            value={inputs.soilDensity}
            onChange={(v) => setInputs({ soilDensity: v })}
            unit="kN/m³"
            min={10}
            step={1}
          />
          <NumberInput
            label={lang === 'ar' ? 'تماسك التربة cw' : 'Soil Cohesion cw'}
            value={inputs.cohesion}
            onChange={(v) => setInputs({ cohesion: v })}
            unit="kN/m²"
            min={0}
            step={5}
          />
          <NumberInput
            label={lang === 'ar' ? 'زاوية الاحتكاك δ' : 'Friction Angle δ'}
            value={inputs.deltaFriction}
            onChange={(v) => setInputs({ deltaFriction: v })}
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
            label={t('input.concreteGrade', lang)}
            value={inputs.concreteGrade}
            onChange={(v) => setInputs({ concreteGrade: v })}
            options={CONCRETE_GRADES}
          />
          <SelectInput
            label={t('input.steelGrade', lang)}
            value={inputs.steelGrade}
            onChange={(v) => setInputs({ steelGrade: v })}
            options={STEEL_GRADES}
          />
          <NumberInput
            label={t('input.cover', lang)}
            value={inputs.cover}
            onChange={(v) => setInputs({ cover: v })}
            unit="mm"
            min={20}
            step={5}
          />
          <SelectInput
            label={lang === 'ar' ? 'قطر السيخ' : 'Bar Diameter'}
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
            label={t('input.columnWidth', lang)}
            value={inputs.columnWidth}
            onChange={(v) => setInputs({ columnWidth: v })}
            unit="m"
            min={0.1}
            step={0.05}
          />
          <NumberInput
            label={t('input.columnDepth', lang)}
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
              {lang === 'ar' ? 'عمود معدني' : 'Steel Column'}
            </span>
          </label>
        </div>

        {/* أبعاد الصفيحة المعدنية */}
        {inputs.isSteelColumn && (
          <div className="grid grid-cols-2 gap-3 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <NumberInput
              label={lang === 'ar' ? 'عرض الصفيحة' : 'Base Plate Width'}
              value={inputs.basePlateWidth}
              onChange={(v) => setInputs({ basePlateWidth: v })}
              unit="m"
              min={0.1}
              step={0.05}
            />
            <NumberInput
              label={lang === 'ar' ? 'عمق الصفيحة' : 'Base Plate Depth'}
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
