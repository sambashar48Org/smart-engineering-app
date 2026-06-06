// ============================================================
// محرك حسابات الأساسات - إجهاد التربة
// الكود العربي السوري 2024 - ملحق 5
// الطريقة التشغيلية (SLS) لحسابات التربة
// الرموز الكودية: σ₁, σ₂, V, q_magnified, D_f, t
// ============================================================

export interface SoilInputs {
  B: number;             // عرض الأساس (m)
  L: number;             // طول الأساس (m)
  V: number;             // الحمولة الشاقولية الكلية المؤثرة (kN)
  M_x: number;           // العزم المركزي حول X (kN.m)
  M_y: number;           // العزم المركزي حول Y (kN.m)
  q_allowable: number;   // إجهاد التحميل المسموح به للتربة (kN/m²)
  loadCase: 1 | 2 | 3;  // حالة التحميل: 1=دائمة، 2=رياح، 3=زلزال
}

export interface SoilResults {
  sigma_1: number;              // الإجهاد الأكبر عند حواف الأساس (kN/m²)
  sigma_2: number;              // الإجهاد الأصغر عند حواف الأساس (kN/m²)
  q_magnified: number;          // إجهاد التحميل المسموح المكبر (kN/m²)
  hasTension: boolean;          // هل يوجد شد (انفصال جزئي)؟
  isSafe: boolean;              // هل الإجهاد آمن؟
  bearingVerificationRatio: number; // نسبة التحقق من إجهاد التربة (%)
  e_L: number;                  // اللامركزية باتجاه الطول (m)
  e_B: number;                  // اللامركزية باتجاه العرض (m)
  compressedLength: number;     // طول المنطقة المضغوطة (m)
  statusMessage: string;        // رسالة الحالة
}

/** حساب إجهاد التربة وفق الكود العربي السوري - ملحق 5 */
export function calculateSyrianSoilStresses(inputs: SoilInputs): SoilResults {
  const { B, L, V, M_x, M_y, q_allowable, loadCase } = inputs;
  const A = B * L;

  // 1. حساب اللامركزية (Eccentricity)
  const e_L = V > 0 ? M_y / V : 0; // اللامركزية باتجاه الطول
  const e_B = V > 0 ? M_x / V : 0; // اللامركزية باتجاه العرض

  let sigma_1 = 0;
  let sigma_2 = 0;
  let hasTension = false;
  let compressedLength = L;

  // 2. حساب الإجهادات تبعاً لنواة الأساس واللامركزية
  // الرموز السورية الجديدة: σ₁ (الإجهاد الأكبر) و σ₂ (الإجهاد الأصغر)
  if (e_L <= L / 6 && e_B <= B / 6) {
    // الحالة الاعتيادية: المحصلة داخل النواة (توزيع شبه منحرف أو مستطيل)
    sigma_1 = (V / A) * (1 + (6 * e_L) / L + (6 * e_B) / B);
    sigma_2 = (V / A) * (1 - (6 * e_L) / L - (6 * e_B) / B);
    if (sigma_2 < 0) {
      sigma_2 = 0;
      hasTension = true;
    }
  } else {
    // حالة الشد والانفصال الجزئي [بند 5, 7] (e > L/6)
    hasTension = true;
    sigma_2 = 0;
    // معادلة التوزيع المثلثي بإهمال منطقة الشد
    sigma_1 = (2 * V) / (3 * B * (L / 2 - e_L));
    compressedLength = 3 * (L / 2 - e_L);
  }

  // 3. تطبيق عامل التكبير حسب نص الملحق 5 الصارم لحالات التحميل [بند 10-12]
  let q_magnified = q_allowable;
  if (loadCase === 2) {
    const ratio = sigma_1 > 0 ? sigma_2 / sigma_1 : 0;
    q_magnified = ratio < 0.5 ? q_allowable * 1.20 : q_allowable * 1.30;
  } else if (loadCase === 3) {
    const ratio = sigma_2 > 0 ? sigma_1 / sigma_2 : 999;
    q_magnified = ratio < 2.0 ? q_allowable * 1.60 : q_allowable * 2.00;
  }

  // 4. التحقق من أمان التربة وشرط الاستقرار الزلزالي [بند 8, 9]
  let isSafe = sigma_1 <= q_magnified;
  let statusMessage = isSafe
    ? '✅ إجهاد التربة آمن ومحقق كودياً'
    : '❌ تجاوز في إجهاد التحميل المسموح به';

  if (loadCase === 3 && hasTension) {
    // شرط الكود السوري في الزلازل: ألا يقل الجزء المضغوط عن نصف مساحة الأساس
    if (compressedLength < L / 2) {
      isSafe = false;
      statusMessage += ' + فشل شرط الاستقرار الزلزالي (المنطقة المضغوطة أقل من نصف مساحة الأساس)';
    }
  }

  const bearingVerificationRatio = q_magnified > 0 ? (sigma_1 / q_magnified) * 100 : 0;

  return {
    sigma_1: Number(sigma_1.toFixed(2)),
    sigma_2: Number(sigma_2.toFixed(2)),
    q_magnified: Number(q_magnified.toFixed(2)),
    hasTension,
    isSafe,
    bearingVerificationRatio: Number(bearingVerificationRatio.toFixed(1)),
    e_L: Number(e_L.toFixed(4)),
    e_B: Number(e_B.toFixed(4)),
    compressedLength: Number(compressedLength.toFixed(3)),
    statusMessage,
  };
}
