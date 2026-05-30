// ============================================================
// محرك حسابات الأساسات - القص الثقب
// ============================================================

import type { CheckResult } from '@/types';
import type { FoundationInputs } from '@/stores/foundationStore';

export interface PunchingShearResult {
  criticalPerimeter: number;  // u (m)
  punchingArea: number;       // مساحة محيط القص (m²)
  shearStress: number;        // v (MPa)
  shearResistance: number;    // v_rd (MPa)
  check: CheckResult;
}

/** حساب القص الثقب (Punching Shear) - ACI 318 */
export function calculatePunchingShear(inputs: FoundationInputs, qNet: number): PunchingShearResult {
  const { width: B, length: L, thickness: h, columnWidth: c1, columnDepth: c2, concreteGrade, cover } = inputs;

  // العمق الفعال (mm)
  const d = (h * 1000) - cover - 10; // تقريبي

  // محيط القص الحرج (mm → m)
  const u = 2 * ((c1 * 1000) + (c2 * 1000) + 2 * d) / 1000;

  // مساحة منطقة القص الثقب
  const punchingArea = u * (d / 1000);

  // قوة القص الثقب
  const columnArea = c1 * c2;
  const foundationArea = B * L;
  const punchingForce = qNet * (foundationArea - columnArea - (2 * (c1 + c2) + 4 * (d / 1000)) * (d / 1000));

  // إجهاد القص
  const beta = 1.15; // معامل للعمود الداخلي
  const shearStress = (beta * punchingForce * 1000) / (u * 1000 * d); // MPa

  // مقاومة القص الخرسانية
  const fc = getConcreteFc(concreteGrade);
  const vrd = 0.33 * Math.sqrt(fc); // ACI simplified

  const ratio = shearStress / vrd;
  const status: CheckResult['status'] = ratio <= 0.8 ? 'pass' : ratio <= 1.0 ? 'warn' : 'fail';

  return {
    criticalPerimeter: Math.round(u * 1000) / 1000,
    punchingArea: Math.round(punchingArea * 10000) / 10000,
    shearStress: Math.round(shearStress * 100) / 100,
    shearResistance: Math.round(vrd * 100) / 100,
    check: {
      name: 'Punching Shear',
      nameAr: 'القص الثقب',
      value: Math.round(shearStress * 100) / 100,
      limit: Math.round(vrd * 100) / 100,
      ratio: Math.round(ratio * 1000) / 1000,
      status,
      unit: 'MPa',
    },
  };
}

function getConcreteFc(grade: string): number {
  const grades: Record<string, number> = {
    'C20/25': 20,
    'C25/30': 25,
    'C30/37': 30,
    'C35/45': 35,
    'C40/50': 40,
    'C45/55': 45,
    'C50/60': 50,
  };
  return grades[grade] ?? 25;
}
