// ============================================================
// محرك تصميم الانحناء والتسليح - المنطق الذكي
// الكود العربي السوري 2024 - ملحق 5
// الطريقة الحدية (ULS) لحسابات الانحناء والتسليح
// الرموز الكودية: f'_c, f_y, d, φ=0.9
// منفرد/مستمر: تسليح سفلي فقط (ظفر القاعدة الصاعد)
// حصيرة: شبكتان كاملتان (علوية + سفلية)، تباعد أقصى 250mm [بند 9]
// ============================================================

import type { FoundationType } from '@/types';

export interface FlexureInputs {
  P_ultimate: number;        // القوة المحورية المصعدة (kN)
  B_footing: number;         // عرض القاعدة (m)
  L_footing: number;         // طول القاعدة (m)
  c_width: number;           // عرض العمود (m)
  c_depth: number;           // عمق العمود (m)
  d_effective: number;       // الارتفاع الفعال d (m)
  f_y: number;               // إجهاد الخضوع للفولاذ f_y (MPa)
  f_c_prime: number;         // المقاومة الأسطوانية الإنشائية f'_c (MPa)
  isSteelColumn: boolean;
  basePlateDepth?: number;
  barDiameterChosen: number; // القطر المختار (لا يقل عن 12mm) [بند 21]
  foundationType: FoundationType; // نوع الأساس للمنطق الذكي
}

export interface FlexureResults {
  M_u: number;                // العزم المصعد الأقصى (kN.m)
  As_required: number;        // مساحة التسليح المطلوبة (mm²)
  As_minimum: number;         // الحد الأدنى للتسليح كودياً (mm²)
  As_provided: number;        // مساحة التسليح المتاحة (mm²)
  bars_count: number;         // عدد الأسياخ المطلوبة
  spacing_mm: number;         // التباعد المحسوب بين الأسياخ (mm)
  isSpacingSafe: boolean;     // هل يحقق شرط التباعد الكودي
  projection: number;         // طول الظفر الحرج (m)
  detailingMessage: string;
}

/** تصميم الانحناء والتسليح وفق الكود العربي السوري - الملحق 5 */
export function designFlexure(inputs: FlexureInputs): FlexureResults {
  const {
    P_ultimate, B_footing, L_footing, c_width, c_depth, d_effective,
    f_y, f_c_prime, isSteelColumn, basePlateDepth = 0, barDiameterChosen,
    foundationType
  } = inputs;

  // ── تحديد حدود التباعد حسب نوع الأساس ──
  // منفرد/مستمر: 100mm ≤ spacing ≤ 200mm [بند 21]
  // حصيرة/مشترك: 100mm ≤ spacing ≤ 250mm [بند 9]
  const isRaftOrCombined = foundationType === 'mat' || foundationType === 'combined';
  const maxSpacing = isRaftOrCombined ? 250 : 200;

  // 1. تحديد موقع القطاع الحرج وحساب ذراع الظفر [بند 20]
  let projection = 0;
  if (isSteelColumn) {
    // عمود معدني: عند منتصف المسافة بين وجه العمود وحافة الصفيحة القاعدة
    const mid_plate = (basePlateDepth + c_depth) / 2;
    projection = (L_footing / 2) - (mid_plate / 2);
  } else {
    // عمود خرساني: عند وجه العمود تماماً
    projection = (L_footing - c_depth) / 2;
  }

  // 2. حساب العزم الأقصى الحدي (M_u) عند القطاع الحرج
  // يعتمد فقط على "ظفر القاعدة الصاعد" تحت تأثير ضغط التربة
  const net_soil_pressure_u = P_ultimate / (B_footing * L_footing);
  const M_u = (net_soil_pressure_u * B_footing * Math.pow(projection, 2)) / 2;

  // 3. حساب التسليح بالطريقة الحدية (ULS) مع معامل خفض المقاومة (φ = 0.9)
  const phi = 0.9;
  const b_width_mm = B_footing * 1000;
  const d_mm = d_effective * 1000;

  const Rn = (M_u * Math.pow(10, 6)) / (phi * b_width_mm * Math.pow(d_mm, 2));
  const m = f_y / (0.85 * f_c_prime);
  const discriminant = 1 - (2 * m * Rn) / f_y;

  let As_required = 0;
  if (discriminant >= 0) {
    const rho = (1 / m) * (1 - Math.sqrt(discriminant));
    As_required = rho * b_width_mm * d_mm;
  } else {
    As_required = 0.05 * b_width_mm * d_mm;
  }

  // 4. تطبيق شروط الحدود الدنيا للتسليح (ρ_min) [بند 9, 25]
  const rho_min = f_y >= 400 ? 0.0018 : 0.0020;
  const As_minimum = rho_min * b_width_mm * d_mm;

  if (As_required < As_minimum) {
    As_required = As_minimum;
  }

  // 5. حساب عدد الأسياخ والتباعد
  const single_bar_area = (Math.PI * Math.pow(barDiameterChosen, 2)) / 4;
  let bars_count = Math.ceil(As_required / single_bar_area);
  const As_provided = single_bar_area * bars_count;

  let spacing_mm = Math.floor((B_footing * 1000 - 2 * 50) / (bars_count - 1));

  // 6. التحقق من اشتراطات التباعد الكودية
  let isSpacingSafe = true;
  let detailingMessage = 'توزيع التسليح متوافق مع اشتراطات الملحق 5';

  if (spacing_mm > maxSpacing) {
    spacing_mm = maxSpacing;
    bars_count = Math.ceil((B_footing * 1000 - 2 * 50) / spacing_mm) + 1;
    detailingMessage = isRaftOrCombined
      ? `تم تقييد التباعد للحد الأقصى للحصيرة (${maxSpacing}mm) وزيادة عدد الأسياخ`
      : `تم تقييد التباعد للحد الأقصى الكودي (${maxSpacing}mm) وزيادة عدد الأسياخ لمنع التشقق`;
  } else if (spacing_mm < 100) {
    isSpacingSafe = false;
    detailingMessage = 'التباعد أقل من الحد الأدنى الكودي (100mm)، يرجى زيادة سماكة الأساس أو قطر السيخ!';
  }

  if (barDiameterChosen < 12) {
    isSpacingSafe = false;
    detailingMessage += ' | القطر المختار أقل من 12mm المسموح بها للأساسات!';
  }

  return {
    M_u: Number(M_u.toFixed(2)),
    As_required: Number(As_required.toFixed(1)),
    As_minimum: Number(As_minimum.toFixed(1)),
    As_provided: Number(As_provided.toFixed(1)),
    bars_count,
    spacing_mm,
    isSpacingSafe,
    projection: Number(projection.toFixed(3)),
    detailingMessage,
  };
}

/**
 * تصميم التسليح العلوي للحصيرة/المشترك
 * شبكة علوية كاملة مستمرة لمقاومة العزوم السلبية فوق الأعمدة وبينها
 * تباعد أقصى 250mm، قطر أدنى 12mm [بند 9]
 *
 * ملاحظة هندسية: العزوم السلبية (العلوية) فوق الأعمدة في الحصائر أكبر
 * من العزوم الإيجابية السفلية، لذا تُحسب الشبكتان بكامل طاقتهما الإنشائية
 * بدون أي تخفيض. As_min أرضية أساسية للشبكتين لتقييد التشقق.
 * يُضاف تسليح إضافي علوي فوق الأعمدة (شريحة العمود) حسب الحاجة.
 */
export function designRaftTopRebar(inputs: {
  B_footing: number;
  L_footing: number;
  d_effective: number;
  f_y: number;
  f_c_prime: number;       // المقاومة الأسطوانية الإنشائية f'_c (MPa) - تُمرر فعلياً
  barDiameterChosen: number;
  M_u_full: number;        // العزم الكامل (سفلي) - تُحسب الشبكة العلوية بنفس الطاقة
}): { spacing_mm: number; count: number; areaProvided: number; areaRequired: number; diameter: number; columnStripNote: string } {
  const { B_footing, L_footing, d_effective, f_y, f_c_prime, barDiameterChosen, M_u_full } = inputs;

  // ═══ لا تخفيض: العزم العلوي = العزم الكامل ═══
  // العزوم السلبية فوق الأعمدة أكبر من السفلية،
  // لذا تُصمم الشبكة العلوية بكامل طاقتها الإنشائية
  const M_u_top = M_u_full; // بدون أي نسبة تخفيض (إلغاء 0.65 السابقة)

  const b_width_mm = B_footing * 1000;
  const d_mm = d_effective * 1000;

  // حساب التسليح العلوي - As_min كأرضية أساسية لتقييد التشقق
  const rho_min = f_y >= 400 ? 0.0018 : 0.0020;
  const As_minimum = rho_min * b_width_mm * d_mm;

  let As_required = As_minimum;
  if (M_u_top > 0) {
    const phi = 0.9;
    const Rn = (M_u_top * 1e6) / (phi * b_width_mm * d_mm * d_mm);
    const m_ratio = f_y / (0.85 * f_c_prime); // استخدام f'_c الفعلي بدلاً من تقدير
    const disc = 1 - (2 * m_ratio * Rn) / f_y;
    if (disc >= 0) {
      const rho = (1 / m_ratio) * (1 - Math.sqrt(disc));
      As_required = Math.max(rho * b_width_mm * d_mm, As_minimum);
    }
  }

  const single_bar_area = (Math.PI * barDiameterChosen * barDiameterChosen) / 4;
  let count = Math.ceil(As_required / single_bar_area);
  let spacing_mm = Math.floor((B_footing * 1000 - 2 * 50) / (count - 1));

  // تباعد أقصى 250mm للحصيرة [بند 9]
  if (spacing_mm > 250) {
    spacing_mm = 250;
    count = Math.ceil((B_footing * 1000 - 2 * 50) / spacing_mm) + 1;
  }

  return {
    diameter: barDiameterChosen,
    spacing_mm,
    count,
    areaProvided: single_bar_area * count,
    areaRequired: As_required,
    columnStripNote: 'يُضاف تسليح إضافي علوي فوق الأعمدة (شريحة العمود)',
  };
}
