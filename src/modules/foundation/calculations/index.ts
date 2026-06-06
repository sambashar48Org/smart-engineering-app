// ============================================================
// محرك حسابات الأساسات - نقطة الدخول الرئيسية
// الكود العربي السوري 2024 - ملحق 5
// المنطق الذكي:
//   - منفرد/مستمر: تسليح سفلي فقط (ظفر القاعدة)، بدون علوي
//   - حصيرة/مشترك: شبكتان كاملتان + تحقق جساءة [بند 11]
//   - معامل التكبير الديناميكي q_magnified حسب σ₂/σ₁
// ============================================================

import type { FoundationInputs, FoundationResults } from '@/stores/foundationStore';
import type { CheckResult, CheckStatus } from '@/types';
import { SYRIAN_CONCRETE_GRADES, SYRIAN_STEEL_GRADES } from '@/types';
import { calculateSyrianSoilStresses } from './bearingCapacity';
import { checkStability } from './stabilityCheck';
import { calculateShearAndPunching } from './punchingShear';
import { designFlexure, designRaftTopRebar } from './flexureDesign';

const NO_REBAR = { diameter: 0, spacing: 0, count: 0, areaProvided: 0, areaRequired: 0 };

/** حساب كامل للأساس وفق الكود العربي السوري */
export function calculateFoundation(inputs: FoundationInputs): FoundationResults {
  const {
    type, B, L, D_f, t,
    V, M_x, M_y, H,
    loadCase, q_allowable, soilDensity: gamma,
    c_w, delta_friction, E_passive, E_active, U_uplift,
    concreteGrade, steelGrade, cover,
    columnWidth: c1, columnDepth: c2,
    isSteelColumn, basePlateWidth, basePlateDepth,
    barDiameterChosen, betaEccentricity,
    maxColumnSpacing,
  } = inputs;

  // ── تصنيف النوع ──
  // منفرد/مستمر: تسليح سفلي فقط، بدون علوي (ظفر القاعدة الصاعد)
  // مشترك: شبكة علوية كاملة لمقاومة العزم السالب بين العمودين
  // حصيرة: شبكتان كاملتان + تحقق جساءة [بند 11]
  const isRaftOrCombined = type === 'mat' || type === 'combined';
  const isIsolatedOrStrip = type === 'isolated' || type === 'continuous';

  // ── قيم المواد ──
  const f_c_prime = SYRIAN_CONCRETE_GRADES[concreteGrade] ?? 25;
  const f_y = SYRIAN_STEEL_GRADES[steelGrade] ?? 400;

  // ── الارتفاع الفعال d (m) ──
  const d_effective = (t * 1000 - cover - 10) / 1000;

  // ── وزن الأساس والتربة ──
  const foundationWeight = B * L * t * 24;
  const soilWeight = B * L * (D_f - t) * gamma;
  const totalVerticalService = V + foundationWeight + soilWeight;

  // ══════════════════════════════════════
  // 1. حساب إجهاد التربة (SLS - تشغيلي)
  // معامل التكبير الديناميكي حسب σ₂/σ₁
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
  const M_overturning = M_x + H * D_f;
  const M_stabilizing = totalVerticalService * (B / 2);

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
  const P_ultimate = V * 1.35 + foundationWeight * 1.35;

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
  // تسليح سفلي اتجاه X
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
    foundationType: type,
  });

  // تسليح سفلي اتجاه Y
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
    foundationType: type,
  });

  // ── التسليح العلوي: المنطق الذكي ──
  let topRebarX = { ...NO_REBAR };
  let topRebarY = { ...NO_REBAR };
  let topRebarRequired = false;
  let topRebarMessage = '';

  if (isIsolatedOrStrip) {
    // ═══ منفرد/مستمر: إلغاء كامل للتسليح العلوي ═══
    // الأساس المنفرد والمستمر تحت الجدران يعمل ككنسة بظفر صاعد
    // لا توجد عزوم سلبية تتطلب تسليحاً علويّاً
    topRebarRequired = false;
    topRebarMessage = 'غير مطلوب إنشائياً كودياً (توفير هدر)';
    // topRebarX و topRebarY يبقيان NO_REBAR (diameter=0)
  } else if (isRaftOrCombined) {
    // ═══ حصيرة/مشترك: شبكتان كاملتان مستمرتان ═══
    topRebarRequired = true;

    if (type === 'combined') {
      // المشترك: شبكة علوية كاملة ومحسوبة لمقاومة العزم السالب بين العمودين
      topRebarMessage = 'شبكة علوية كاملة لمقاومة العزم السالب بين العمودين [بند 9]';
    } else {
      // الحصيرة: شبكتان بكامل الطاقة الإنشائية + ملاحظة شريحة العمود
      topRebarMessage = 'شبكة علوية كاملة بكامل طاقتها الإنشائية + يُضاف تسليح إضافي علوي فوق الأعمدة (شريحة العمود) [بند 9]';
    }

    const topX = designRaftTopRebar({
      B_footing: B,
      L_footing: L,
      d_effective,
      f_y,
      f_c_prime,
      barDiameterChosen,
      M_u_full: flexureX.M_u,
    });

    const topY = designRaftTopRebar({
      B_footing: L,
      L_footing: B,
      d_effective,
      f_y,
      f_c_prime,
      barDiameterChosen,
      M_u_full: flexureY.M_u,
    });

    topRebarX = {
      diameter: topX.diameter,
      spacing: topX.spacing_mm,
      count: topX.count,
      areaProvided: topX.areaProvided,
      areaRequired: topX.areaRequired,
    };
    topRebarY = {
      diameter: topY.diameter,
      spacing: topY.spacing_mm,
      count: topY.count,
      areaProvided: topY.areaProvided,
      areaRequired: topY.areaRequired,
    };
  }

  // ══════════════════════════════════════
  // 5. تحقق جساءة الحصيرة [بند 11]
  // ══════════════════════════════════════
  let raftStiffnessCheck: FoundationResults['raftStiffnessCheck'] = undefined;

  if (type === 'mat') {
    const minThickness = maxColumnSpacing / 8;
    const isRigid = t >= minThickness;
    raftStiffnessCheck = {
      isRigid,
      minThickness: Number(minThickness.toFixed(3)),
      actualThickness: t,
      message: isRigid
        ? '✅ الحصيرة تعمل كجسم صلد وفق [بند 11] - السمك كافٍ'
        : `❌ الحصيرة لا تعمل كجسم صلد وفق [بند 11] - سمك الحصيرة (${t}m) أقل من الحد الأدنى (${minThickness.toFixed(3)}m = أكبر مسافة بين أعمدة / 8)`,
    };
  }

  // ══════════════════════════════════════
  // 6. تجميع التحققات الموحدة
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

  // إضافة تحقق جساءة الحصيرة
  if (raftStiffnessCheck) {
    checks.push(
      makeCheck(
        'Raft Stiffness',
        'تحقق جساءة الحصيرة [بند 11]',
        raftStiffnessCheck.actualThickness,
        raftStiffnessCheck.minThickness,
        'm',
        raftStiffnessCheck.isRigid,
        raftStiffnessCheck.message
      )
    );
  }

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
    topRebarX,
    topRebarY,

    // المنطق الذكي
    topRebarRequired,
    topRebarMessage,

    // ملاحظة شريحة العمود (للحصيرة فقط)
    columnStripNote: type === 'mat' ? 'يُضاف تسليح إضافي علوي فوق الأعمدة (شريحة العمود)' : '',

    // تنبيه تراكيب الأحمال الديناميكية
    loadCaseWarning: soilResults.loadCaseWarning,

    // جساءة الحصيرة
    raftStiffnessCheck,

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
    status = ratio >= 1.0 ? 'pass' : ratio >= 0.9 ? 'warn' : 'fail';
  } else if (name.includes('Stiffness')) {
    // للجساءة: value >= limit هو الآمن (السمك >= الحد الأدنى)
    status = ratio >= 1.0 ? 'pass' : ratio >= 0.9 ? 'warn' : 'fail';
  } else {
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
