// ============================================================
// رسم الأساس - مسقط أفقي + مقطع عرضي متكامل
// الكود العربي السوري 2024 - ملحق 5
// المسقط: شبكة تسليح سفلي+علوي باتجاهين X,Y
// المقطع: موقع التسليح الدقيق + الأبعاد بدون تداخل
// ============================================================

import type { FoundationInputs } from '@/stores/foundationStore';
import type { FoundationResults } from '@/stores/foundationStore';
import type { DrawOptions } from '@/engine/drawing/canvasEngine';
import {
  DEFAULT_DRAW_OPTIONS, drawFilledRect, drawDimensionLine,
  drawHatching, drawRebarDot, drawLabel
} from '@/engine/drawing/canvasEngine';

/** رسم المسقط الأفقي + المقطع العرضي */
export function drawFoundationSection(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputs: FoundationInputs,
  results: FoundationResults,
  customOpts: Partial<DrawOptions> = {}
) {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...customOpts };
  const {
    B, L, D_f, t, columnWidth: c1, columnDepth: c2,
    cover, isSteelColumn, basePlateWidth, basePlateDepth
  } = inputs;

  const isIsolated = inputs.type === 'isolated';
  const isContinuous = inputs.type === 'continuous';
  const isCombined = inputs.type === 'combined';
  const isRaft = inputs.type === 'mat';
  const showTopRebar = (isCombined || isRaft) && results.topRebarRequired;

  // ═══ تنظيف ═══
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ═══ تقسيم اللوحة: أعلى = مسقط، أسفل = مقطع ═══
  const W = canvas.width;
  const H = canvas.height;
  const dividerY = H * 0.44;   // خط الفاصل بين المسقط والمقطع
  const marginX = 60;
  const marginY = 30;

  // ──────────────────────────────────────────────
  //  الجزء الأول: المسقط الأفقي (Plan View)
  // ──────────────────────────────────────────────
  const planArea = {
    x: marginX,
    y: marginY + 10,
    w: W - marginX * 2,
    h: dividerY - marginY * 2 - 10,
  };

  // مقياس المسقط
  const planScaleX = planArea.w / (B * 1.3);
  const planScaleY = planArea.h / (L * 1.3);
  const planScale = Math.min(planScaleX, planScaleY);

  const bPlan = B * planScale;
  const lPlan = L * planScale;
  const planCX = planArea.x + planArea.w / 2;
  const planCY = planArea.y + planArea.h / 2;

  // عنوان المسقط
  ctx.save();
  ctx.font = 'bold 13px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('المسقط الأفقي', planCX, planArea.y - 5);
  ctx.restore();

  // ── جسم الأساس (مستطيل B × L) ──
  const planLeft = planCX - bPlan / 2;
  const planTop = planCY - lPlan / 2;

  // خلفية خرسانة فاتحة
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(planLeft, planTop, bPlan, lPlan);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(planLeft, planTop, bPlan, lPlan);

  // ── العمود / الجدار على المسقط ──
  if (isContinuous) {
    // جدار ممتد على المحور الطولي
    const wallB = bPlan * 0.6;
    const wallL = lPlan * 0.85;
    const wallLeft = planCX - wallB / 2;
    const wallTop = planCY - wallL / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(wallLeft, wallTop, wallB, wallL);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wallLeft, wallTop, wallB, wallL);
    // تسمية
    ctx.save();
    ctx.font = '10px Cairo, sans-serif';
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('جدار', planCX, planCY);
    ctx.restore();
  } else if (isCombined) {
    // عمودان على المسقط — المحور بينهما باتجاه L (الطول)
    const L_span = inputs.L_span || 4.5;
    const c_w2 = inputs.c_width2 || 0.4;
    const c_d2 = inputs.c_depth2 || 0.4;
    const c1PlanB = c1 * planScale;
    const c1PlanL = c2 * planScale;
    const c2PlanB = c_w2 * planScale;
    const c2PlanL = c_d2 * planScale;
    // المسافة بين العمودين باتجاه L — تحجيم لتناسب داخل المستطيل
    const spanPlanL = Math.min(L_span * planScale, lPlan - c1PlanL / 2 - c2PlanL / 2 - 10);

    // العمود 1 (أعلى المسقط)
    const col1CY = planCY - spanPlanL / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(planCX - c1PlanB / 2, col1CY - c1PlanL / 2, c1PlanB, c1PlanL);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(planCX - c1PlanB / 2, col1CY - c1PlanL / 2, c1PlanB, c1PlanL);
    ctx.save();
    ctx.font = '9px Cairo, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ع1', planCX, col1CY);
    ctx.restore();

    // العمود 2 (أسفل المسقط)
    const col2CY = planCY + spanPlanL / 2;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(planCX - c2PlanB / 2, col2CY - c2PlanL / 2, c2PlanB, c2PlanL);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(planCX - c2PlanB / 2, col2CY - c2PlanL / 2, c2PlanB, c2PlanL);
    ctx.save();
    ctx.font = '9px Cairo, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ع2', planCX, col2CY);
    ctx.restore();
  } else {
    // عمود واحد (منفرد أو حصيرة)
    const c1PlanB = c1 * planScale;
    const c1PlanL = c2 * planScale;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(planCX - c1PlanB / 2, planCY - c1PlanL / 2, c1PlanB, c1PlanL);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(planCX - c1PlanB / 2, planCY - c1PlanL / 2, c1PlanB, c1PlanL);
    ctx.save();
    ctx.font = '9px Cairo, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('عمود', planCX, planCY);
    ctx.restore();
  }

  // ══════════════════════════════════════════════════
  //  شبكة التسليح على المسقط الأفقي
  // ══════════════════════════════════════════════════
  if (opts.showRebar && results.calculated) {
    const inset = 8; // مسافة من حافة الأساس

    // ── تسليح سفلي اتجاه X (خطوط أفقية حمراء) ──
    if (results.bottomRebarX.diameter > 0) {
      const spacingX = results.bottomRebarX.spacing * planScale / 1000;
      const rebarStartY = planTop + inset;
      const rebarEndY = planTop + lPlan - inset;
      const rebarStartX = planLeft + inset;
      const rebarEndX = planLeft + bPlan - inset;

      ctx.save();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      const stepY = Math.max(spacingX, 10);
      for (let y = rebarStartY + stepY / 2; y < rebarEndY; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(rebarStartX, y);
        ctx.lineTo(rebarEndX, y);
        ctx.stroke();
      }
      ctx.restore();

      // تسمية التسليح السفلي X
      const bxLabel = `Φ${results.bottomRebarX.diameter}/${results.bottomRebarX.spacing}`;
      ctx.save();
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(bxLabel, planLeft + bPlan + 5, planTop + lPlan / 2 - 10);
      ctx.fillText('(سفلي X)', planLeft + bPlan + 5, planTop + lPlan / 2 + 4);
      ctx.restore();
    }

    // ── تسليح سفلي اتجاه Y (خطوط عمودية حمراء) ──
    if (results.bottomRebarY.diameter > 0) {
      const spacingY = results.bottomRebarY.spacing * planScale / 1000;
      const rebarStartX = planLeft + inset;
      const rebarEndX = planLeft + bPlan - inset;
      const rebarStartY = planTop + inset;
      const rebarEndY = planTop + lPlan - inset;

      ctx.save();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.5;
      const stepX = Math.max(spacingY, 10);
      for (let x = rebarStartX + stepX / 2; x < rebarEndX; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, rebarStartY);
        ctx.lineTo(x, rebarEndY);
        ctx.stroke();
      }
      ctx.restore();

      // تسمية التسليح السفلي Y
      const byLabel = `Φ${results.bottomRebarY.diameter}/${results.bottomRebarY.spacing}`;
      ctx.save();
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.fillStyle = '#b91c1c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(byLabel, planCX, planTop - 3);
      ctx.fillText('(سفلي Y)', planCX, planTop - 15);
      ctx.restore();
    }

    // ── تسليح علوي اتجاه X (خطوط متقطعة برتقالية) ──
    if (showTopRebar && results.topRebarX.diameter > 0) {
      const spacingX = results.topRebarX.spacing * planScale / 1000;
      const rebarStartY = planTop + inset;
      const rebarEndY = planTop + lPlan - inset;
      const rebarStartX = planLeft + inset;
      const rebarEndX = planLeft + bPlan - inset;

      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 3]);
      const stepY = Math.max(spacingX, 12);
      for (let y = rebarStartY + stepY; y < rebarEndY; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(rebarStartX, y);
        ctx.lineTo(rebarEndX, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // تسمية التسليح العلوي X
      const txLabel = `Φ${results.topRebarX.diameter}/${results.topRebarX.spacing}`;
      ctx.save();
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.fillStyle = '#f97316';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(txLabel, planLeft + bPlan + 5, planTop + lPlan / 2 + 20);
      ctx.fillText('(علوي X)', planLeft + bPlan + 5, planTop + lPlan / 2 + 34);
      ctx.restore();
    }

    // ── تسليح علوي اتجاه Y (خطوط عمودية متقطعة برتقالية) ──
    if (showTopRebar && results.topRebarY.diameter > 0) {
      const spacingY = results.topRebarY.spacing * planScale / 1000;
      const rebarStartX = planLeft + inset;
      const rebarEndX = planLeft + bPlan - inset;
      const rebarStartY = planTop + inset;
      const rebarEndY = planTop + lPlan - inset;

      ctx.save();
      ctx.strokeStyle = '#ea580c';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 3]);
      const stepX = Math.max(spacingY, 12);
      for (let x = rebarStartX + stepX; x < rebarEndX; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, rebarStartY);
        ctx.lineTo(x, rebarEndY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // تسمية التسليح العلوي Y
      const tyLabel = `Φ${results.topRebarY.diameter}/${results.topRebarY.spacing}`;
      ctx.save();
      ctx.font = 'bold 10px Cairo, sans-serif';
      ctx.fillStyle = '#ea580c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(tyLabel, planCX + bPlan * 0.3, planTop - 3);
      ctx.fillText('(علوي Y)', planCX + bPlan * 0.3, planTop - 15);
      ctx.restore();
    }
  }

  // ── أبعاد المسقط ──
  if (opts.showDimensions) {
    drawDimensionLine(ctx, planLeft, planTop + lPlan + 8, planLeft + bPlan, planTop + lPlan + 8, `B = ${B}m`, 18, opts);
    drawDimensionLine(ctx, planLeft - 8, planTop, planLeft - 8, planTop + lPlan, `L = ${L}m`, 18, opts);
  }

  // ──────────────────────────────────────────────
  //  خط الفاصل
  // ──────────────────────────────────────────────
  ctx.save();
  ctx.setLineDash([10, 5]);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(marginX - 20, dividerY);
  ctx.lineTo(W - marginX + 20, dividerY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ──────────────────────────────────────────────
  //  الجزء الثاني: المقطع العرضي (Section View)
  // ──────────────────────────────────────────────
  const secArea = {
    x: marginX,
    y: dividerY + 20,
    w: W - marginX * 2,
    h: H - dividerY - 40,
  };

  // مقياس المقطع
  const secScaleX = secArea.w / (B * 1.4);
  const secScaleY = secArea.h / (D_f * 1.8);
  const secScale = Math.min(secScaleX, secScaleY);

  const bSec = B * secScale;
  const dSec = D_f * secScale;
  const tSec = t * secScale;
  const c1Sec = c1 * secScale;

  const secCX = secArea.x + secArea.w / 2;
  const secBaseY = secArea.y + secArea.h - 20;

  // عنوان المقطع
  ctx.save();
  ctx.font = 'bold 13px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('المقطع العرضي', secCX, dividerY + 5);
  ctx.restore();

  // ── التربة (خلفية) ──
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(secCX - bSec / 2 - 20, secBaseY - dSec, bSec + 40, dSec + 15);
  drawHatching(ctx, secCX - bSec / 2 - 20, secBaseY - dSec, bSec + 40, dSec + 15, 10, 45, '#d97706');

  // ── جسم الأساس (الخرسانة) ──
  drawFilledRect(ctx, secCX - bSec / 2, secBaseY - tSec, bSec, tSec, '#d4d4d8', '#334155', 2);
  drawHatching(ctx, secCX - bSec / 2, secBaseY - tSec, bSec, tSec, 15, -45, '#a1a1aa');

  // ── العمود / الجدار على المقطع ──
  const colH = dSec * 0.45;

  if (isContinuous) {
    // جدار
    const wallW = bSec * 0.6;
    const wallH = colH * 0.65;
    drawFilledRect(ctx, secCX - wallW / 2, secBaseY - tSec - wallH, wallW, wallH, '#78716c', '#475569', 1.5);
    drawHatching(ctx, secCX - wallW / 2, secBaseY - tSec - wallH, wallW, wallH, 8, 45, '#57534e');
  } else if (isCombined) {
    // عمودان على المقطع — داخل عرض الأساس
    const L_span = inputs.L_span || 4.5;
    const c_w2 = inputs.c_width2 || 0.4;
    const c2SecPx = c_w2 * secScale;
    // المسافة بين العمودين — تحجيم لتناسب داخل B
    const spanSecPx = Math.min(L_span * secScale, bSec - c1Sec / 2 - c2SecPx / 2 - 10);

    const col1X = secCX - spanSecPx / 2;
    const col2X = secCX + spanSecPx / 2;

    drawFilledRect(ctx, col1X - c1Sec / 2, secBaseY - tSec - colH, c1Sec, colH, '#94a3b8', '#475569', 1.5);
    drawFilledRect(ctx, col2X - c2SecPx / 2, secBaseY - tSec - colH, c2SecPx, colH, '#94a3b8', '#475569', 1.5);

    // خط أبعاد بين العمودين
    if (opts.showDimensions) {
      drawDimensionLine(ctx, col1X, secBaseY - tSec - colH - 15, col2X, secBaseY - tSec - colH - 15, `L_span=${L_span}m`, 12, opts);
    }
  } else if (isSteelColumn) {
    // عمود معدني I-shape
    const flangeW = c1Sec * 0.9;
    const webW = c1Sec * 0.15;
    const flangeT = colH * 0.12;
    const bpW = (basePlateWidth || c1) * secScale;
    const bpH = Math.max(8, tSec * 0.06);

    // صفيحة الارتكاز
    drawFilledRect(ctx, secCX - bpW / 2, secBaseY - tSec - bpH, bpW, bpH, '#475569', '#1e293b', 2);

    // مسامير
    const boltR = 2.5;
    for (const dx of [-bpW * 0.15, bpW * 0.15]) {
      ctx.beginPath();
      ctx.arc(secCX + dx, secBaseY - tSec - bpH / 2, boltR, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // I-beam
    drawFilledRect(ctx, secCX - flangeW / 2, secBaseY - tSec - bpH - colH, flangeW, flangeT, '#64748b', '#475569', 1);
    drawFilledRect(ctx, secCX - webW / 2, secBaseY - tSec - bpH - colH + flangeT, webW, colH - 2 * flangeT, '#94a3b8', '#475569', 1);
    drawFilledRect(ctx, secCX - flangeW / 2, secBaseY - tSec - bpH - flangeT, flangeW, flangeT, '#64748b', '#475569', 1);
  } else {
    // عمود خرساني عادي (منفرد / حصيرة)
    drawFilledRect(ctx, secCX - c1Sec / 2, secBaseY - tSec - colH, c1Sec, colH, '#94a3b8', '#475569', 1.5);
  }

  // ══════════════════════════════════════════════════
  //  التسليح على المقطع العرضي
  // ══════════════════════════════════════════════════
  if (opts.showRebar && results.calculated) {
    const coverPx = (cover / 1000) * secScale;
    const rebarInset = Math.max(coverPx, 10);
    const barRadius = 5; // نصف قطر السيخ بالبكسل

    // ═══ أسياخ سفلية: قرب أسفل البلاطة ═══
    // الموقع الصحيح: من أسفل البلاطة + الغطاء الخرساني
    const bottomRebarY = secBaseY - coverPx - barRadius;

    ctx.save();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(secCX - bSec / 2 + rebarInset, bottomRebarY);
    ctx.lineTo(secCX + bSec / 2 - rebarInset, bottomRebarY);
    ctx.stroke();
    ctx.restore();

    // نقاط مقطع الأسياخ السفلية
    if (results.bottomRebarX.diameter > 0) {
      const spacing = results.bottomRebarX.spacing * secScale / 1000;
      const startX = secCX - bSec / 2 + rebarInset + 5;
      const endX = secCX + bSec / 2 - rebarInset - 5;
      for (let x = startX; x <= endX; x += Math.max(spacing, 12)) {
        drawRebarDot(ctx, x, bottomRebarY, barRadius, '#dc2626');
      }
    }

    // ═══ أسياخ علوية: قرب أعلى البلاطة ═══
    // الموقع الصحيح: من أعلى البلاطة + الغطاء الخرساني
    const topRebarY = secBaseY - tSec + coverPx + barRadius;

    if (showTopRebar) {
      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(secCX - bSec / 2 + rebarInset, topRebarY);
      ctx.lineTo(secCX + bSec / 2 - rebarInset, topRebarY);
      ctx.stroke();
      ctx.restore();

      // نقاط مقطع الأسياخ العلوية
      if (results.topRebarX.diameter > 0) {
        const spacing = results.topRebarX.spacing * secScale / 1000;
        const startX = secCX - bSec / 2 + rebarInset + 5;
        const endX = secCX + bSec / 2 - rebarInset - 5;
        for (let x = startX; x <= endX; x += Math.max(spacing, 12)) {
          drawRebarDot(ctx, x, topRebarY, barRadius, '#f97316');
        }
      }

      // كراسي (للحصيرة فقط)
      if (isRaft) {
        const chairSpacing = Math.max(35, bSec / 8);
        const chairStartX = secCX - bSec / 2 + 25;
        const chairEndX = secCX + bSec / 2 - 25;
        ctx.save();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        for (let x = chairStartX; x <= chairEndX; x += chairSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, bottomRebarY - barRadius);
          ctx.lineTo(x, topRebarY + barRadius);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }

  // ─── منطقة الشد (إن وجدت) ───
  if (results.calculated && results.hasTension) {
    const compressedFraction = results.compressedLength / L;
    const tensionStartX = secCX - bSec / 2;
    const tensionWidth = bSec * (1 - compressedFraction);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.fillRect(tensionStartX, secBaseY - tSec, tensionWidth, tSec);
  }

  // ─── أبعاد المقطع ───
  if (opts.showDimensions) {
    // عرض B
    drawDimensionLine(ctx, secCX - bSec / 2, secBaseY + 10, secCX + bSec / 2, secBaseY + 10, `B = ${B}m`, 22, opts);
    // سماكة t
    drawDimensionLine(ctx, secCX + bSec / 2 + 12, secBaseY, secCX + bSec / 2 + 12, secBaseY - tSec, `t = ${t}m`, 25, opts);
    // عمق D_f
    drawDimensionLine(ctx, secCX - bSec / 2 - 12, secBaseY, secCX - bSec / 2 - 12, secBaseY - dSec, `D_f = ${D_f}m`, 25, opts);
  }

  // ─── مستوى التأسيس ───
  const groundY = secBaseY - dSec;
  ctx.save();
  ctx.setLineDash([8, 4]);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(secCX - bSec / 2 - 30, groundY);
  ctx.lineTo(secCX + bSec / 2 + 30, groundY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ─── جدول التسليح (أسفل اليمين) ───
  if (opts.showRebar && results.calculated) {
    const tableX = secCX + bSec / 2 + 35;
    const tableY = secBaseY - tSec + 5;
    const lineH = 14;

    ctx.save();
    ctx.font = '9px Cairo, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // رأس الجدول
    ctx.fillStyle = '#0f766e';
    ctx.fillText('تفاصيل التسليح', tableX, tableY);

    // تسليح سفلي X
    if (results.bottomRebarX.diameter > 0) {
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`● سفلي X: Φ${results.bottomRebarX.diameter}/${results.bottomRebarX.spacing}mm`, tableX, tableY + lineH);
    }
    // تسليح سفلي Y
    if (results.bottomRebarY.diameter > 0) {
      ctx.fillStyle = '#b91c1c';
      ctx.fillText(`● سفلي Y: Φ${results.bottomRebarY.diameter}/${results.bottomRebarY.spacing}mm`, tableX, tableY + lineH * 2);
    }
    // تسليح علوي X
    if (showTopRebar && results.topRebarX.diameter > 0) {
      ctx.fillStyle = '#f97316';
      ctx.fillText(`● علوي X: Φ${results.topRebarX.diameter}/${results.topRebarX.spacing}mm`, tableX, tableY + lineH * 3);
    }
    // تسليح علوي Y
    if (showTopRebar && results.topRebarY.diameter > 0) {
      ctx.fillStyle = '#ea580c';
      ctx.fillText(`● علوي Y: Φ${results.topRebarY.diameter}/${results.topRebarY.spacing}mm`, tableX, tableY + lineH * 4);
    }
    // ملاحظة المنفرد/المستمر
    if (isIsolated || isContinuous) {
      ctx.fillStyle = '#64748b';
      ctx.fillText('التسليح العلوي: غير مطلوب', tableX, tableY + lineH * 3);
    }

    ctx.restore();
  }

  // ─── شارة الكود السوري ───
  ctx.save();
  ctx.font = '9px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'left';
  ctx.fillText('الكود العربي السوري 2024 - ملحق 5', 8, H - 5);
  ctx.restore();
}
