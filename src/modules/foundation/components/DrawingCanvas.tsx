// ============================================================
// مكون شاشة العرض الهندسي المطور (Canvas Framework)
// ============================================================

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFoundationStore } from '@/stores/foundationStore';
import { useAppStore } from '@/stores/appStore';
import { drawFoundationSection } from '@/modules/foundation/drawings/sectionView';
import { drawPressureDiagram } from '@/modules/foundation/drawings/pressureDiagram';
import { ZoomIn, ZoomOut } from 'lucide-react';

type DrawingTab = 'structural' | 'soil_pressure';

export default function DrawingCanvas() {
  const { inputs, results } = useFoundationStore();
  const { lang } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<DrawingTab>('structural');
  const [zoom, setZoom] = useState(1.0);

  const redraw = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const logicalWidth = rect?.width || 600;
    const logicalHeight = rect?.height || 500;
    canvas.width = logicalWidth * window.devicePixelRatio;
    canvas.height = logicalHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio * zoom, window.devicePixelRatio * zoom);

    // رسم على كانفاس بأبعاد منطقية
    const logicalCanvas = { ...canvas, width: logicalWidth, height: logicalHeight } as HTMLCanvasElement;

    if (activeTab === 'structural') {
      drawFoundationSection(ctx, logicalCanvas, inputs, results, { showLabels: true });
    } else {
      drawPressureDiagram(ctx, logicalCanvas, inputs, results);
    }
  }, [inputs, results, activeTab, zoom]);

  useEffect(() => {
    redraw();
    window.addEventListener('resize', redraw);
    return () => window.removeEventListener('resize', redraw);
  }, [redraw]);

  // ResizeObserver للمراقبة الدقيقة
  useEffect(() => {
    if (!canvasRef.current?.parentElement) return;
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(redraw);
    });
    observer.observe(canvasRef.current.parentElement);
    return () => observer.disconnect();
  }, [redraw]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      {/* شريط التبويبات والتحكم */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('structural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'structural'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '📐 المخطط الإنشائي المتكامل' : 'Structural Plan & Section'}
          </button>
          <button
            onClick={() => setActiveTab('soil_pressure')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'soil_pressure'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ar' ? '📊 مخطط إجهادات التربة' : 'Soil Pressure Diagram'}
          </button>
        </div>

        {/* تحكم بالتكبير */}
        <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
          <button
            onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[11px] font-mono text-slate-500 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* منطقة الرسم */}
      <div className="flex-1 relative bg-white m-2 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {!results.calculated && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 text-slate-400 text-xs font-medium">
            {lang === 'ar' ? 'يرجى الضغط على زر الحساب لتوليد المخططات الهندسية' : 'Awaiting computation to render vector graphics...'}
          </div>
        )}
      </div>
    </div>
  );
}
