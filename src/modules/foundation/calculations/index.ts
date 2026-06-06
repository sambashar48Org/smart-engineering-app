// ============================================================
// محرك حسابات الأساسات - نقطة الدخول الرئيسية
// الكود العربي السوري 2024 - ملحق 5
// الرموز الكودية: V, t, D_f, σ₁, σ₂, q_magnified, f'_c, f_y, c_w, δ
// ============================================================

import type { FoundationInputs, FoundationResults } from '@/stores/foundationStore';
import type { CheckResult, CheckStatus } from '@/types';
import { SYRIAN_CONCRETE_GRADES, SYRIAN_STEEL_GRADES } from '@/types';
import { calculateSyrianSoilStresses } from './bearingCapacity';
import { checkStability } from './stabilityCheck';
import { calculateShearAndPunching } from './punchingShear';
import { designFlexure } from './flexureDesign';

/** حساب كامل للأساس وفق الكود العربي السوري */
export function calculateFoundation(inputs: FoundationInputs): FoundationResults {
  const {
    B, L, D_f, t,
    V, M_x, M_y, H,
    loadCase, q_allowable, soilDensity: gamma,
    c_w, delta_friction, E_passive, E_active, U_uplift,
    concreteGrade, steelGrade, cover,
    columnWidth: c1, columnDepth: c2,
    isSteelColumn, basePlateWidth, basePlateDepth,
    barDiameterChosen, betaEccentricity,
  } = inputs;

  // ── قيم المواد ──
  const f_c_prime = SYRIAN_CONCRETE_GRADES[concreteGrade] ?? 25; // المقاومة الأسطوانية الإنشائية f'_c
  const f_y = SYRIAN_STEEL_GRADES[steelGrade] ?? 400;             // إجهاد الخضوع f_y

  // ── الارتفاع الفعال d (m) ──
  const d_effective = (t * 1000 - cover - 10) / 1000; // cover بالـ mm

  // ── وزن الأساس والتربة ──
  const foundationWeight = B * L * t * 24; // خرسانة 24 kN/m³
  const soilWeight = B * L * (D_f - t) * gamma;
  const totalVerticalService = V + foundationWeight + soilWeight;

  // ══════════════════════════════════════
  // 1. حساب إجهاد التربة (SLS - تشغيلي)
  // ══════════════════════════════════════
  const soilResults = calculateSyrianSoilStresses({
    B, L,
    V: totalVerticalService,
    M_x, M_y,
    q_allowable,
    loadCase,
  });

  // ══════════════════════════════════════
  // 2. تحققات الاستقرار (SLS - تشغيلي)
  // ══════════════════════════════════════
  const M_overturning = M_x + H * D_f; // عزم القلب
  const M_stabilizing = totalVerticalService * (B / 2); // عزم التثبيت

  const stabilityResults = checkStability({
    M_stabilizing,
    M_overturning: Math.abs(M_overturning),
    H_driving: H,
    Q_vertical_total: totalVerticalService,
    A_base: B * L,
    c_w,
    delta_friction,
    E_passive,
    E_active,
    U_uplift,
    loadCase,
  });

  // ══════════════════════════════════════
  // 3. القص والقص الثاقب (ULS - حدّي)
  // ══════════════════════════════════════
  // تصعيد الحمولات للطريقة الحدية
  const P_ultimate = V * 1.35 + foundationWeight * 1.35; // تبسيط

  const shearResults = calculateShearAndPunching({
    P_ultimate,
    B_footing: B,
    L_footing: L,
    c_width: c1,
    c_depth: c2,
    d_effective,
    f_c_prime,
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
    f_y,
    f_c_prime,
    isSteelColumn,
    basePlateDepth,
    barDiameterChosen,
  });

  // تسليح اتجاه Y (العرض)
  const flexureY = designFlexure({
    P_ultimate,
    B_footing: L,
    L_footing: B,
    c_width: c2,
    c_depth: c1,
    d_effective,
    f_y,
    f_c_prime,
    isSteelColumn,
    basePlateDepth,
    barDiameterChosen,
  });

  // تسليح علوي أدنى (انكماش)
  const rhoMin = f_y >= 400 ? 0.0018 : 0.0020;
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
      'نسبة التحقق من إجهاد التربة',
      soilResults.sigma_1,
      soilResults.q_magnified,
      'kN/m²',
      soilResults.isSafe,
      soilResults.statusMessage
    ),
    makeCheck(
      'Overturning Stability',
      'درجة الاستقرار ضد الانقلاب (Base-PSR)',
      stabilityResults.fs_overturning,
      stabilityResults.limit_overturning,
      'FS',
      stabilityResults.overturningSafe
    ),
    makeCheck(
      'Sliding Stability',
      'معامل الأمان من الانزلاق (F_s)',
      stabilityResults.fs_sliding,
      stabilityResults.limit_sliding,
      'FS',
      stabilityResults.slidingSafe
    ),
    makeCheck(
      'Buoyancy Safety',
      'معامل الأمان من التعويم',
      stabilityResults.fs_buoyancy,
      stabilityResults.limit_buoyancy,
      'FS',
      stabilityResults.buoyancySafe
    ),
    makeCheck(
      'One-Way Shear',
      'التحقق من جهد القص بالقطاع الحرج',
      shearResults.v_max_one_way,
      shearResults.v_concrete_one_way,
      'MPa',
      shearResults.oneWayShearSafe
    ),
    makeCheck(
      'Punching Shear',
      'التحقق من إجهاد الثقب للخرسانة',
      shearResults.v_max_punching,
      shearResults.v_concrete_punching,
      'MPa',
      shearResults.punchingShearSafe
    ),
  ];

  return {
    // إجهاد التربة
    sigma_1: soilResults.sigma_1,
    sigma_2: soilResults.sigma_2,
    q_magnified: soilResults.q_magnified,
    hasTension: soilResults.hasTension,
    bearingSafe: soilResults.isSafe,
    bearingVerificationRatio: soilResults.bearingVerificationRatio,
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
