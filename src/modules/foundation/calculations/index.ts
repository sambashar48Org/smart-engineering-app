// ============================================================
// محرك حسابات الأساسات - نقطة الدخول الرئيسية
// ============================================================

import type { FoundationInputs, FoundationResults } from '@/stores/foundationStore';
import { calculateBearingCapacity } from './bearingCapacity';
import { calculatePunchingShear } from './punchingShear';
import { calculateFlexure } from './flexureDesign';

/** حساب كامل للأساس */
export function calculateFoundation(inputs: FoundationInputs): FoundationResults {
  // 1. حساب إجهاد التربة
  const bearing = calculateBearingCapacity(inputs);

  // 2. حساب القص الثقب
  const punching = calculatePunchingShear(inputs, bearing.qNet);

  // 3. حساب الانحناء والتسليح
  const flexure = calculateFlexure(inputs, bearing.qNet);

  // تجميع كل التحققات
  const checks = [
    bearing.check,
    punching.check,
    flexure.checkX,
    flexure.checkY,
  ];

  return {
    maxStress: bearing.qMax,
    minStress: bearing.qMin,
    netStress: bearing.qNet,
    utilizationRatio: bearing.utilizationRatio,
    checks,
    bottomRebarX: {
      diameter: flexure.bottomRebarX.diameter,
      spacing: flexure.bottomRebarX.spacing,
      area: flexure.bottomRebarX.areaProvided,
    },
    bottomRebarY: {
      diameter: flexure.bottomRebarY.diameter,
      spacing: flexure.bottomRebarY.spacing,
      area: flexure.bottomRebarY.areaProvided,
    },
    topRebarX: {
      diameter: flexure.topRebarX.diameter,
      spacing: flexure.topRebarX.spacing,
      area: flexure.topRebarX.areaProvided,
    },
    topRebarY: {
      diameter: flexure.topRebarY.diameter,
      spacing: flexure.topRebarY.spacing,
      area: flexure.topRebarY.areaProvided,
    },
    calculated: true,
  };
}
