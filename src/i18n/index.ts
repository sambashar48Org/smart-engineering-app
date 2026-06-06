// ============================================================
// نظام الترجمة عربي/إنجليزي - الكود العربي السوري 2024
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
  'foundation.combined': { ar: 'أساس متصل', en: 'Combined Foundation' },
  'foundation.strap': { ar: 'أساس لَبّي', en: 'Strap Foundation' },
  'foundation.mat': { ar: 'حصيرة أساسات', en: 'Mat Foundation' },
  'foundation.codeRef': { ar: 'الكود العربي السوري 2024 - ملحق 5', en: 'Syrian Arabic Code 2024 - Annex 5' },

  // المدخلات
  'input.width': { ar: 'العرض B', en: 'Width B' },
  'input.length': { ar: 'الطول L', en: 'Length L' },
  'input.depth': { ar: 'العمق D', en: 'Depth D' },
  'input.thickness': { ar: 'سماكة اللبشة h', en: 'Slab Thickness h' },
  'input.axialLoad': { ar: 'الحمل الرأسي N (تشغيلي)', en: 'Axial Load N (Service)' },
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
  'input.loadCase': { ar: 'حالة التحميل', en: 'Load Case' },
  'input.isSteelColumn': { ar: 'عمود معدني', en: 'Steel Column' },
  'input.basePlateWidth': { ar: 'عرض الصفيحة', en: 'Base Plate Width' },
  'input.basePlateDepth': { ar: 'عمق الصفيحة', en: 'Base Plate Depth' },
  'input.barDiameter': { ar: 'قطر السيخ', en: 'Bar Diameter' },
  'input.betaEccentricity': { ar: 'معامل β', en: 'β Factor' },
  'input.cohesion': { ar: 'تماسك التربة', en: 'Soil Cohesion' },
  'input.deltaFriction': { ar: 'زاوية الاحتكاك', en: 'Friction Angle' },

  // حالات التحميل
  'loadCase.1': { ar: 'أحمال دائمة + حية', en: 'Dead + Live' },
  'loadCase.2': { ar: 'أحمال + رياح', en: 'Loads + Wind' },
  'loadCase.3': { ar: 'أحمال + زلزال', en: 'Loads + Seismic' },

  // النتائج
  'result.bearingStress': { ar: 'إجهاد التربة', en: 'Bearing Stress' },
  'result.maxStress': { ar: 'الإجهاد الأقصى', en: 'Max Stress' },
  'result.minStress': { ar: 'الإجهاد الأدنى', en: 'Min Stress' },
  'result.utilization': { ar: 'نسبة الاستثمار', en: 'Utilization Ratio' },
  'result.punchingShear': { ar: 'القص الثاقب', en: 'Punching Shear' },
  'result.oneWayShear': { ar: 'القص أحادي', en: 'One-way Shear' },
  'result.reinforcement': { ar: 'التسليح', en: 'Reinforcement' },
  'result.bottomRebar': { ar: 'تسليح أسفل', en: 'Bottom Reinforcement' },
  'result.topRebar': { ar: 'تسليح أعلى', en: 'Top Reinforcement' },
  'result.overturning': { ar: 'معامل أمان الانقلاب', en: 'Overturning Safety Factor' },
  'result.sliding': { ar: 'معامل أمان الانزلاق', en: 'Sliding Safety Factor' },
  'result.buoyancy': { ar: 'معامل أمان التعويم', en: 'Buoyancy Safety Factor' },
  'result.stability': { ar: 'الاستقرار والثبات', en: 'Stability Checks' },

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
