// ============================================================
// مخزن الحالة الرئيسي (Zustand) - الكود السوري كافتراضي
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang, DesignCode } from '@/types';

interface AppState {
  // الإعدادات العامة
  lang: Lang;
  designCode: DesignCode;
  theme: 'light' | 'dark';

  // إجراءات
  setLang: (lang: Lang) => void;
  setDesignCode: (code: DesignCode) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'ar',
      designCode: 'syrian-code',  // الكود العربي السوري كافتراضي
      theme: 'light',

      setLang: (lang) => set({ lang }),
      setDesignCode: (designCode) => set({ designCode }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'smart-engineering-settings-v2',
    }
  )
);
