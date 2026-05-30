// ============================================================
// رسم مقطع الأساس العرضي (Section View)
// ============================================================

import type { FoundationInputs } from '@/stores/foundationStore';
import type { FoundationResults } from '@/stores/foundationStore';
import type { DrawOptions } from '@/engine/drawing/canvasEngine';
import { DEFAULT_DRAW_OPTIONS, drawFilledRect, drawDimensionLine, drawHatching, drawRebarDot, drawLabel, drawLine } from '@/engine/drawing/canvasEngine';

/** رسم المقطع العرضي الكامل */
export function drawFoundationSection(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputs: FoundationInputs,
  results: FoundationResults,
  customOpts: Partial<DrawOptions> = {}
) {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...customOpts };
  const { width: B, depth: D, thickness: h, columnWidth: c1, cover } = inputs;

  // تنظيف Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // حساب المقياس تلقائياً
  const maxW = canvas.width - 200;
  const maxH = canvas.height - 150;
  const scaleX = maxW / (B * 1.2);
  const scaleY = maxH / (D * 1.5);
  const scale = Math.min(scaleX, scaleY);

  // نقطة المركز
  const centerX = canvas.width / 2;
  const baseY = canvas.height - 80;

  // أبعاد بالبكسل
  const bPx = B * scale;
  const dPx = D * scale;
  const hPx = h * scale;
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
    baseY - hPx,
    bPx,
    hPx,
    opts.concreteColor,
    opts.color,
    opts.lineWidth
  );

  // تظليل خفيف داخل الخرسانة
  drawHatching(
    ctx,
    centerX - bPx / 2,
    baseY - hPx,
    bPx,
    hPx,
    15,
    -45,
    '#a1a1aa'
  );

  // ─── العمود ───
  const colHeight = dPx * 0.5;
  drawFilledRect(
    ctx,
    centerX - c1Px / 2,
    baseY - hPx - colHeight,
    c1Px,
    colHeight,
    '#94a3b8',
    opts.color,
    opts.lineWidth
  );

  // ─── التسليح ───
  if (opts.showRebar && results.calculated) {
    const dEffective = (h * 1000 - cover - 10) / 1000; // m
    const rebarDepth = dEffective * scale;

    // أسياخ سفلية (خط أحمر)
    const rebarY = baseY - rebarDepth;
    ctx.beginPath();
    ctx.moveTo(centerX - bPx / 2 + 10, rebarY);
    ctx.lineTo(centerX + bPx / 2 - 10, rebarY);
    ctx.strokeStyle = opts.rebarColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // نقاط الأسياخ
    if (results.bottomRebarX.diameter > 0) {
      const spacing = results.bottomRebarX.spacing * scale / 1000;
      const startX = centerX - bPx / 2 + 20;
      const endX = centerX + bPx / 2 - 20;
      for (let x = startX; x <= endX; x += Math.max(spacing, 15)) {
        drawRebarDot(ctx, x, rebarY, 6, opts.rebarColor);
      }
    }

    // أسياخ علوية
    const topRebarY = baseY - hPx + 15;
    ctx.beginPath();
    ctx.moveTo(centerX - bPx / 2 + 10, topRebarY);
    ctx.lineTo(centerX + bPx / 2 - 10, topRebarY);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ─── خطوط الأبعاد ───
  if (opts.showDimensions) {
    // عرض الأساس
    drawDimensionLine(
      ctx,
      centerX - bPx / 2,
      baseY + 15,
      centerX + bPx / 2,
      baseY + 15,
      `${B} m`,
      30,
      opts
    );

    // سماكة اللبشة
    drawDimensionLine(
      ctx,
      centerX + bPx / 2 + 15,
      baseY,
      centerX + bPx / 2 + 15,
      baseY - hPx,
      `${h} m`,
      30,
      opts
    );

    // العمق الكلي
    drawDimensionLine(
      ctx,
      centerX - bPx / 2 - 15,
      baseY,
      centerX - bPx / 2 - 15,
      baseY - dPx,
      `${D} m`,
      30,
      opts
    );

    // عرض العمود
    drawDimensionLine(
      ctx,
      centerX - c1Px / 2,
      baseY - hPx - colHeight - 10,
      centerX + c1Px / 2,
      baseY - hPx - colHeight - 10,
      `${c1} m`,
      15,
      opts
    );
  }

  // ─── التسميات ───
  if (opts.showLabels) {
    drawLabel(ctx, 'خرسانة', centerX, baseY - hPx / 2, opts);
    drawLabel(ctx, 'عمود', centerX, baseY - hPx - colHeight / 2, opts);
    drawLabel(ctx, 'تربة', centerX + bPx / 2 - 30, baseY - dPx + 20, opts);

    if (results.calculated) {
      drawLabel(
        ctx,
        `q_max = ${results.maxStress} kN/m²`,
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
}
