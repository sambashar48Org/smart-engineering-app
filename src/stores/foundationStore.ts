// ============================================================
// مخزن بيانات الأساسات - الكود العربي السوري 2024
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoundationType, CheckResult, LoadCase } from '@/types';

/** مدخلات الأساس */
export interface FoundationInputs {
  // الأبعاد
  type: FoundationType;
  width: number;       // B (m)
  length: number;      // L (m)
  depth: number;       // D (m)
  thickness: number;   // h (m) - سماكة اللبشة

  // الأحمال التشغيلية (Service)
  axialLoad: number;   // N (kN) - الحمل الشاقولي التشغيلي
  momentX: number;     // Mx (kN.m)
  momentY: number;     // My (kN.m)
  horizontalForce: number; // H (kN)

  // حالة التحميل الكودية السورية
  loadCase: LoadCase;  // 1=دائمة، 2=رياح، 3=زلزال

  // التربة
  bearingCapacity: number; // q_all (kN/m²) - إجهاد التربة المسموح الاستاتيكي
  soilDensity: number;     // γ (kN/m³)
  cohesion: number;        // cw (kN/m²) - تماسك التربة
  deltaFriction: number;   // زاوية الاحتكاك (درجة)
  E_passive: number;       // دفع التربة المنفعل (kN)
  E_active: number;        // دفع التربة الفعال (kN)
  U_uplift: number;        // قوة دفع الماء (kN)

  // المواد
  concreteGrade: string;   // e.g. 'C25/30'
  steelGrade: string;      // e.g. 'B400'
  cover: number;           // الغطاء الخرساني (mm)

  // العمود
  columnWidth: number;     // (m)
  columnDepth: number;     // (m)
  isSteelColumn: boolean;  // هل العمود معدني؟
  basePlateWidth: number;  // عرض الصفيحة المعدنية (m)
  basePlateDepth: number;  // عمق الصفيحة المعدنية (m)

  // التسليح
  barDiameterChosen: number; // القطر المختار (mm)

  // معامل β
  betaEccentricity: number; // معامل تصعيد اللامركزية
}

/** نتائج حسابات الأساس - الكود السوري */
export interface FoundationResults {
  // إجهاد التربة
  maxStress: number;           // q_max (kN/m²)
  minStress: number;           // q_min (kN/m²)
  allowableModified: number;   // q_allowable_modified (kN/m²)
  hasTension: boolean;         // هل يوجد شد؟
  bearingSafe: boolean;        // هل إجهاد التربة آمن؟
  investmentRatio: number;     // نسبة الاستثمار (%)
  e_L: number;                 // اللامركزية باتجاه L (m)
  e_B: number;                 // اللامركزية باتجاه B (m)
  compressedLength: number;    // طول المنطقة المضغوطة (m)

  // الاستقرار
  overturningSafe: boolean;
  slidingSafe: boolean;
  buoyancySafe: boolean;
  fs_overturning: number;
  fs_sliding: number;
  fs_buoyancy: number;

  // القص
  oneWayShearSafe: boolean;
  punchingShearSafe: boolean;
  v_max_one_way: number;
  v_concrete_one_way: number;
  v_max_punching: number;
  v_concrete_punching: number;

  // الانحناء والتسليح
  M_u: number;                 // العزم المصعد (kN.m)
  bottomRebarX: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  bottomRebarY: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  topRebarX: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  topRebarY: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };

  // التحققات الموحدة
  checks: CheckResult[];

  // رسائل الحالة
  bearingMessage: string;
  flexureMessage: string;

  calculated: boolean;
}

interface FoundationState {
  inputs: FoundationInputs;
  results: FoundationResults;

  setInputs: (inputs: Partial<FoundationInputs>) => void;
  setResults: (results: FoundationResults) => void;
  resetInputs: () => void;
  resetAll: () => void;
}

const defaultInputs: FoundationInputs = {
  type: 'isolated',
  width: 2.5,
  length: 3.0,
  depth: 0.6,
  thickness: 0.4,
  axialLoad: 450,
  momentX: 30,
  momentY: 15,
  horizontalForce: 25,
  loadCase: 1,
  bearingCapacity: 250,
  soilDensity: 18,
  cohesion: 15,
  deltaFriction: 25,
  E_passive: 0,
  E_active: 0,
  U_uplift: 0,
  concreteGrade: 'C25/30',
  steelGrade: 'B400',
  cover: 50,
  columnWidth: 0.4,
  columnDepth: 0.4,
  isSteelColumn: false,
  basePlateWidth: 0.3,
  basePlateDepth: 0.3,
  barDiameterChosen: 14,
  betaEccentricity: 1.15,
};

const defaultResults: FoundationResults = {
  maxStress: 0,
  minStress: 0,
  allowableModified: 0,
  hasTension: false,
  bearingSafe: false,
  investmentRatio: 0,
  e_L: 0,
  e_B: 0,
  compressedLength: 0,
  overturningSafe: false,
  slidingSafe: false,
  buoyancySafe: false,
  fs_overturning: 0,
  fs_sliding: 0,
  fs_buoyancy: 0,
  oneWayShearSafe: false,
  punchingShearSafe: false,
  v_max_one_way: 0,
  v_concrete_one_way: 0,
  v_max_punching: 0,
  v_concrete_punching: 0,
  M_u: 0,
  bottomRebarX: { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 },
  bottomRebarY: { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 },
  topRebarX: { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 },
  topRebarY: { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 },
  checks: [],
  bearingMessage: '',
  flexureMessage: '',
  calculated: false,
};

export const useFoundationStore = create<FoundationState>()(
  persist(
    (set) => ({
      inputs: { ...defaultInputs },
      results: { ...defaultResults },

      setInputs: (newInputs) =>
        set((state) => ({
          inputs: { ...state.inputs, ...newInputs },
        })),

      setResults: (results) => set({ results }),

      resetInputs: () => set({ inputs: { ...defaultInputs }, results: { ...defaultResults } }),
      resetAll: () => set({ inputs: { ...defaultInputs }, results: { ...defaultResults } }),
    }),
    {
      name: 'smart-engineering-foundation-v2',
    }
  )
);
