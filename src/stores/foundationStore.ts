// ============================================================
// مخزن بيانات الأساسات - الكود العربي السوري 2024
// الرموز الكودية: V, t, D_f, σ₁, σ₂, q_magnified, c_w, δ, f'_c, f_y
// المنطق الذكي: منفرد/مستمر = بدون تسليح علوي، حصيرة = شبكتان كاملتان
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoundationType, CheckResult, LoadCase } from '@/types';

/** مدخلات الأساس - الرموز الكودية السورية */
export interface FoundationInputs {
  // الأبعاد
  type: FoundationType;
  B: number;             // عرض الأساس (m)
  L: number;             // طول الأساس (m)
  D_f: number;           // منسوب التأسيس أو العمق (m)
  t: number;             // سمك بلاطة الأساس (m)

  // الأحمال التشغيلية المؤثرة (Service Loads)
  V: number;             // الحمولة الشاقولية الكلية المؤثرة (kN)
  M_x: number;           // العزم المركزي حول X (kN.m)
  M_y: number;           // العزم المركزي حول Y (kN.m)
  H: number;             // القوة الأفقية المنقولة من المنشأة (kN)

  // حالة التحميل الكودية السورية
  loadCase: LoadCase;    // 1=دائمة، 2=رياح، 3=زلزال

  // التربة
  q_allowable: number;   // إجهاد التحميل المسموح به للتربة (kN/m²)
  soilDensity: number;   // كثافة التربة γ (kN/m³)
  c_w: number;           // إجهاد التماسك بين التربة والأساس (kN/m²)
  delta_friction: number;// زاوية الاحتكاك بين الأساس والتربة (درجة)
  E_passive: number;     // دفع التربة المنفعل (kN)
  E_active: number;      // دفع التربة الفعال (kN)
  U_uplift: number;      // قوة دفع الماء (kN)

  // المواد
  concreteGrade: string; // فئة الخرسانة (المقاومة الأسطوانية الإنشائية f'_c)
  steelGrade: string;    // فئة الحديد (إجهاد الخضوع f_y)
  cover: number;         // سمك طبقة التغطية الخرسانية (mm)

  // العمود
  columnWidth: number;   // عرض العمود (m)
  columnDepth: number;   // عمق العمود (m)
  isSteelColumn: boolean;// هل العمود معدني؟
  basePlateWidth: number;// عرض الصفيحة المعدنية (m)
  basePlateDepth: number;// عمق الصفيحة المعدنية (m)

  // التسليح
  barDiameterChosen: number; // القطر المختار (mm) - لا يقل عن 12mm

  // معامل β
  betaEccentricity: number; // معامل تصعيد اللامركزية

  // حصيرة عامة فقط
  maxColumnSpacing: number; // أكبر مسافة بين عمودين متجاورين (m) - لشرط الجساءة
}

/** نتائج حسابات الأساس - الرموز الكودية السورية */
export interface FoundationResults {
  // إجهاد التربة (SLS)
  sigma_1: number;              // الإجهاد الأكبر عند حواف الأساس (kN/m²)
  sigma_2: number;              // الإجهاد الأصغر عند حواف الأساس (kN/m²)
  q_magnified: number;          // إجهاد التحميل المسموح المكبر (kN/m²)
  hasTension: boolean;          // هل يوجد شد (انفصال جزئي)؟
  bearingSafe: boolean;         // هل إجهاد التربة آمن؟
  bearingVerificationRatio: number; // نسبة التحقق من إجهاد التربة (%)
  e_L: number;                  // اللامركزية باتجاه L (m)
  e_B: number;                  // اللامركزية باتجاه B (m)
  compressedLength: number;     // طول المنطقة المضغوطة (m)

  // الاستقرار (SLS)
  overturningSafe: boolean;
  slidingSafe: boolean;
  buoyancySafe: boolean;
  fs_overturning: number;
  fs_sliding: number;
  fs_buoyancy: number;

  // القص (ULS)
  oneWayShearSafe: boolean;
  punchingShearSafe: boolean;
  v_max_one_way: number;
  v_concrete_one_way: number;
  v_max_punching: number;
  v_concrete_punching: number;

  // الانحناء والتسليح (ULS)
  M_u: number;
  bottomRebarX: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  bottomRebarY: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  topRebarX: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };
  topRebarY: { diameter: number; spacing: number; count: number; areaProvided: number; areaRequired: number };

  // هل التسليح العلوي مطلوب؟ (منفرد/مستمر = لا، حصيرة/مشترك = نعم)
  topRebarRequired: boolean;
  topRebarMessage: string;

  // تحقق جساءة الحصيرة [بند 11]
  raftStiffnessCheck?: {
    isRigid: boolean;
    minThickness: number;    // الحد الأدنى للسمك (m)
    actualThickness: number; // السمك الفعلي (m)
    message: string;
  };

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

const NO_REBAR = { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 };

const defaultInputs: FoundationInputs = {
  type: 'isolated',
  B: 2.5,
  L: 3.0,
  D_f: 0.6,
  t: 0.4,
  V: 450,
  M_x: 30,
  M_y: 15,
  H: 25,
  loadCase: 1,
  q_allowable: 250,
  soilDensity: 18,
  c_w: 15,
  delta_friction: 25,
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
  maxColumnSpacing: 5.0,
};

const defaultResults: FoundationResults = {
  sigma_1: 0,
  sigma_2: 0,
  q_magnified: 0,
  hasTension: false,
  bearingSafe: false,
  bearingVerificationRatio: 0,
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
  bottomRebarX: { ...NO_REBAR },
  bottomRebarY: { ...NO_REBAR },
  topRebarX: { ...NO_REBAR },
  topRebarY: { ...NO_REBAR },
  topRebarRequired: false,
  topRebarMessage: '',
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
      name: 'smart-engineering-foundation-v4',
    }
  )
);
