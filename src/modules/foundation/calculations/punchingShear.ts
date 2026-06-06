// ============================================================
// محرك حسابات القص والقص الثاقب
// الكود العربي السوري 2024 - ملحق 5
// الطريقة الحدية (ULS) لحسابات القص
// ============================================================

export interface ShearInputs {
  P_ultimate: number;        // القوة المحورية المصعدة (kN)
  B_footing: number;         // عرض القاعدة (m)
  L_footing: number;         // طول القاعدة (m)
  c_width: number;           // عرض العمود (m)
  c_depth: number;           // عمق العمود (m)
  d_effective: number;       // العمق الفعال للأساس (m)
  f_ck: number;              // المقاومة المميزة للخرسانة f'c (MPa)
  beta_eccentricity: number; // معامل تصعيد اللامركزية β
  isSteelColumn: boolean;    // هل العمود معدني؟
  basePlateWidth?: number;   // عرض الصفيحة المعدنية (m)
  basePlateDepth?: number;   // عمق الصفيحة المعدنية (m)
}

export interface ShearResults {
  oneWayShearSafe: boolean;
  punchingShearSafe: boolean;
  v_max_one_way: number;       // إجهاد القص الأحادي المؤثر (MPa)
  v_concrete_one_way: number;  // مقاومة القص الأحادي للخرسانة (MPa)
  v_max_punching: number;      // إجهاد القص الثاقب المؤثر (MPa)
  v_concrete_punching: number; // مقاومة القص الثاقب للخرسانة (MPa)
  critical_dist_one_way: number; // بعد القطاع الحرج للقص الأحادي (m)
  u_perimeter: number;         // محيط القص الحرج (m)
  V_ed_one_way: number;        // قوة القص الأحادي (kN)
  V_ed_punching: number;       // قوة القص الثاقب (kN)
}

/** حساب القص والقص الثاقب وفق الكود العربي السوري - ملحق 5 */
export function calculateShearAndPunching(inputs: ShearInputs): ShearResults {
  const {
    P_ultimate, B_footing, L_footing, c_width, c_depth, d_effective, f_ck,
    beta_eccentricity, isSteelColumn, basePlateWidth = 0, basePlateDepth = 0
  } = inputs;

  // --- أ- القص أحادي الاتجاه (One-Way Shear) ---
  // القطاع الحرج يقع على بعد d/2 من وجه العمود [بند 20]
  const colDepth = isSteelColumn ? basePlateDepth : c_depth;
  const critical_dist_one_way = colDepth / 2 + d_effective / 2;
  const shear_area_length = Math.max(0, (L_footing / 2) - critical_dist_one_way);

  // حمولة القص المؤثرة
  const net_soil_pressure_u = P_ultimate / (B_footing * L_footing);
  const V_ed_one_way = net_soil_pressure_u * B_footing * shear_area_length;
  const v_max_one_way = V_ed_one_way / (B_footing * d_effective * 1000); // MPa

  // مقاومة الخرسانة المسموحة للقص أحادي الاتجاه (الطريقة الحدية) [بند 20]
  const v_concrete_one_way = 0.17 * Math.sqrt(f_ck);
  const oneWayShearSafe = v_max_one_way <= v_concrete_one_way;

  // --- ب- القص الثاقب (Punching Shear) ---
  // المحيط الحرج على بعد d/2 من وجه العمود/الصفيحة [بند 20, 22]
  const col_w = isSteelColumn ? basePlateWidth : c_width;
  const col_d = isSteelColumn ? basePlateDepth : c_depth;

  const critical_w = col_w + d_effective;
  const critical_d = col_d + d_effective;
  const u_perimeter = 2 * (critical_w + critical_d);

  // مساحة الاختراق الحرج
  const critical_area = critical_w * critical_d;
  // القوة الثاقبة الصافية المصعدة مع معامل تصعيد اللامركزية β [بند 15]
  const V_ed_punching = beta_eccentricity * (P_ultimate - (net_soil_pressure_u * critical_area));

  const v_max_punching = V_ed_punching / (u_perimeter * d_effective * 1000); // MPa

  // مقاومة الخرسانة للقص الثاقب الحدية [بند 22]
  const v_concrete_punching = 0.34 * Math.sqrt(f_ck);
  const punchingShearSafe = v_max_punching <= v_concrete_punching;

  return {
    oneWayShearSafe,
    punchingShearSafe,
    v_max_one_way: Number(v_max_one_way.toFixed(3)),
    v_concrete_one_way: Number(v_concrete_one_way.toFixed(3)),
    v_max_punching: Number(v_max_punching.toFixed(3)),
    v_concrete_punching: Number(v_concrete_punching.toFixed(3)),
    critical_dist_one_way: Number(critical_dist_one_way.toFixed(3)),
    u_perimeter: Number(u_perimeter.toFixed(3)),
    V_ed_one_way: Number(V_ed_one_way.toFixed(2)),
    V_ed_punching: Number(V_ed_punching.toFixed(2)),
  };
}
