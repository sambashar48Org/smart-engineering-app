// ============================================================
// محرك تصميم الانحناء والتسليح
// الكود العربي السوري 2024 - ملحق 5
// الطريقة الحدية (ULS) لحسابات الانحناء والتسليح
// الرموز الكودية: f'_c, f_y, d, φ=0.9
// ============================================================

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
  barDiameterChosen: number; // القطر المختار (يجب ألا يقل عن 12mm) [بند 21]
}

export interface FlexureResults {
  M_u: number;                // العزم المصعد الأقصى (kN.m)
  As_required: number;        // مساحة التسليح المطلوبة (mm²)
  As_minimum: number;         // الحد الأدنى للتسليح كودياً (mm²)
  As_provided: number;        // مساحة التسليح المتاحة (mm²)
  bars_count: number;         // عدد الأسياخ المطلوبة
  spacing_mm: number;         // التباعد المحسوب بين الأسياخ (mm)
  isSpacingSafe: boolean;     // هل يحقق شرط (100mm - 200mm) [بند 21]
  projection: number;         // طول الظفر الحرج (m)
  detailingMessage: string;
}

/** تصميم الانحناء والتسليح وفق الكود العربي السوري - ملحق 5 */
export function designFlexure(inputs: FlexureInputs): FlexureResults {
  const {
    P_ultimate, B_footing, L_footing, c_width, c_depth, d_effective,
    f_y, f_c_prime, isSteelColumn, basePlateDepth = 0, barDiameterChosen
  } = inputs;

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
  const net_soil_pressure_u = P_ultimate / (B_footing * L_footing);
  const M_u = (net_soil_pressure_u * B_footing * Math.pow(projection, 2)) / 2;

  // 3. حساب التسليح بالطريقة الحدية (ULS) مع معامل خفض المقاومة (φ = 0.9)
  const phi = 0.9;
  const b_width_mm = B_footing * 1000;
  const d_mm = d_effective * 1000;

  // حساب مساحة الحديد بالطريقة التقريبية الدقيقة لـ ULS
  const Rn = (M_u * Math.pow(10, 6)) / (phi * b_width_mm * Math.pow(d_mm, 2));
  const m = f_y / (0.85 * f_c_prime);
  const discriminant = 1 - (2 * m * Rn) / f_y;

  let As_required = 0;
  if (discriminant >= 0) {
    const rho = (1 / m) * (1 - Math.sqrt(discriminant));
    As_required = rho * b_width_mm * d_mm;
  } else {
    // المقاطع فوق المتوازن - يلزم زيادة سماكة الأساس
    As_required = 0.05 * b_width_mm * d_mm;
  }

  // 4. تطبيق شروط الحدود الدنيا للتسليح (ρ_min) [بند 9, 25]
  const rho_min = f_y >= 400 ? 0.0018 : 0.0020;
  const As_minimum = rho_min * b_width_mm * d_mm;

  if (As_required < As_minimum) {
    As_required = As_minimum;
  }

  // 5. حساب عدد الأسياخ والتباعد بناءً على القطر المختار (يجب ألا يقل عن 12mm) [بند 21]
  const single_bar_area = (Math.PI * Math.pow(barDiameterChosen, 2)) / 4;
  let bars_count = Math.ceil(As_required / single_bar_area);
  const As_provided = single_bar_area * bars_count;

  // حساب التباعد بين الأسياخ (Spacing) مع الغطاء الجانبي 50mm
  let spacing_mm = Math.floor((B_footing * 1000 - 2 * 50) / (bars_count - 1));

  // 6. التحقق من اشتراطات التباعد الصارمة للكود السوري (100mm ≤ spacing ≤ 200mm) [بند 21]
  let isSpacingSafe = true;
  let detailingMessage = 'توزيع التسليح متوافق مع اشتراطات الملحق 5';

  if (spacing_mm > 200) {
    spacing_mm = 200;
    bars_count = Math.ceil((B_footing * 1000 - 2 * 50) / spacing_mm) + 1;
    detailingMessage = 'تم تقييد التباعد للحد الأقصى الكودي (200mm) وزيادة عدد الأسياخ لمنع التشقق';
  } else if (spacing_mm < 100) {
    isSpacingSafe = false;
    detailingMessage = 'التباعد أقل من الحد الأدنى الكودي (100mm)، يرجى زيادة سماكة الأساس أو قطر السيخ!';
  }

  if (barDiameterChosen < 12) {
    isSpacingSafe = false;
    detailingMessage += ' | القطر المختار أقل من 12mm المسموح بها للأساسات الرئيسية!';
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
