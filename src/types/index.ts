// ============================================================
// الأنواع الأساسية المشتركة للتطبيق الهندسي الذكي
// ============================================================

/** لغة الواجهة */
export type Lang = 'ar' | 'en';

/** كود التصميم المعتمد */
export type DesignCode = 'aci318' | 'eurocode2' | 'arabic-code';

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
