// ============================================================
// محرك تحققات الاستقرار والثبات
// الكود العربي السوري 2024 - ملحق 5
// الطريقة التشغيلية (SLS) لحسابات الاستقرار
// الرموز الكودية: F_s (معامل الأمان من الانزلاق)، Base-PSR (درجة الاستقرار ضد الانقلاب)
// ============================================================

export interface StabilityInputs {
  M_stabilizing: number;    // العزوم المثبتة (kN.m)
  M_overturning: number;    // العزوم القالبة (kN.m)
  H_driving: number;        // القوى الأفقية المسببة للانزلاق (kN)
  Q_vertical_total: number; // الوزن الكلي المقاوم للاستقرار (kN)
  A_base: number;           // مساحة الاحتكاك B × L (m²)
  c_w: number;              // إجهاد التماسك بين التربة والأساس (kN/m²)
  delta_friction: number;   // زاوية الاحتكاك بين الأساس والتربة (درجة)
  E_passive: number;        // دفع التربة المقاوم المنفعل (kN)
  E_active: number;         // دفع التربة الأمامي الفعال (kN)
  U_uplift: number;         // قوة دفع الماء لأعلى (kN)
  loadCase: 1 | 2 | 3;
}

export interface StabilityResults {
  overturningSafe: boolean;
  slidingSafe: boolean;
  buoyancySafe: boolean;
  fs_overturning: number;    // درجة الاستقرار ضد الانقلاب (Base-PSR)
  fs_sliding: number;        // معامل الأمان من الانزلاق (F_s)
  fs_buoyancy: number;       // معامل الأمان من التعويم
  limit_overturning: number;
  limit_sliding: number;
  limit_buoyancy: number;
}

/** تحقق الاستقرار وفق الكود العربي السوري - ملحق 5 */
export function checkStability(inputs: StabilityInputs): StabilityResults {
  const {
    M_stabilizing, M_overturning, H_driving, Q_vertical_total,
    A_base, c_w, delta_friction, E_passive, E_active, U_uplift, loadCase
  } = inputs;

  // 1. درجة الاستقرار ضد الانقلاب (Base-PSR) [بند 13]
  const fs_overturning = M_overturning > 0 ? M_stabilizing / M_overturning : 999;
  const limit_overturning = loadCase === 1 ? 1.5 : loadCase === 2 ? 1.3 : 1.1;
  const overturningSafe = fs_overturning >= limit_overturning;

  // 2. معامل الأمان من الانزلاق (F_s) [بند 16, 17]
  const delta_rad = (delta_friction * Math.PI) / 180;
  const H_s = Q_vertical_total * Math.tan(delta_rad) + A_base * c_w;
  const fs_sliding = (H_driving + E_active) > 0
    ? (H_s + E_passive) / (H_driving + E_active)
    : 999;

  // المعاملات الدنيا للكود السوري: 1.5 (دائمة)، 1.3 (رياح)، 1.1 (زلزالية)
  const limit_sliding = loadCase === 1 ? 1.5 : loadCase === 2 ? 1.3 : 1.1;
  const slidingSafe = fs_sliding >= limit_sliding;

  // 3. التحقق من التعويم (Uplift) [بند 18, 19]
  const fs_buoyancy = U_uplift > 0 ? Q_vertical_total / U_uplift : 999;
  const limit_buoyancy = loadCase === 1 ? 1.3 : loadCase === 2 ? 1.2 : 1.1;
  const buoyancySafe = fs_buoyancy >= limit_buoyancy;

  return {
    overturningSafe,
    slidingSafe,
    buoyancySafe,
    fs_overturning: Number(fs_overturning.toFixed(2)),
    fs_sliding: Number(fs_sliding.toFixed(2)),
    fs_buoyancy: Number(fs_buoyancy.toFixed(2)),
    limit_overturning,
    limit_sliding,
    limit_buoyancy,
  };
}
