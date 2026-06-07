// ============================================================
// نظام الترجمة عربي/إنجليزي - الكود العربي السوري 2024
// الرموز الكودية: σ₁, σ₂, V, t, D_f, q_magnified, f'_c, f_y, c_w, δ
// ============================================================

import type { Lang } from '@/types';

const translations: Record<string, Record<Lang, string>> = {
  // عام
  'app.title': { ar: 'التطبيق الهندسي الذكي', en: 'Smart Engineering App' },
  'app.shortTitle': { ar: 'هندسي ذكي', en: 'SmartEng' },
  'app.description': { ar: 'تطبيق هندسي ذكي للتصميم الإنشائي والحسابات والرسوم وفق الكود العربي السوري 2024', en: 'Smart engineering app for structural design, calculations and drawings per Syrian Arabic Code 2024' },

  // التنقل
  'nav.home': { ar: 'الرئيسية', en: 'Home' },
  'nav.foundation': { ar: 'الأساسات', en: 'Foundations' },
  'nav.beams': { ar: 'الجوائز', en: 'Beams' },
  'nav.slabs': { ar: 'البلاطات', en: 'Slabs' },
  'nav.columns': { ar: 'الأعمدة', en: 'Columns' },
  'nav.settings': { ar: 'الإعدادات', en: 'Settings' },

  // الأساسات
  'foundation.title': { ar: 'تصميم الأساسات', en: 'Foundation Design' },
  'foundation.isolated': { ar: 'أساس منفرد', en: 'Isolated Foundation' },
  'foundation.continuous': { ar: 'أساس مستمر', en: 'Continuous/Strip Foundation' },
  'foundation.combined': { ar: 'أساس مشترك', en: 'Combined Foundation' },
  'foundation.mat': { ar: 'حصيرة عامة', en: 'Mat Foundation' },
  'foundation.codeRef': { ar: 'الكود العربي السوري 2024 - ملحق 5', en: 'Syrian Arabic Code 2024 - Annex 5' },

  // المدخلات - الرموز الكودية السورية (رشيقة ومباشرة)
  'input.width': { ar: 'العرض B', en: 'Width B' },
  'input.length': { ar: 'الطول L', en: 'Length L' },
  'input.depth': { ar: 'منسوب التأسيس D_f', en: 'Founding Depth D_f' },
  'input.thickness': { ar: 'سماكة الأساس t', en: 'Thickness t' },
  'input.axialLoad': { ar: 'الحمولة الشاقولية V', en: 'Vertical Load V' },
  'input.momentX': { ar: 'العزم M_x', en: 'Moment M_x' },
  'input.momentY': { ar: 'العزم M_y', en: 'Moment M_y' },
  'input.horizontalForce': { ar: 'القوة الأفقية H', en: 'Horizontal Force H' },
  'input.bearingCapacity': { ar: 'إجهاد التربة المسموح q', en: 'Allowable Bearing q' },
  'input.soilDensity': { ar: 'كثافة التربة γ', en: 'Soil Density γ' },
  'input.concreteGrade': { ar: 'المقاومة الأسطوانية f\'_c', en: 'Concrete Strength f\'_c' },
  'input.steelGrade': { ar: 'إجهاد الخضوع f_y', en: 'Yield Strength f_y' },
  'input.cover': { ar: 'سماكة التغطية c', en: 'Cover c' },
  'input.columnWidth': { ar: 'عرض العمود b', en: 'Column Width b' },
  'input.columnDepth': { ar: 'عمق العمود h', en: 'Column Depth h' },
  'input.loadCase': { ar: 'حالة التحميل', en: 'Load Case' },
  'input.isSteelColumn': { ar: 'عمود معدني مع صفيحة ارتكاز', en: 'Steel Column with Base Plate' },
  'input.basePlateWidth': { ar: 'عرض صفيحة الارتكاز', en: 'Base Plate Width' },
  'input.basePlateDepth': { ar: 'عمق صفيحة الارتكاز', en: 'Base Plate Depth' },
  'input.barDiameter': { ar: 'قطر السيخ Φ', en: 'Bar Diameter Φ' },
  'input.betaEccentricity': { ar: 'معامل β للقص الثاقب', en: 'Punching Shear β Factor' },
  'input.cohesion': { ar: 'إجهاد التماسك c_w', en: 'Cohesion c_w' },
  'input.deltaFriction': { ar: 'زاوية احتكاك التربة δ', en: 'Soil Friction Angle δ' },

  // حالات التحميل
  'loadCase.1': { ar: 'أحمال دائمة + حية', en: 'Dead + Live' },
  'loadCase.2': { ar: 'أحمال + رياح', en: 'Loads + Wind' },
  'loadCase.3': { ar: 'أحمال + زلزال', en: 'Loads + Seismic' },
  'loadCase.warning': { ar: '⚠ يجب إدخال قيم العزوم والقوى الأفقية المصاحبة لحالة التحميل الديناميكية لضمان صحة توزيع الإجهادات σ₁ و σ₂', en: '⚠ You must enter moments and horizontal forces for this dynamic load case to ensure correct stress distribution σ₁ and σ₂' },

  // ملاحظات التسليح
  'rebar.topNotRequired': { ar: 'غير مطلوب إنشائياً كودياً (توفير هدر)', en: 'Not required structurally per code (material savings)' },
  'rebar.columnStrip': { ar: 'يُضاف تسليح إضافي علوي فوق الأعمدة (شريحة العمود)', en: 'Additional top reinforcement shall be added over columns (column strip)' },
  'rebar.combinedTopMesh': { ar: 'الأساس المشترك يفرض كودياً وجود شبكة علوية كاملة لمقاومة العزم السالب بين العمودين', en: 'Combined footing requires full top mesh to resist negative moment between columns per code' },

  // النتائج - الرموز الكودية السورية
  'result.bearingStress': { ar: 'إجهاد التربة', en: 'Bearing Stress' },
  'result.maxStress': { ar: 'الإجهاد الأكبر σ₁', en: 'Max Stress σ₁' },
  'result.minStress': { ar: 'الإجهاد الأصغر σ₂', en: 'Min Stress σ₂' },
  'result.utilization': { ar: 'نسبة التحقق من إجهاد التربة', en: 'Bearing Verification Ratio' },
  'result.punchingShear': { ar: 'التحقق من إجهاد الثقب للخرسانة', en: 'Punching Shear Verification' },
  'result.oneWayShear': { ar: 'التحقق من جهد القص بالقطاع الحرج', en: 'One-Way Shear Verification' },
  'result.reinforcement': { ar: 'التسليح', en: 'Reinforcement' },
  'result.bottomRebar': { ar: 'تسليح أسفل', en: 'Bottom Reinforcement' },
  'result.topRebar': { ar: 'تسليح أعلى', en: 'Top Reinforcement' },
  'result.overturning': { ar: 'درجة الاستقرار ضد الانقلاب (Base-PSR)', en: 'Overturning Stability (Base-PSR)' },
  'result.sliding': { ar: 'معامل الأمان من الانزلاق (F_s)', en: 'Sliding Safety Factor (F_s)' },
  'result.buoyancy': { ar: 'معامل الأمان من التعويم', en: 'Buoyancy Safety Factor' },
  'result.stability': { ar: 'الاستقرار والثبات', en: 'Stability Checks' },
  'result.magnifiedAllowable': { ar: 'إجهاد التحميل المسموح المكبر', en: 'Magnified Allowable Bearing' },

  // حالات التحقق
  'check.pass': { ar: 'آمن', en: 'Pass' },
  'check.warn': { ar: 'تحذير', en: 'Warning' },
  'check.fail': { ar: 'غير آمن', en: 'Fail' },

  // الأزرار
  'btn.calculate': { ar: 'احسب', en: 'Calculate' },
  'btn.exportPdf': { ar: 'تصدير PDF', en: 'Export PDF' },
  'btn.exportDxf': { ar: 'تصدير DXF', en: 'Export DXF' },
  'btn.save': { ar: 'حفظ', en: 'Save' },
  'btn.reset': { ar: 'إعادة تعيين', en: 'Reset' },
  'btn.print': { ar: 'طباعة', en: 'Print' },

  // الوحدات
  'unit.kn': { ar: 'ك.ن', en: 'kN' },
  'unit.kn_m': { ar: 'ك.ن.م', en: 'kN.m' },
  'unit.kn_m2': { ar: 'ك.ن/م²', en: 'kN/m²' },
  'unit.mm': { ar: 'مم', en: 'mm' },
  'unit.m': { ar: 'م', en: 'm' },
  'unit.mm2': { ar: 'مم²', en: 'mm²' },
  'unit.mpa': { ar: 'م.ب', en: 'MPa' },

  // كود التصميم
  'code.syrian': { ar: 'الكود العربي السوري 2024', en: 'Syrian Arabic Code 2024' },
  'code.aci318': { ar: 'ACI 318-19 أمريكي', en: 'ACI 318-19 American' },
  'code.eurocode2': { ar: 'Eurocode 2 أوروبي', en: 'Eurocode 2 European' },

  // الإعدادات
  'settings.title': { ar: 'الإعدادات', en: 'Settings' },
  'settings.language': { ar: 'اللغة', en: 'Language' },
  'settings.designCode': { ar: 'كود التصميم', en: 'Design Code' },
  'settings.theme': { ar: 'المظهر', en: 'Theme' },
};

/** دالة الترجمة */
export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

/** كل المفاتيح */
export function getAllTranslations(): Record<string, Record<Lang, string>> {
  return translations;
}
