// ============================================================
// مخزن بيانات الأساسات
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FoundationType, CheckResult } from '@/types';

/** مدخلات الأساس */
export interface FoundationInputs {
  type: FoundationType;
  width: number;       // B (m)
  length: number;      // L (m)
  depth: number;       // D (m)
  thickness: number;   // h (m) - slab thickness
  axialLoad: number;   // N (kN)
  momentX: number;     // Mx (kN.m)
  momentY: number;     // My (kN.m)
  horizontalForce: number; // H (kN)
  bearingCapacity: number; // q_all (kN/m²)
  soilDensity: number;     // γ (kN/m³)
  concreteGrade: string;   // e.g. 'C25/30'
  steelGrade: string;      // e.g. 'B400'
  cover: number;           // (mm)
  columnWidth: number;     // (m)
  columnDepth: number;     // (m)
}

/** نتائج حسابات الأساس */
export interface FoundationResults {
  maxStress: number;       // q_max (kN/m²)
  minStress: number;       // q_min (kN/m²)
  netStress: number;       // q_net (kN/m²)
  utilizationRatio: number; // q_max / q_all
  checks: CheckResult[];
  bottomRebarX: { diameter: number; spacing: number; area: number };
  bottomRebarY: { diameter: number; spacing: number; area: number };
  topRebarX: { diameter: number; spacing: number; area: number };
  topRebarY: { diameter: number; spacing: number; area: number };
  calculated: boolean;
}

interface FoundationState {
  inputs: FoundationInputs;
  results: FoundationResults;

  setInputs: (inputs: Partial<FoundationInputs>) => void;
  setResults: (results: FoundationResults) => void;
  resetInputs: () => void;
  resetAll: () => void;
}

const defaultInputs: FoundationInputs = {
  type: 'isolated',
  width: 2.5,
  length: 3.0,
  depth: 0.6,
  thickness: 0.4,
  axialLoad: 450,
  momentX: 30,
  momentY: 15,
  horizontalForce: 25,
  bearingCapacity: 250,
  soilDensity: 18,
  concreteGrade: 'C25/30',
  steelGrade: 'B400',
  cover: 50,
  columnWidth: 0.4,
  columnDepth: 0.4,
};

const defaultResults: FoundationResults = {
  maxStress: 0,
  minStress: 0,
  netStress: 0,
  utilizationRatio: 0,
  checks: [],
  bottomRebarX: { diameter: 0, spacing: 0, area: 0 },
  bottomRebarY: { diameter: 0, spacing: 0, area: 0 },
  topRebarX: { diameter: 0, spacing: 0, area: 0 },
  topRebarY: { diameter: 0, spacing: 0, area: 0 },
  calculated: false,
};

export const useFoundationStore = create<FoundationState>()(
  persist(
    (set) => ({
      inputs: { ...defaultInputs },
      results: { ...defaultResults },

      setInputs: (newInputs) =>
        set((state) => ({
          inputs: { ...state.inputs, ...newInputs },
        })),

      setResults: (results) => set({ results }),

      resetInputs: () => set({ inputs: { ...defaultInputs }, results: { ...defaultResults } }),
      resetAll: () => set({ inputs: { ...defaultInputs }, results: { ...defaultResults } }),
    }),
    {
      name: 'smart-engineering-foundation',
    }
  )
);
