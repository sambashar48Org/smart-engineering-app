// ============================================================
// نظام الترجمة عربي/إنجليزي
// ============================================================

import type { Lang } from '@/types';

const translations: Record<string, Record<Lang, string>> = {
  // عام
  'app.title': { ar: 'التطبيق الهندسي الذكي', en: 'Smart Engineering App' },
  'app.shortTitle': { ar: 'هندسي ذكي', en: 'SmartEng' },
  'app.description': { ar: 'تطبيق هندسي ذكي للتصميم الإشائي والحسابات والرسوم', en: 'Smart engineering app for structural design, calculations and drawings' },

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
  'foundation.combined': { ar: 'أساس متصل', en: 'Combined Foundation' },
  'foundation.strap': { ar: 'أساس لَبّي', en: 'Strap Foundation' },
  'foundation.mat': { ar: 'حصيرة أساسات', en: 'Mat Foundation' },

  // المدخلات
  'input.width': { ar: 'العرض B', en: 'Width B' },
  'input.length': { ar: 'الطول L', en: 'Length L' },
  'input.depth': { ar: 'العمق D', en: 'Depth D' },
  'input.thickness': { ar: 'سماكة اللبشة h', en: 'Slab Thickness h' },
  'input.axialLoad': { ar: 'الحمل الرأسي N', en: 'Axial Load N' },
  'input.momentX': { ar: 'عزم Mx', en: 'Moment Mx' },
  'input.momentY': { ar: 'عزم My', en: 'Moment My' },
  'input.horizontalForce': { ar: 'قوة أفقية H', en: 'Horizontal Force H' },
  'input.bearingCapacity': { ar: 'إجهاد التربة q_all', en: 'Bearing Capacity q_all' },
  'input.soilDensity': { ar: 'كثافة التربة', en: 'Soil Density' },
  'input.concreteGrade': { ar: 'فئة الخرسانة', en: 'Concrete Grade' },
  'input.steelGrade': { ar: 'فئة الحديد', en: 'Steel Grade' },
  'input.cover': { ar: 'الغطاء الخرساني', en: 'Concrete Cover' },
  'input.columnWidth': { ar: 'عرض العمود', en: 'Column Width' },
  'input.columnDepth': { ar: 'عمق العمود', en: 'Column Depth' },

  // النتائج
  'result.bearingStress': { ar: 'إجهاد التربة', en: 'Bearing Stress' },
  'result.maxStress': { ar: 'الإجهاد الأقصى', en: 'Max Stress' },
  'result.minStress': { ar: 'الإجهاد الأدنى', en: 'Min Stress' },
  'result.utilization': { ar: 'نسبة الاستثمار', en: 'Utilization Ratio' },
  'result.punchingShear': { ar: 'القص الثقب', en: 'Punching Shear' },
  'result.oneWayShear': { ar: 'القص أحادي', en: 'One-way Shear' },
  'result.reinforcement': { ar: 'التسليح', en: 'Reinforcement' },
  'result.bottomRebar': { ar: 'تسليح أسفل', en: 'Bottom Reinforcement' },
  'result.topRebar': { ar: 'تسليح أعلى', en: 'Top Reinforcement' },
  'result.settlement': { ar: 'الهبوط', en: 'Settlement' },

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
  'code.aci318': { ar: 'ACI 318-19 أمريكي', en: 'ACI 318-19 American' },
  'code.eurocode2': { ar: 'Eurocode 2 أوروبي', en: 'Eurocode 2 European' },
  'code.arabic': { ar: 'الكود العربي السوري 2024', en: 'Arabic Syrian Code 2024' },

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
