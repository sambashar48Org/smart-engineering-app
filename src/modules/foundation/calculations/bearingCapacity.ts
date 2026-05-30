// ============================================================
// محرك حسابات الأساسات - إجهاد التربة
// ============================================================

import type { CheckResult } from '@/types';
import type { FoundationInputs } from '@/stores/foundationStore';

export interface BearingResult {
  qMax: number;     // الإجهاد الأقصى (kN/m²)
  qMin: number;     // الإجهاد الأدنى (kN/m²)
  qNet: number;     // الإجهاد الصافي (kN/m²)
  utilizationRatio: number; // نسبة الاستثمار
  check: CheckResult;
}

/** حساب إجهاد التربة تحت الأساس المنفرد */
export function calculateBearingCapacity(inputs: FoundationInputs): BearingResult {
  const { width: B, length: L, depth: D, axialLoad: N, momentX: Mx, momentY: My, bearingCapacity: qAll, soilDensity: gamma } = inputs;

  // وزن الأساس والتربة فوقه
  const foundationWeight = B * L * D * (24); // خرسانة عادية 24 kN/m³
  const soilWeight = B * L * D * gamma;
  const totalWeight = foundationWeight; // تقريبي

  // الحمل الكلي على التربة
  const totalLoad = N + totalWeight;

  // إجهاد التربة مع العزوم
  const sectionModulusX = (B * L * L) / 6;
  const sectionModulusY = (L * B * B) / 6;

  const qMax = totalLoad / (B * L) + Math.abs(Mx) / sectionModulusX + Math.abs(My) / sectionModulusY;
  const qMin = totalLoad / (B * L) - Math.abs(Mx) / sectionModulusX - Math.abs(My) / sectionModulusY;
  const qNet = totalLoad / (B * L);

  const utilizationRatio = qMax / qAll;

  const status: CheckResult['status'] = utilizationRatio <= 0.8 ? 'pass' : utilizationRatio <= 1.0 ? 'warn' : 'fail';

  return {
    qMax: Math.round(qMax * 100) / 100,
    qMin: Math.round(Math.max(qMin, 0) * 100) / 100,
    qNet: Math.round(qNet * 100) / 100,
    utilizationRatio: Math.round(utilizationRatio * 1000) / 1000,
    check: {
      name: 'Bearing Capacity',
      nameAr: 'إجهاد التربة',
      value: Math.round(qMax * 100) / 100,
      limit: qAll,
      ratio: Math.round(utilizationRatio * 1000) / 1000,
      status,
      unit: 'kN/m²',
    },
  };
}
