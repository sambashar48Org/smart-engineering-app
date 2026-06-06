// ============================================================
// الصفحة الرئيسية - الكود العربي السوري 2024
// ============================================================

import React from 'react';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { Triangle, Square, Columns3, Building2, ArrowLeft, Shield } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const MODULES = [
  {
    id: 'foundation',
    icon: <Triangle size={28} />,
    color: 'from-teal-500 to-teal-700',
    labelAr: 'الأساسات',
    labelEn: 'Foundations',
    descAr: 'تصميم الأساسات المنفردة والمتصلة واللبية وحصيرة الأساسات وفق الكود العربي السوري - ملحق 5',
    descEn: 'Design of isolated, combined, strap and mat foundations per Syrian Arabic Code - Annex 5',
    active: true,
    badge: 'ملحق 5',
  },
  {
    id: 'beams',
    icon: <Square size={28} />,
    color: 'from-blue-500 to-blue-700',
    labelAr: 'الجوائز',
    labelEn: 'Beams',
    descAr: 'تصميم الجوائز البسيطة والمستمرة والكانتيليفر وفق الكود العربي السوري',
    descEn: 'Design of simply-supported, continuous and cantilever beams per Syrian Arabic Code',
    active: false,
  },
  {
    id: 'slabs',
    icon: <Columns3 size={28} />,
    color: 'from-purple-500 to-purple-700',
    labelAr: 'البلاطات',
    labelEn: 'Slabs',
    descAr: 'تصميم البلاطات باتجاه واحد واتجاهين والبلاطات الفطيرة وفق الكود العربي السوري',
    descEn: 'Design of one-way, two-way and flat slabs per Syrian Arabic Code',
    active: false,
  },
  {
    id: 'columns',
    icon: <Building2 size={28} />,
    color: 'from-orange-500 to-orange-700',
    labelAr: 'الأعمدة',
    labelEn: 'Columns',
    descAr: 'تصميم الأعمدة المربعة والدائرية المعرضة لضغط وانحناء وفق الكود العربي السوري',
    descEn: 'Design of square and circular columns under axial load and bending per Syrian Arabic Code',
    active: false,
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const { lang } = useAppStore();

  return (
    <div className="h-full overflow-y-auto">
      {/* البانر الرئيسي */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white px-8 py-10 lg:py-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={20} className="text-teal-300" />
            <span className="text-sm text-teal-200 font-medium">
              {lang === 'ar' ? 'الكود العربي السوري 2024' : 'Syrian Arabic Code 2024'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold mb-3">
            {t('app.title', lang)}
          </h1>
          <p className="text-teal-100 text-sm lg:text-base leading-relaxed">
            {lang === 'ar'
              ? 'منصة هندسية متكاملة للتصميم الإنشائي وفق الكود العربي السوري، تجمع بين الحسابات الحدية والتشغيلية والرسوم التفاعلية والتقارير المهنية في تطبيق واحد ذكي. الطريقة الحدية (ULS) للبيتون والتسليح، والطريقة التشغيلية (SLS) لتحققات التربة والاستقرار.'
              : 'An integrated engineering platform for structural design per the Syrian Arabic Code, combining limit state and serviceability calculations, interactive drawings, and professional reports in one smart app. ULS for concrete and reinforcement, SLS for soil and stability checks.'
            }
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">4</div>
              <div className="text-xs text-teal-200">
                {lang === 'ar' ? 'وحدات تصميم' : 'Design Modules'}
              </div>
            </div>
            <div className="w-px h-10 bg-teal-600" />
            <div className="text-center">
              <div className="text-2xl font-bold">ULS+SLS</div>
              <div className="text-xs text-teal-200">
                {lang === 'ar' ? 'طرق تصميم' : 'Design Methods'}
              </div>
            </div>
            <div className="w-px h-10 bg-teal-600" />
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-teal-200">
                {lang === 'ar' ? 'حالات تحميل' : 'Load Cases'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الوحدات */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          {lang === 'ar' ? 'وحدات التصميم الإنشائي' : 'Structural Design Modules'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => mod.active && onNavigate(mod.id)}
              disabled={!mod.active}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-right transition-all duration-300 ${
                mod.active
                  ? 'hover:shadow-lg hover:border-teal-200 hover:-translate-y-0.5 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                {mod.icon}
              </div>

              <h3 className="text-base font-bold text-gray-900 mb-1.5">
                {lang === 'ar' ? mod.labelAr : mod.labelEn}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {lang === 'ar' ? mod.descAr : mod.descEn}
              </p>

              {mod.active && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowLeft size={20} className="text-teal-600" />
                </div>
              )}

              {!mod.active && (
                <span className="absolute top-4 left-4 text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-full">
                  {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                </span>
              )}

              {mod.active && mod.badge && (
                <span className="absolute top-4 left-4 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-semibold">
                  {mod.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
