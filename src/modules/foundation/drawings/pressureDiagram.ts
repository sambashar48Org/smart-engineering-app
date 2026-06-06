// ============================================================
// رسم توزيع الإجهاد تحت الأساس (Pressure Diagram)
// الكود العربي السوري 2024 - يدعم الشد والتوزيع المثلثي
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
  const { width: B, length: L, loadCase, bearingCapacity: qAll } = inputs;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.calculated) {
    ctx.font = opts.textFont;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('أدخل البيانات واحسب لعرض مخطط الإجهاد', canvas.width / 2, canvas.height / 2);
    return;
  }

  const { maxStress: qMax, minStress: qMin, allowableModified: qAllowable, hasTension, compressedLength } = results;

  // حساب المقياس
  const maxStress = Math.max(qMax, qAll) * 1.2;
  const margin = 70;
  const plotWidth = canvas.width - margin * 2;
  const plotHeight = canvas.height - margin * 2;

  const baseX = margin;
  const baseY = canvas.height - margin;

  // مقياس الأبعاد والإجهاد
  const scaleH = plotWidth / B;
  const scaleV = plotHeight / maxStress;

  // ─── خط الأساس (الأسفل) ───
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + B * scaleH, baseY);
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // ─── خط الإجهاد المسموح الاستاتيكي ───
  const qAllY = baseY - qAll * scaleV;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(baseX - 10, qAllY);
  ctx.lineTo(baseX + B * scaleH + 10, qAllY);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, `q_all = ${qAll} kN/m²`, baseX + B * scaleH + 20, qAllY, opts);

  // ─── خط الإجهاد المسموح المعدّل ───
  if (loadCase !== 1) {
    const qModY = baseY - qAllowable * scaleV;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(baseX - 10, qModY);
    ctx.lineTo(baseX + B * scaleH + 10, qModY);
    ctx.strokeStyle = loadCase === 3 ? '#dc2626' : '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    const modLabel = loadCase === 3
      ? `q_زلزال = ${qAllowable} kN/m²`
      : `q_رياح = ${qAllowable} kN/m²`;
    drawLabel(ctx, modLabel, baseX - 30, qModY, opts);
  }

  // ─── شكل توزيع الإجهاد ───
  const qMaxY = baseY - qMax * scaleV;
  const qMinY = baseY - qMin * scaleV;

  if (hasTension) {
    // توزيع مثلثي مع منطقة شد
    const compressedWidth = compressedLength * scaleH;

    // المنطقة المضغوطة (مثلث)
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX + compressedWidth, qMaxY);
    ctx.lineTo(baseX + compressedWidth, baseY);
    ctx.closePath();

    // تلوين المنطقة المضغوطة
    const isSeismicSafe = compressedLength >= L / 2;
    const gradient = ctx.createLinearGradient(baseX, qMaxY, baseX, baseY);
    if (isSeismicSafe) {
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
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX + compressedWidth, qMaxY);
    ctx.strokeStyle = isSeismicSafe ? '#16a34a' : '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // منطقة الشد (تظليل أحمر)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(baseX + compressedWidth, baseY - (qMax * scaleV * 0.3), B * scaleH - compressedWidth, qMax * scaleV * 0.3 + 1);

    // خط الشد
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(baseX + compressedWidth, qMaxY);
    ctx.lineTo(baseX + compressedWidth, baseY);
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // تسمية منطقة الشد
    ctx.font = '11px Cairo, sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText('شد (انفصال)', baseX + compressedWidth + (B * scaleH - compressedWidth) / 2, baseY - 15);

    // شرط الزلزال
    if (loadCase === 3) {
      const halfL = L / 2;
      const conditionMet = compressedLength >= halfL;
      ctx.font = 'bold 12px Cairo, sans-serif';
      ctx.fillStyle = conditionMet ? '#16a34a' : '#dc2626';
      ctx.textAlign = 'center';
      ctx.fillText(
        conditionMet
          ? `✓ المنطقة المضغوطة (${compressedLength.toFixed(2)}m) ≥ L/2 (${halfL.toFixed(2)}m)`
          : `✗ المنطقة المضغوطة (${compressedLength.toFixed(2)}m) < L/2 (${halfL.toFixed(2)}m)`,
        canvas.width / 2,
        margin / 2 + 15
      );
    }
  } else {
    // توزيع شبه منحرف عادي
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX, qMinY);
    ctx.lineTo(baseX + B * scaleH, qMaxY);
    ctx.lineTo(baseX + B * scaleH, baseY);
    ctx.closePath();

    // تلوين المنطقة
    const isSafe = qMax <= qAllowable;
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
  }

  // ─── التسميات ───
  if (hasTension) {
    drawLabel(ctx, `q_max = ${qMax} kN/m²`, baseX + compressedLength * scaleH + 10, qMaxY, opts);
    drawLabel(ctx, `q_min = 0 (شد)`, baseX - 10, baseY - 10, opts);
  } else {
    drawLabel(ctx, `q_min = ${qMin} kN/m²`, baseX - 10, qMinY, opts);
    drawLabel(ctx, `q_max = ${qMax} kN/m²`, baseX + B * scaleH + 10, qMaxY, opts);
  }

  // نسبة الاستثمار
  const ratioPercent = results.investmentRatio.toFixed(1);
  const ratioColor = results.investmentRatio <= 80 ? '#16a34a' : results.investmentRatio <= 100 ? '#f59e0b' : '#dc2626';

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

  // ─── شارة الكود ───
  ctx.font = '10px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'left';
  ctx.fillText('الكود العربي السوري - ملحق 5', 10, 15);

  // ─── شارة حالة التحميل ───
  const loadCaseLabels = {
    1: { text: 'أحمال دائمة + حية', color: '#16a34a' },
    2: { text: 'أحمال + رياح', color: '#2563eb' },
    3: { text: 'أحمال + زلزال', color: '#dc2626' },
  };
  const lc = loadCaseLabels[inputs.loadCase];
  ctx.font = 'bold 11px Cairo, sans-serif';
  ctx.fillStyle = lc.color;
  ctx.textAlign = 'right';
  ctx.fillText(lc.text, canvas.width - 10, 15);
}
