// ============================================================
// الأنواع الأساسية المشتركة للتطبيق الهندسي الذكي
// الكود العربي السوري 2024
// ============================================================

/** لغة الواجهة */
export type Lang = 'ar' | 'en';

/** كود التصميم المعتمد */
export type DesignCode = 'syrian-code' | 'aci318' | 'eurocode2';

/** حالة التحقق */
export type CheckStatus = 'pass' | 'warn' | 'fail';

/** نتيجة تحقق واحدة */
export interface CheckResult {
  name: string;
  nameAr: string;
  value: number;
  limit: number;
  ratio: number;
  status: CheckStatus;
  unit: string;
  message?: string;
}

/** خصائص الخرسانة */
export interface ConcreteProps {
  grade: string;
  fc: number; // MPa
  Ec: number; // MPa
  ftd: number; // MPa (tensile design strength)
}

/** خصائص الحديد */
export interface SteelProps {
  grade: string;
  fy: number; // MPa
  Es: number; // MPa
}

/** أقطار الأسياخ المتاحة (mm) */
export const REBAR_DIAMETERS = [8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32] as const;

/** مساحة مقطع سيخ واحد (mm²) */
export function rebarArea(diameter: number): number {
  return (Math.PI * diameter * diameter) / 4;
}

/** مساحة مجموعة أسياخ (mm²) */
export function rebarGroupArea(diameter: number, count: number): number {
  return rebarArea(diameter) * count;
}

/** أنواع الأساسات */
export type FoundationType = 'isolated' | 'combined' | 'strap' | 'mat';

/** أنواع الجوائز */
export type BeamType = 'simply-supported' | 'continuous' | 'cantilever' | 't-beam';

/** أنواع البلاطات */
export type SlabType = 'one-way' | 'two-way' | 'flat' | 'ribbed';

/** وحدة قياس */
export type Unit = 'kN' | 'kN.m' | 'kN/m' | 'kN/m²' | 'mm' | 'm' | 'mm²' | 'MPa';

/** حالة التحميل الكودية السورية */
export type LoadCase = 1 | 2 | 3;

/** خصائص الخرسانة السورية */
export const SYRIAN_CONCRETE_GRADES: Record<string, number> = {
  'C20/25': 20,
  'C25/30': 25,
  'C30/37': 30,
  'C35/45': 35,
  'C40/50': 40,
  'C45/55': 45,
  'C50/60': 50,
};

/** خصائص الحديد السوري */
export const SYRIAN_STEEL_GRADES: Record<string, number> = {
  'B240': 240,
  'B300': 300,
  'B400': 400,
  'B500': 500,
  'B520': 520,
};

/** معاملات التصعيد للحمولات (الكود السوري) */
export const LOAD_FACTORS = {
  dead: 1.35,
  live: 1.50,
  wind: 1.30,
  seismic: 1.00, // الزلازل يُحسب بمعامل السعة
};

/** معامل β للقص الثاقب حسب موقع العمود */
export function getBetaEccentricity(columnPosition: 'interior' | 'edge' | 'corner' | 'custom', customBeta?: number): number {
  switch (columnPosition) {
    case 'interior': return 1.15;
    case 'edge': return 1.40;
    case 'corner': return 1.50;
    case 'custom': return customBeta ?? 1.15;
    default: return 1.15;
  }
}
