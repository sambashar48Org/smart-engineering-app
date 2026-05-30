// ============================================================
// مكون عرض الرسوم التفاعلية (Canvas)
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/i18n';
import { drawFoundationSection } from '@/modules/foundation/drawings/sectionView';
import { drawPressureDiagram } from '@/modules/foundation/drawings/pressureDiagram';

type DrawingTab = 'section' | 'pressure';

export default function DrawingCanvas() {
  const { inputs, results } = useFoundationStore();
  const { lang } = useAppStore();
  const sectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const pressureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<DrawingTab>('section');
  const [zoom, setZoom] = useState(1);

  /** رسم كل الكانفاسات */
  const redraw = useCallback(() => {
    // رسم المقطع العرضي
    if (sectionCanvasRef.current) {
      const canvas = sectionCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio * zoom;
        canvas.height = rect.height * window.devicePixelRatio * zoom;
        ctx.scale(window.devicePixelRatio * zoom, window.devicePixelRatio * zoom);
        drawFoundationSection(ctx, { ...canvas, width: rect.width, height: rect.height } as HTMLCanvasElement, inputs, results);
      }
    }

    // رسم مخطط الإجهاد
    if (pressureCanvasRef.current) {
      const canvas = pressureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio * zoom;
        canvas.height = rect.height * window.devicePixelRatio * zoom;
        ctx.scale(window.devicePixelRatio * zoom, window.devicePixelRatio * zoom);
        drawPressureDiagram(ctx, { ...canvas, width: rect.width, height: rect.height } as HTMLCanvasElement, inputs, results);
      }
    }
  }, [inputs, results, zoom]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  // ResizeObserver
  useEffect(() => {
    const activeCanvas = activeTab === 'section' ? sectionCanvasRef.current : pressureCanvasRef.current;
    if (!activeCanvas) return;

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(redraw);
    });
    observer.observe(activeCanvas.parentElement!);
    return () => observer.disconnect();
  }, [activeTab, redraw]);

  const tabs: { id: DrawingTab; label: string }[] = [
    { id: 'section', label: lang === 'ar' ? 'المقطع العرضي' : 'Section View' },
    { id: 'pressure', label: lang === 'ar' ? 'توزيع الإجهاد' : 'Pressure Diagram' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* تبويبات */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-100 bg-gray-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* تحكم بالتكبير */}
        <div className="mr-auto flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="w-6 h-6 rounded text-xs bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            −
          </button>
          <span className="text-xs text-gray-500 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="w-6 h-6 rounded text-xs bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* منطقة الرسم */}
      <div className="flex-1 relative bg-white">
        <canvas
          ref={sectionCanvasRef}
          className={`absolute inset-0 w-full h-full ${activeTab === 'section' ? 'block' : 'hidden'}`}
        />
        <canvas
          ref={pressureCanvasRef}
          className={`absolute inset-0 w-full h-full ${activeTab === 'pressure' ? 'block' : 'hidden'}`}
        />

        {/* علامة مائية إذا لم يُحسب بعد */}
        {!results.calculated && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="text-center space-y-2">
              <div className="text-4xl">📐</div>
              <p className="text-sm text-gray-400">
                {lang === 'ar' ? 'أدخل البيانات واضغط "احسب" لعرض الرسم' : 'Enter data and click "Calculate" to see drawing'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
