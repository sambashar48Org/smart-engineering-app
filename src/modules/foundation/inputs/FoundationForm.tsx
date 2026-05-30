// ============================================================
// نموذج إدخال بيانات الأساس
// ============================================================

import React from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { NumberInput, SelectInput, Button } from '@/components/ui';
import type { FoundationType } from '@/types';

const FOUNDATION_TYPES: { value: FoundationType; labelAr: string; labelEn: string }[] = [
  { value: 'isolated', labelAr: 'أساس منفرد', labelEn: 'Isolated' },
  { value: 'combined', labelAr: 'أساس متصل', labelEn: 'Combined' },
  { value: 'strap', labelAr: 'أساس لَبّي', labelEn: 'Strap' },
  { value: 'mat', labelAr: 'حصيرة أساسات', labelEn: 'Mat/Raft' },
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
          {lang === 'ar' ? 'الأحمال' : 'Loads'}
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
          {lang === 'ar' ? 'التربة' : 'Soil'}
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
