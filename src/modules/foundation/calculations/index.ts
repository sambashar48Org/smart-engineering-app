// ============================================================
// محرك حسابات الأساسات - نقطة الدخول الرئيسية
// الكود العربي السوري 2024 - ملحق 5
// ============================================================

import type { FoundationInputs, FoundationResults } from '@/stores/foundationStore';
import type { CheckResult, CheckStatus } from '@/types';
import { SYRIAN_CONCRETE_GRADES, SYRIAN_STEEL_GRADES } from '@/types';
import { calculateSoilStresses } from './bearingCapacity';
import { checkStability } from './stabilityCheck';
import { calculateShearAndPunching } from './punchingShear';
import { designFlexure } from './flexureDesign';

/** حساب كامل للأساس وفق الكود العربي السوري */
export function calculateFoundation(inputs: FoundationInputs): FoundationResults {
  const {
    width: B, length: L, depth: D, thickness: h,
    axialLoad: N, momentX: Mx, momentY: My, horizontalForce: H,
    loadCase, bearingCapacity: qAll, soilDensity: gamma,
    cohesion, deltaFriction, E_passive, E_active, U_uplift,
    concreteGrade, steelGrade, cover,
    columnWidth: c1, columnDepth: c2,
    isSteelColumn, basePlateWidth, basePlateDepth,
    barDiameterChosen, betaEccentricity,
  } = inputs;

  // ── قيم المواد ──
  const f_ck = SYRIAN_CONCRETE_GRADES[concreteGrade] ?? 25;
  const f_yk = SYRIAN_STEEL_GRADES[steelGrade] ?? 400;

  // ── العمق الفعال (m) ──
  const d_effective = (h * 1000 - cover - 10) / 1000; // cover بالـ mm

  // ── وزن الأساس والتربة ──
  const foundationWeight = B * L * h * 24; // خرسانة 24 kN/m³
  const soilWeight = B * L * (D - h) * gamma;
  const totalVerticalService = N + foundationWeight + soilWeight;

  // ══════════════════════════════════════
  // 1. حساب إجهاد التربة (SLS - تشغيلي)
  // ══════════════════════════════════════
  const soilResults = calculateSoilStresses({
    B, L,
    P: totalVerticalService,
    Mx, My,
    q_all: qAll,
    loadCase,
  });

  // ══════════════════════════════════════
  // 2. تحققات الاستقرار (SLS - تشغيلي)
  // ══════════════════════════════════════
  const M_overturning = Mx + H * D; // عزم القلب
  const M_stabilizing = totalVerticalService * (B / 2); // عزم التثبيت

  const stabilityResults = checkStability({
    M_stabilizing,
    M_overturning: Math.abs(M_overturning),
    H_driving: H,
    Q_vertical_total: totalVerticalService,
    A_base: B * L,
    cohesion,
    delta_friction: deltaFriction,
    E_passive,
    E_active,
    U_uplift,
    loadCase,
  });

  // ══════════════════════════════════════
  // 3. القص والقص الثاقب (ULS - حدّي)
  // ══════════════════════════════════════
  // تصعيد الحمولات للطريقة الحدية
  const P_ultimate = N * 1.35 + foundationWeight * 1.35; // تبسيط
  const M_ultimate_x = Mx * 1.35;

  const shearResults = calculateShearAndPunching({
    P_ultimate: P_ultimate,
    B_footing: B,
    L_footing: L,
    c_width: c1,
    c_depth: c2,
    d_effective,
    f_ck,
    beta_eccentricity: betaEccentricity,
    isSteelColumn,
    basePlateWidth,
    basePlateDepth,
  });

  // ══════════════════════════════════════
  // 4. الانحناء والتسليح (ULS - حدّي)
  // ══════════════════════════════════════
  // تسليح اتجاه X (الطول)
  const flexureX = designFlexure({
    P_ultimate,
    B_footing: B,
    L_footing: L,
    c_width: c1,
    c_depth: c2,
    d_effective,
    f_yk,
    f_ck,
    isSteelColumn,
    basePlateDepth,
    barDiameterChosen,
  });

  // تسليح اتجاه Y (العرض)
  const flexureY = designFlexure({
    P_ultimate,
    B_footing: L,  // نعكس الأبعاد للاتجاه الآخر
    L_footing: B,
    c_width: c2,
    c_depth: c1,
    d_effective,
    f_yk,
    f_ck,
    isSteelColumn,
    basePlateDepth,
    barDiameterChosen,
  });

  // تسليح علوي أدنى (انكماش)
  const rhoMin = f_yk >= 400 ? 0.0018 : 0.0020;
  const AsMinX = rhoMin * (B * 1000) * (d_effective * 1000);
  const AsMinY = rhoMin * (L * 1000) * (d_effective * 1000);
  const topBarArea = (Math.PI * barDiameterChosen * barDiameterChosen) / 4;
  const topCountX = Math.ceil(AsMinX / topBarArea);
  const topCountY = Math.ceil(AsMinY / topBarArea);
  const topSpacingX = Math.min(200, Math.floor((B * 1000 - 100) / Math.max(topCountX, 1)));
  const topSpacingY = Math.min(200, Math.floor((L * 1000 - 100) / Math.max(topCountY, 1)));

  // ══════════════════════════════════════
  // 5. تجميع التحققات الموحدة
  // ══════════════════════════════════════
  const checks: CheckResult[] = [
    makeCheck(
      'Bearing Capacity',
      'إجهاد التربة',
      soilResults.q_max,
      soilResults.q_allowable_modified,
      'kN/m²',
      soilResults.isSafe,
      soilResults.statusMessage
    ),
    makeCheck(
      'Overturning Stability',
      'استقرار الانقلاب',
      stabilityResults.fs_overturning,
      stabilityResults.limit_overturning,
      'FS',
      stabilityResults.overturningSafe
    ),
    makeCheck(
      'Sliding Stability',
      'استقرار الانزلاق',
      stabilityResults.fs_sliding,
      stabilityResults.limit_sliding,
      'FS',
      stabilityResults.slidingSafe
    ),
    makeCheck(
      'Buoyancy Safety',
      'أمان التعويم',
      stabilityResults.fs_buoyancy,
      stabilityResults.limit_buoyancy,
      'FS',
      stabilityResults.buoyancySafe
    ),
    makeCheck(
      'One-Way Shear',
      'القص أحادي الاتجاه',
      shearResults.v_max_one_way,
      shearResults.v_concrete_one_way,
      'MPa',
      shearResults.oneWayShearSafe
    ),
    makeCheck(
      'Punching Shear',
      'القص الثاقب',
      shearResults.v_max_punching,
      shearResults.v_concrete_punching,
      'MPa',
      shearResults.punchingShearSafe
    ),
  ];

  return {
    // إجهاد التربة
    maxStress: soilResults.q_max,
    minStress: soilResults.q_min,
    allowableModified: soilResults.q_allowable_modified,
    hasTension: soilResults.hasTension,
    bearingSafe: soilResults.isSafe,
    investmentRatio: soilResults.investmentRatio,
    e_L: soilResults.e_L,
    e_B: soilResults.e_B,
    compressedLength: soilResults.compressedLength,

    // الاستقرار
    overturningSafe: stabilityResults.overturningSafe,
    slidingSafe: stabilityResults.slidingSafe,
    buoyancySafe: stabilityResults.buoyancySafe,
    fs_overturning: stabilityResults.fs_overturning,
    fs_sliding: stabilityResults.fs_sliding,
    fs_buoyancy: stabilityResults.fs_buoyancy,

    // القص
    oneWayShearSafe: shearResults.oneWayShearSafe,
    punchingShearSafe: shearResults.punchingShearSafe,
    v_max_one_way: shearResults.v_max_one_way,
    v_concrete_one_way: shearResults.v_concrete_one_way,
    v_max_punching: shearResults.v_max_punching,
    v_concrete_punching: shearResults.v_concrete_punching,

    // الانحناء والتسليح
    M_u: flexureX.M_u,
    bottomRebarX: {
      diameter: barDiameterChosen,
      spacing: flexureX.spacing_mm,
      count: flexureX.bars_count,
      areaProvided: flexureX.As_provided,
      areaRequired: flexureX.As_required,
    },
    bottomRebarY: {
      diameter: barDiameterChosen,
      spacing: flexureY.spacing_mm,
      count: flexureY.bars_count,
      areaProvided: flexureY.As_provided,
      areaRequired: flexureY.As_required,
    },
    topRebarX: {
      diameter: barDiameterChosen,
      spacing: topSpacingX,
      count: topCountX,
      areaProvided: topBarArea * topCountX,
      areaRequired: AsMinX,
    },
    topRebarY: {
      diameter: barDiameterChosen,
      spacing: topSpacingY,
      count: topCountY,
      areaProvided: topBarArea * topCountY,
      areaRequired: AsMinY,
    },

    // التحققات
    checks,

    // رسائل
    bearingMessage: soilResults.statusMessage,
    flexureMessage: flexureX.detailingMessage,

    calculated: true,
  };
}

/** إنشاء نتيجة تحقق موحدة */
function makeCheck(
  name: string,
  nameAr: string,
  value: number,
  limit: number,
  unit: string,
  isSafe: boolean,
  message?: string
): CheckResult {
  const ratio = limit > 0 ? value / limit : 0;
  let status: CheckStatus;
  if (name.includes('Stability') || name.includes('Buoyancy')) {
    // للمعاملات الأمنية: FS >= limit هو الآمن
    status = ratio >= 1.0 ? 'pass' : ratio >= 0.9 ? 'warn' : 'fail';
  } else {
    // للإجهادات: value <= limit هو الآمن
    status = ratio <= 0.8 ? 'pass' : ratio <= 1.0 ? 'warn' : 'fail';
  }

  return {
    name,
    nameAr,
    value: Number(value.toFixed(3)),
    limit: Number(limit.toFixed(3)),
    ratio: Number(ratio.toFixed(3)),
    status,
    unit,
    message,
  };
}
