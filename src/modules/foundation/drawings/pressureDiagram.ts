// ============================================================
// رسم توزيع الإجهاد تحت الأساس (Pressure Diagram)
// ============================================================

import type { FoundationInputs } from '@/stores/foundationStore';
import type { FoundationResults } from '@/stores/foundationStore';
import type { DrawOptions } from '@/engine/drawing/canvasEngine';
import { DEFAULT_DRAW_OPTIONS, drawLabel, drawDimensionLine } from '@/engine/drawing/canvasEngine';

/** رسم مخطط توزيع الإجهاد */
export function drawPressureDiagram(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputs: FoundationInputs,
  results: FoundationResults,
  customOpts: Partial<DrawOptions> = {}
) {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...customOpts };
  const { width: B, bearingCapacity: qAll } = inputs;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.calculated) {
    ctx.font = opts.textFont;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('أدخل البيانات واحسب لعرض مخطط الإجهاد', canvas.width / 2, canvas.height / 2);
    return;
  }

  const { maxStress: qMax, minStress: qMin } = results;

  // حساب المقياس
  const maxStress = Math.max(qMax, qAll) * 1.2;
  const margin = 60;
  const plotWidth = canvas.width - margin * 2;
  const plotHeight = canvas.height - margin * 2;

  const baseX = margin;
  const baseY = canvas.height - margin;

  // مقياس الأبعاد
  const scaleH = plotWidth / B;
  const scaleV = plotHeight / maxStress;

  // ─── خط الأساس (الأسفل) ───
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + B * scaleH, baseY);
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // ─── خط الإجهاد المسموح ───
  const qAllY = baseY - qAll * scaleV;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(baseX - 10, qAllY);
  ctx.lineTo(baseX + B * scaleH + 10, qAllY);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  drawLabel(ctx, `q_all = ${qAll} kN/m²`, baseX + B * scaleH + 20, qAllY, opts);

  // ─── شكل توزيع الإجهاد ───
  const qMaxY = baseY - qMax * scaleV;
  const qMinY = baseY - qMin * scaleV;

  // شبه منحرف أو مثلث
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX, qMinY);          // اليسار
  ctx.lineTo(baseX + B * scaleH, qMaxY); // اليمين
  ctx.lineTo(baseX + B * scaleH, baseY); // الأساس يمين
  ctx.closePath();

  // تلوين المنطقة
  const isSafe = qMax <= qAll;
  const gradient = ctx.createLinearGradient(baseX, qMaxY, baseX, baseY);
  if (isSafe) {
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)');
  } else {
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
  }
  ctx.fillStyle = gradient;
  ctx.fill();

  // حافة التوزيع
  ctx.beginPath();
  ctx.moveTo(baseX, qMinY);
  ctx.lineTo(baseX + B * scaleH, qMaxY);
  ctx.strokeStyle = isSafe ? '#16a34a' : '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // ─── التسميات ───
  drawLabel(ctx, `q_min = ${qMin} kN/m²`, baseX - 10, qMinY, opts);
  drawLabel(ctx, `q_max = ${qMax} kN/m²`, baseX + B * scaleH + 10, qMaxY, opts);

  // نسبة الاستثمار
  const ratioPercent = (results.utilizationRatio * 100).toFixed(1);
  const ratioColor = results.utilizationRatio <= 0.8 ? '#16a34a' : results.utilizationRatio <= 1.0 ? '#f59e0b' : '#dc2626';

  ctx.font = 'bold 16px Cairo, sans-serif';
  ctx.fillStyle = ratioColor;
  ctx.textAlign = 'center';
  ctx.fillText(`نسبة الاستثمار: ${ratioPercent}%`, canvas.width / 2, margin / 2);

  // ─── أبعاد العرض ───
  drawDimensionLine(ctx, baseX, baseY + 15, baseX + B * scaleH, baseY + 15, `${B} m`, 25, opts);

  // ─── مقياس رسم للإجهاد ───
  ctx.font = '12px Cairo, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'right';
  ctx.fillText('kN/m²', baseX - 5, margin - 10);
}
