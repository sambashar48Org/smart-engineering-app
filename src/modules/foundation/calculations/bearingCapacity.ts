// ============================================================
// محرك حسابات الأساسات - إجهاد التربة
// الكود العربي السوري 2024 - ملحق 5
// الطريقة التشغيلية (SLS) لحسابات التربة
// ============================================================

export interface SoilInputs {
  B: number;       // عرض الأساس (m)
  L: number;       // طول الأساس (m)
  P: number;       // مجموع الحمولات الشاقولية التشغيلية (kN)
  Mx: number;      // العزم حول المحور X (kN.m)
  My: number;      // العزم حول المحور Y (kN.m)
  q_all: number;   // إجهاد التربة المسموح الاستاتيكي (kN/m²)
  loadCase: 1 | 2 | 3; // حالة التحميل: 1=دائمة، 2=رياح، 3=زلزال
}

export interface SoilResults {
  q_max: number;                   // الإجهاد الأقصى (kN/m²)
  q_min: number;                   // الإجهاد الأدنى (kN/m²)
  q_allowable_modified: number;    // الإجهاد المسموح المعدّل (kN/m²)
  hasTension: boolean;             // هل يوجد شد (انفصال جزئي)؟
  isSafe: boolean;                 // هل الإجهاد آمن؟
  investmentRatio: number;         // نسبة الاستثمار (%)
  e_L: number;                     // اللامركزية باتجاه الطول (m)
  e_B: number;                     // اللامركزية باتجاه العرض (m)
  compressedLength: number;        // طول المنطقة المضغوطة (m)
  statusMessage: string;           // رسالة الحالة
}

/** حساب إجهاد التربة وفق الكود العربي السوري - ملحق 5 */
export function calculateSoilStresses(inputs: SoilInputs): SoilResults {
  const { B, L, P, Mx, My, q_all, loadCase } = inputs;
  const A = B * L;

  // 1. حساب اللامركزية (Eccentricity)
  const e_L = P > 0 ? My / P : 0; // اللامركزية باتجاه الطول
  const e_B = P > 0 ? Mx / P : 0; // اللامركزية باتجاه العرض

  let q_max = 0;
  let q_min = 0;
  let hasTension = false;
  let compressedLength = L; // طول المنطقة المضغوطة

  // 2. حساب الإجهادات تبعاً لنواة الأساس واللامركزية
  if (e_L <= L / 6 && e_B <= B / 6) {
    // الحالة الاعتيادية: المحصلة داخل النواة (توزيع شبه منحرف أو مستطيل)
    q_max = (P / A) * (1 + (6 * e_L) / L + (6 * e_B) / B);
    q_min = (P / A) * (1 - (6 * e_L) / L - (6 * e_B) / B);
    if (q_min < 0) {
      q_min = 0;
      hasTension = true;
    }
  } else {
    // حالة الشد والانفصال الجزئي [بند 5, 7] (e > L/6)
    hasTension = true;
    q_min = 0;
    // معادلة التوزيع المثلثي بإهمال منطقة الشد
    q_max = (2 * P) / (3 * B * (L / 2 - e_L));
    compressedLength = 3 * (L / 2 - e_L);
  }

  // 3. تعديل الإجهاد المسموح حسب الحالة الكودية السورية [بند 10-12]
  let q_allowable_modified = q_all;
  if (loadCase === 2) {
    const ratio = q_max > 0 ? q_min / q_max : 0;
    q_allowable_modified = ratio < 0.5 ? q_all * 1.20 : q_all * 1.30;
  } else if (loadCase === 3) {
    const ratio = q_min > 0 ? q_max / q_min : 999;
    q_allowable_modified = ratio < 2.0 ? q_all * 1.60 : q_all * 2.00;
  }

  // 4. التحقق من أمان التربة وشرط الاستقرار الزلزالي [بند 8, 9]
  let isSafe = q_max <= q_allowable_modified;
  let statusMessage = isSafe
    ? 'إجهاد التربة آمن ومقبول كودياً'
    : 'تجاوز في إجهاد التربة المسموح';

  if (loadCase === 3 && hasTension) {
    // شرط الكود السوري في الزلازل: ألا يقل الجزء المضغوط عن نصف مساحة الأساس
    if (compressedLength < L / 2) {
      isSafe = false;
      statusMessage += ' + فشل شرط الاستقرار الزلزالي (المنطقة المضغوطة أقل من نصف مساحة الأساس)';
    }
  }

  const investmentRatio = q_allowable_modified > 0 ? (q_max / q_allowable_modified) * 100 : 0;

  return {
    q_max: Number(q_max.toFixed(2)),
    q_min: Number(q_min.toFixed(2)),
    q_allowable_modified: Number(q_allowable_modified.toFixed(2)),
    hasTension,
    isSafe,
    investmentRatio: Number(investmentRatio.toFixed(1)),
    e_L: Number(e_L.toFixed(4)),
    e_B: Number(e_B.toFixed(4)),
    compressedLength: Number(compressedLength.toFixed(3)),
    statusMessage,
  };
}
