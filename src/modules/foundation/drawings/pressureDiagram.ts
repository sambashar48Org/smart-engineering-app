// ============================================================
// رسم توزيع الإجهاد تحت الأساس (Pressure Diagram)
// الكود العربي السوري 2024 - يدعم الشد والتوزيع المثلثي
// الرموز الكودية: σ₁, σ₂, q, q_magnified, t, D_f
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
  const { B, L, loadCase, q_allowable } = inputs;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results.calculated) {
    ctx.font = opts.textFont;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('أدخل البيانات واحسب لعرض مخطط الإجهاد', canvas.width / 2, canvas.height / 2);
    return;
  }

  const { sigma_1, sigma_2, q_magnified, hasTension, compressedLength } = results;

  // حساب المقياس
  const maxStress = Math.max(sigma_1, q_allowable) * 1.2;
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

  // ─── خط الإجهاد المسموح الاستاتيكي q ───
  const qAllY = baseY - q_allowable * scaleV;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(baseX - 10, qAllY);
  ctx.lineTo(baseX + B * scaleH + 10, qAllY);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, `q = ${q_allowable} kN/m²`, baseX + B * scaleH + 20, qAllY, opts);

  // ─── خط الإجهاد المسموح المكبر q_magnified ───
  if (loadCase !== 1) {
    const qModY = baseY - q_magnified * scaleV;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(baseX - 10, qModY);
    ctx.lineTo(baseX + B * scaleH + 10, qModY);
    ctx.strokeStyle = loadCase === 3 ? '#dc2626' : '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    const modLabel = loadCase === 3
      ? `q_زلزال = ${q_magnified} kN/m²`
      : `q_رياح = ${q_magnified} kN/m²`;
    // إزاحة 20px لأعلى لمنع تداخل النصوص
    drawLabel(ctx, modLabel, baseX - 30, qModY - 20, opts);
  }

  // ─── شكل توزيع الإجهاد ───
  const q1Y = baseY - sigma_1 * scaleV; // σ₁ (الإجهاد الأكبر)
  const q2Y = baseY - sigma_2 * scaleV; // σ₂ (الإجهاد الأصغر)

  if (hasTension) {
    // توزيع مثلثي مع منطقة شد
    const compressedWidth = compressedLength * scaleH;

    // المنطقة المضغوطة (مثلث)
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX + compressedWidth, q1Y);
    ctx.lineTo(baseX + compressedWidth, baseY);
    ctx.closePath();

    // تلوين المنطقة المضغوطة
    const isSeismicSafe = compressedLength >= L / 2;
    const gradient = ctx.createLinearGradient(baseX, q1Y, baseX, baseY);
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
    ctx.lineTo(baseX + compressedWidth, q1Y);
    ctx.strokeStyle = isSeismicSafe ? '#16a34a' : '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // منطقة الشد (تظليل أحمر)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(baseX + compressedWidth, baseY - (sigma_1 * scaleV * 0.3), B * scaleH - compressedWidth, sigma_1 * scaleV * 0.3 + 1);

    // خط الشد
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(baseX + compressedWidth, q1Y);
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
    ctx.lineTo(baseX, q2Y);
    ctx.lineTo(baseX + B * scaleH, q1Y);
    ctx.lineTo(baseX + B * scaleH, baseY);
    ctx.closePath();

    // تلوين المنطقة
    const isSafe = sigma_1 <= q_allowable;
    const gradient = ctx.createLinearGradient(baseX, q1Y, baseX, baseY);
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
    ctx.moveTo(baseX, q2Y);
    ctx.lineTo(baseX + B * scaleH, q1Y);
    ctx.strokeStyle = isSafe ? '#16a34a' : '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // ─── التسميات الكودية ───
  if (hasTension) {
    drawLabel(ctx, `σ₁ = ${sigma_1} kN/m²`, baseX + compressedLength * scaleH + 10, q1Y, opts);
    drawLabel(ctx, `σ₂ = 0 (شد)`, baseX - 10, baseY - 10, opts);
  } else {
    drawLabel(ctx, `σ₂ = ${sigma_2} kN/m²`, baseX - 10, q2Y, opts);
    drawLabel(ctx, `σ₁ = ${sigma_1} kN/m²`, baseX + B * scaleH + 10, q1Y, opts);
  }

  // نسبة التحقق من إجهاد التربة (بدلاً من نسبة الاستثمار)
  const ratioPercent = results.bearingVerificationRatio.toFixed(1);
  const ratioColor = results.bearingVerificationRatio <= 80 ? '#16a34a' : results.bearingVerificationRatio <= 100 ? '#f59e0b' : '#dc2626';

  ctx.font = 'bold 16px Cairo, sans-serif';
  ctx.fillStyle = ratioColor;
  ctx.textAlign = 'center';
  ctx.fillText(`نسبة التحقق من إجهاد التربة: ${ratioPercent}%`, canvas.width / 2, margin / 2);

  // ─── أبعاد العرض ───
  drawDimensionLine(ctx, baseX, baseY + 15, baseX + B * scaleH, baseY + 15, `B = ${B} m`, 25, opts);

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
