// ============================================================
// رسم مقطع الأساس العرضي (Section View)
// الكود العربي السوري 2024 - يدعم العمود المعدني والشد
// المنطق الذكي:
//   منفرد/مستمر = تسليح سفلي فقط (بدون شبكة علوية)
//   حصيرة/مشترك = شبكتان كاملتان (علوية + سفلية)
// الرموز الكودية: t, D_f, σ₁
// ============================================================

import type { FoundationInputs } from '@/stores/foundationStore';
import type { FoundationResults } from '@/stores/foundationStore';
import type { DrawOptions } from '@/engine/drawing/canvasEngine';
import { DEFAULT_DRAW_OPTIONS, drawFilledRect, drawDimensionLine, drawHatching, drawRebarDot, drawLabel } from '@/engine/drawing/canvasEngine';

/** رسم المقطع العرضي الكامل */
export function drawFoundationSection(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputs: FoundationInputs,
  results: FoundationResults,
  customOpts: Partial<DrawOptions> = {}
) {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...customOpts };
  const { B, L, D_f, t, columnWidth: c1, columnDepth: c2, cover, isSteelColumn, basePlateWidth, basePlateDepth } = inputs;
  const isRaftOrCombined = inputs.type === 'mat' || inputs.type === 'combined';

  // تنظيف Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // حساب المقياس تلقائياً
  const maxW = canvas.width - 200;
  const maxH = canvas.height - 150;
  const scaleX = maxW / (B * 1.2);
  const scaleY = maxH / (D_f * 1.5);
  const scale = Math.min(scaleX, scaleY);

  // نقطة المركز
  const centerX = canvas.width / 2;
  const baseY = canvas.height - 80;

  // أبعاد بالبكسل
  const bPx = B * scale;
  const dPx = D_f * scale;
  const tPx = t * scale;
  const c1Px = c1 * scale;

  // ─── التربة (خلفية) ───
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(centerX - bPx / 2 - 30, baseY - dPx, bPx + 60, dPx + 40);

  drawHatching(
    ctx,
    centerX - bPx / 2 - 30,
    baseY - dPx,
    bPx + 60,
    dPx + 40,
    10,
    45,
    '#d97706'
  );

  // ─── جسم الأساس (الخرسانة) ───
  drawFilledRect(
    ctx,
    centerX - bPx / 2,
    baseY - tPx,
    bPx,
    tPx,
    opts.concreteColor,
    opts.color,
    opts.lineWidth
  );

  drawHatching(
    ctx,
    centerX - bPx / 2,
    baseY - tPx,
    bPx,
    tPx,
    15,
    -45,
    '#a1a1aa'
  );

  // ─── العمود ───
  const colHeight = dPx * 0.5;

  if (isSteelColumn) {
    const steelWidth = c1Px * 0.6;

    drawFilledRect(
      ctx,
      centerX - steelWidth / 2,
      baseY - tPx - colHeight,
      steelWidth,
      colHeight,
      '#64748b',
      '#475569',
      opts.lineWidth
    );

    // صفيحة الارتكاز (Base Plate)
    const bpW = (basePlateWidth || c1) * scale;
    const bpH = Math.max(8, tPx * 0.08);
    drawFilledRect(
      ctx,
      centerX - bpW / 2,
      baseY - tPx - bpH,
      bpW,
      bpH,
      '#475569',
      '#334155',
      opts.lineWidth + 1
    );

    // خط القطاع الحرج للعمود المعدني
    const midPlate = ((basePlateDepth || c2) + c2) / 2 * scale;
    const criticalLineX = centerX - bPx / 2 + (bPx - midPlate) / 2;

    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(criticalLineX, baseY - tPx);
    ctx.lineTo(criticalLineX, baseY);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    drawLabel(ctx, 'القطاع الحرج', criticalLineX, baseY - tPx - 15, opts);
  } else {
    // عمود خرساني عادي
    drawFilledRect(
      ctx,
      centerX - c1Px / 2,
      baseY - tPx - colHeight,
      c1Px,
      colHeight,
      '#94a3b8',
      opts.color,
      opts.lineWidth
    );

    // خط القطاع الحرج للعمود الخرساني (عند وجه العمود)
    const criticalX = centerX - c1Px / 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(criticalX, baseY - tPx);
    ctx.lineTo(criticalX, baseY);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    drawLabel(ctx, 'القطاع الحرج', criticalX, baseY - tPx - 15, opts);
  }

  // ══════════════════════════════════════
  // التسليح - المنطق الذكي
  // ══════════════════════════════════════
  if (opts.showRebar && results.calculated) {
    const dEffective = (t * 1000 - cover - 10) / 1000;
    const rebarDepth = dEffective * scale;

    // ── أسياخ سفلية (دائماً موجودة) ──
    const rebarY = baseY - rebarDepth;
    ctx.beginPath();
    ctx.moveTo(centerX - bPx / 2 + 10, rebarY);
    ctx.lineTo(centerX + bPx / 2 - 10, rebarY);
    ctx.strokeStyle = opts.rebarColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // نقاط الأسياخ السفلية
    if (results.bottomRebarX.diameter > 0) {
      const spacing = results.bottomRebarX.spacing * scale / 1000;
      const startX = centerX - bPx / 2 + 20;
      const endX = centerX + bPx / 2 - 20;
      for (let x = startX; x <= endX; x += Math.max(spacing, 15)) {
        drawRebarDot(ctx, x, rebarY, 6, opts.rebarColor);
      }
    }

    // تسمية التسليح السفلي
    drawLabel(ctx, 'فرش سفلي', centerX + bPx / 2 + 5, rebarY - 10, opts);

    // ── أسياخ علوية (فقط للحصيرة/المشترك) ──
    if (isRaftOrCombined && results.topRebarRequired) {
      const topRebarY = baseY - tPx + 15;
      ctx.beginPath();
      ctx.moveTo(centerX - bPx / 2 + 10, topRebarY);
      ctx.lineTo(centerX + bPx / 2 - 10, topRebarY);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.stroke();

      // نقاط الأسياخ العلوية
      if (results.topRebarX.diameter > 0) {
        const topSpacing = results.topRebarX.spacing * scale / 1000;
        const startX = centerX - bPx / 2 + 20;
        const endX = centerX + bPx / 2 - 20;
        for (let x = startX; x <= endX; x += Math.max(topSpacing, 15)) {
          drawRebarDot(ctx, x, topRebarY, 6, '#f97316');
        }
      }

      // تسمية التسليح العلوي
      drawLabel(ctx, 'غطاء علوي', centerX + bPx / 2 + 5, topRebarY - 10, opts);
    }
    // منفرد/مستمر: لا نرسم أي شيء علوي - التسليح السفلي فقط (الفرش والغطاء)
  }

  // ─── منطقة الشد (إن وجدت) ───
  if (results.calculated && results.hasTension) {
    const compressedFraction = results.compressedLength / L;
    const tensionStartX = centerX - bPx / 2;
    const tensionWidth = bPx * (1 - compressedFraction);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.fillRect(tensionStartX, baseY - tPx, tensionWidth, tPx);

    ctx.font = 'bold 12px Cairo, sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText('منطقة شد', tensionStartX + tensionWidth / 2, baseY - tPx / 2);
  }

  // ─── خطوط الأبعاد ───
  if (opts.showDimensions) {
    drawDimensionLine(
      ctx,
      centerX - bPx / 2,
      baseY + 15,
      centerX + bPx / 2,
      baseY + 15,
      `B = ${B} m`,
      30,
      opts
    );

    drawDimensionLine(
      ctx,
      centerX + bPx / 2 + 15,
      baseY,
      centerX + bPx / 2 + 15,
      baseY - tPx,
      `t = ${t} m`,
      30,
      opts
    );

    drawDimensionLine(
      ctx,
      centerX - bPx / 2 - 15,
      baseY,
      centerX - bPx / 2 - 15,
      baseY - dPx,
      `D_f = ${D_f} m`,
      30,
      opts
    );

    drawDimensionLine(
      ctx,
      centerX - c1Px / 2,
      baseY - tPx - colHeight - 10,
      centerX + c1Px / 2,
      baseY - tPx - colHeight - 10,
      `${c1} m`,
      15,
      opts
    );
  }

  // ─── التسميات ───
  if (opts.showLabels) {
    drawLabel(ctx, 'خرسانة', centerX, baseY - tPx / 2, opts);

    if (isSteelColumn) {
      drawLabel(ctx, 'عمود معدني', centerX, baseY - tPx - colHeight / 2, opts);
    } else {
      drawLabel(ctx, 'عمود', centerX, baseY - tPx - colHeight / 2, opts);
    }

    drawLabel(ctx, 'تربة', centerX + bPx / 2 - 30, baseY - dPx + 20, opts);

    if (results.calculated) {
      drawLabel(
        ctx,
        `σ₁ = ${results.sigma_1} kN/m²`,
        centerX,
        baseY + 55,
        opts
      );
    }
  }

  // ─── خط مستوى التأسيس ───
  const groundLevel = baseY - dPx;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX - bPx / 2 - 40, groundLevel);
  ctx.lineTo(centerX + bPx / 2 + 40, groundLevel);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, 'مستوى التأسيس', centerX + bPx / 2 + 20, groundLevel - 10, opts);

  // ─── شارة الكود السوري ───
  ctx.font = '10px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'left';
  ctx.fillText('الكود العربي السوري - ملحق 5', 10, 15);
}
