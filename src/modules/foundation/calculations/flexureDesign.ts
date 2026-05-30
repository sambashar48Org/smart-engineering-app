// ============================================================
// محرك حسابات الأساسات - الانحناء والتسليح
// ============================================================

import type { CheckResult } from '@/types';
import type { FoundationInputs } from '@/stores/foundationStore';
import { rebarArea, REBAR_DIAMETERS } from '@/types';

export interface RebarDesign {
  diameter: number;  // mm
  spacing: number;   // mm
  count: number;
  areaProvided: number; // mm²
  areaRequired: number; // mm²
}

export interface FlexureResult {
  momentX: number;       // kN.m
  momentY: number;       // kN.m
  bottomRebarX: RebarDesign;
  bottomRebarY: RebarDesign;
  topRebarX: RebarDesign;
  topRebarY: RebarDesign;
  checkX: CheckResult;
  checkY: CheckResult;
}

/** حساب الانحناء والتسليح */
export function calculateFlexure(inputs: FoundationInputs, qNet: number): FlexureResult {
  const { width: B, length: L, thickness: h, concreteGrade, steelGrade, cover, columnWidth: c1, columnDepth: c2 } = inputs;

  const d = (h * 1000) - cover - 10; // العمق الفعال (mm)
  const fc = getConcreteFc(concreteGrade);
  const fy = getSteelFy(steelGrade);

  // عزم الانحناء في كل اتجاه (تبسيط: cantilever من واجهة العمود)
  const cantileverX = (L - c1) / 2; // (m)
  const cantileverY = (B - c2) / 2; // (m)

  const momentX = qNet * B * cantileverX * cantileverX / 2; // kN.m
  const momentY = qNet * L * cantileverY * cantileverY / 2; // kN.m

  // حساب التسليح لكل اتجاه
  const bottomRebarX = designRebar(momentX, B * 1000, d, fc, fy);
  const bottomRebarY = designRebar(momentY, L * 1000, d, fc, fy);

  // تسليح علوي (أدنى - shrinkage)
  const topRebarX = designMinRebar(B * 1000, d, fy);
  const topRebarY = designMinRebar(L * 1000, d, fy);

  return {
    momentX: Math.round(momentX * 100) / 100,
    momentY: Math.round(momentY * 100) / 100,
    bottomRebarX,
    bottomRebarY,
    topRebarX,
    topRebarY,
    checkX: {
      name: 'Flexure X',
      nameAr: 'انحناء اتجاه X',
      value: Math.round(momentX * 100) / 100,
      limit: 0, // ليس حد كودي مباشر
      ratio: bottomRebarX.areaProvided > 0 ? bottomRebarX.areaRequired / bottomRebarX.areaProvided : 0,
      status: bottomRebarX.areaProvided >= bottomRebarX.areaRequired ? 'pass' : 'fail',
      unit: 'kN.m',
    },
    checkY: {
      name: 'Flexure Y',
      nameAr: 'انحناء اتجاه Y',
      value: Math.round(momentY * 100) / 100,
      limit: 0,
      ratio: bottomRebarY.areaProvided > 0 ? bottomRebarY.areaRequired / bottomRebarY.areaProvided : 0,
      status: bottomRebarY.areaProvided >= bottomRebarY.areaRequired ? 'pass' : 'fail',
      unit: 'kN.m',
    },
  };
}

/** تصميم التسليح لاتجاه واحد */
function designRebar(M: number, b: number, d: number, fc: number, fy: number): RebarDesign {
  if (M <= 0) {
    return { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 };
  }

  // M بـ kN.m → N.mm
  const Mnm = M * 1e6;

  // حساب a (عمق المكعب الخرساني المكافئ)
  const a = d - Math.sqrt(d * d - (2 * Mnm) / (0.85 * fc * b));

  // مساحة التسليح المطلوبة
  const As = (0.85 * fc * b * a) / fy;

  // مساحة التسليح الدنيا
  const AsMin = Math.max(0.0013 * b * d, (0.25 * Math.sqrt(fc) / fy) * b * d);
  const AsRequired = Math.max(As, AsMin);

  // اختيار قطر السيخ والمسافة
  return selectRebar(AsRequired, b);
}

/** اختيار أسياخ مناسبة من الجدول */
function selectRebar(AsRequired: number, b: number): RebarDesign {
  let bestDiameter = 12;
  let bestSpacing = 200;
  let bestCount = 0;
  let bestArea = 0;

  for (const dia of REBAR_DIAMETERS) {
    if (dia < 10 || dia > 25) continue; // نطاق معقول للأساسات

    const singleArea = rebarArea(dia);
    const count = Math.ceil(AsRequired / singleArea);
    const spacing = Math.floor((b - 2 * 50) / (count - 1)); // 50mm غطاء جانبي
    const areaProvided = singleArea * count;

    // نفضّل أقطار أكبر مع مسافات معقولة (150-250mm)
    if (spacing >= 150 && spacing <= 300 && areaProvided >= AsRequired) {
      if (bestArea === 0 || (spacing >= 150 && spacing <= 250)) {
        bestDiameter = dia;
        bestSpacing = spacing;
        bestCount = count;
        bestArea = areaProvided;
        break; // أول خيار مناسب
      }
    }
  }

  // إذا لم نجد خياراً مناسباً، نستخدم الأقرب
  if (bestArea === 0) {
    const dia = 16;
    const singleArea = rebarArea(dia);
    const count = Math.ceil(AsRequired / singleArea);
    bestDiameter = dia;
    bestCount = count;
    bestSpacing = Math.max(100, Math.floor((b - 100) / count));
    bestArea = singleArea * count;
  }

  return {
    diameter: bestDiameter,
    spacing: bestSpacing,
    count: bestCount,
    areaProvided: Math.round(bestArea * 100) / 100,
    areaRequired: Math.round(AsRequired * 100) / 100,
  };
}

/** تسليح أدنى (انكماش) */
function designMinRebar(b: number, d: number, fy: number): RebarDesign {
  const AsMin = 0.0018 * b * d; // ACI shrinkage minimum
  const result = selectRebar(AsMin, b);
  return result;
}

function getConcreteFc(grade: string): number {
  const grades: Record<string, number> = {
    'C20/25': 20, 'C25/30': 25, 'C30/37': 30,
    'C35/45': 35, 'C40/50': 40, 'C45/55': 45, 'C50/60': 50,
  };
  return grades[grade] ?? 25;
}

function getSteelFy(grade: string): number {
  const grades: Record<string, number> = {
    'B240': 240, 'B300': 300, 'B400': 400, 'B500': 500, 'B520': 520,
  };
  return grades[grade] ?? 400;
}
