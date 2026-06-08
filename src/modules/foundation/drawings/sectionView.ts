// ============================================================
// رسم مقطع الأساس العرضي (Section View)
// الكود العربي السوري 2024 - يدعم العمود المعدني والشد
// المنطق الذكي:
//   منفرد = تسليح سفلي فقط (بدون شبكة علوية بصرياً)
//   مستمر = جدار بدل العمود + كانات عرضية
//   مشترك = عمودان مع تباعد L_span + شبكة علوية
//   حصيرة = شبكتان كاملتان + كراسي بين الطبقتين
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

  // تصنيف النوع - فصل صارم للرسم
  const isIsolated = inputs.type === 'isolated';
  const isContinuous = inputs.type === 'continuous';
  const isCombined = inputs.type === 'combined';
  const isRaft = inputs.type === 'mat';
  const isRaftOrCombined = isRaft || isCombined;

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

  // ══════════════════════════════════════
  // رسم العمود/الجدار حسب نوع الأساس
  // ══════════════════════════════════════
  const colHeight = dPx * 0.5;

  if (isContinuous) {
    // ═══ مستمر: رسم جدار بدل العمود ═══
    // جدار يمتد على طول المقطع - أعرض وأقصر من العمود
    const wallWidth = bPx * 0.7;
    const wallHeight = colHeight * 0.7;
    drawFilledRect(
      ctx,
      centerX - wallWidth / 2,
      baseY - tPx - wallHeight,
      wallWidth,
      wallHeight,
      '#78716c',
      opts.color,
      opts.lineWidth
    );

    // تظليل الجدار
    drawHatching(
      ctx,
      centerX - wallWidth / 2,
      baseY - tPx - wallHeight,
      wallWidth,
      wallHeight,
      8,
      45,
      '#57534e'
    );

    // خط القطاع الحرج
    const criticalX = centerX - wallWidth / 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(criticalX, baseY - tPx);
    ctx.lineTo(criticalX, baseY);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, 'القطاع الحرج', criticalX, baseY - tPx - 20, opts);

  } else if (isCombined) {
    // ═══ مشترك: عمودان بتباعد L_span ═══
    const L_span = inputs.L_span || 4.5;
    const c_width2 = inputs.c_width2 || 0.4;
    const spanPx = L_span * scale;
    const c2Px = c_width2 * scale;

    // العمود الأول (يسار)
    const col1X = centerX - spanPx / 2;
    drawFilledRect(
      ctx,
      col1X - c1Px / 2,
      baseY - tPx - colHeight,
      c1Px,
      colHeight,
      '#94a3b8',
      opts.color,
      opts.lineWidth
    );

    // العمود الثاني (يمين)
    const col2X = centerX + spanPx / 2;
    drawFilledRect(
      ctx,
      col2X - c2Px / 2,
      baseY - tPx - colHeight,
      c2Px,
      colHeight,
      '#94a3b8',
      opts.color,
      opts.lineWidth
    );

    // خط القطاع الحرج للعمود الأول
    const criticalX = col1X - c1Px / 2;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(criticalX, baseY - tPx);
    ctx.lineTo(criticalX, baseY);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, 'القطاع الحرج', criticalX, baseY - tPx - 20, opts);

    // خطوط الأبعاد الإضافية بين العمودين
    if (opts.showDimensions) {
      drawDimensionLine(
        ctx,
        col1X,
        baseY - tPx - colHeight - 25,
        col2X,
        baseY - tPx - colHeight - 25,
        `L_span = ${L_span} m`,
        15,
        opts
      );
    }

    // تسميات الأعمدة
    if (opts.showLabels) {
      drawLabel(ctx, 'عمود 1', col1X, baseY - tPx - colHeight / 2, opts);
      drawLabel(ctx, 'عمود 2', col2X, baseY - tPx - colHeight / 2, opts);
    }

  } else if (isSteelColumn) {
    // ═══ رسم العمود المعدني بقطاع I (I-beam Profile) ═══
    const flangeWidth = c1Px * 0.9;   // عرض الجناح
    const webWidth = c1Px * 0.15;     // سمك الروح
    const flangeThickness = colHeight * 0.12; // سماكة الجناح
    const colTop = baseY - tPx - colHeight;

    // صفيحة الارتكاز (Base Plate) فوق سطح الخرسانة مباشرة
    const bpW = (basePlateWidth || c1) * scale;
    const bpH = Math.max(10, tPx * 0.06);
    drawFilledRect(
      ctx,
      centerX - bpW / 2,
      baseY - tPx - bpH,
      bpW,
      bpH,
      '#475569',
      '#1e293b',
      opts.lineWidth + 1
    );

    // مسامير التثبيت (Anchor Bolts) - 4 مسامير على الأطراف
    const boltRadius = 3;
    const boltInsetX = bpW * 0.15;
    const boltInsetY = bpH * 0.5;
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (const dx of [-boltInsetX, boltInsetX]) {
      for (const dy of [-boltInsetY, boltInsetY]) {
        ctx.beginPath();
        ctx.arc(centerX + dx, baseY - tPx - bpH / 2 + dy, boltRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // الجناح العلوي (Top Flange)
    drawFilledRect(
      ctx,
      centerX - flangeWidth / 2,
      colTop,
      flangeWidth,
      flangeThickness,
      '#64748b',
      '#475569',
      opts.lineWidth
    );

    // الروح (Web) - خط عمودي رفيع
    drawFilledRect(
      ctx,
      centerX - webWidth / 2,
      colTop + flangeThickness,
      webWidth,
      colHeight - 2 * flangeThickness,
      '#94a3b8',
      '#475569',
      opts.lineWidth
    );

    // الجناح السفلي (Bottom Flange) - يرتكز على صفيحة الارتكاز
    drawFilledRect(
      ctx,
      centerX - flangeWidth / 2,
      baseY - tPx - bpH - flangeThickness,
      flangeWidth,
      flangeThickness,
      '#64748b',
      '#475569',
      opts.lineWidth
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

    drawLabel(ctx, 'القطاع الحرج', criticalLineX, baseY - tPx - 20, opts);
  } else {
    // ═══ عمود خرساني عادي (منفرد) ═══
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

    drawLabel(ctx, 'القطاع الحرج', criticalX, baseY - tPx - 20, opts);
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

    if (isContinuous) {
      // ═══ مستمر: كانات عرضية بدل نقاط الأسياخ ═══
      if (results.bottomRebarX.diameter > 0) {
        const spacing = results.bottomRebarX.spacing * scale / 1000;
        const startX = centerX - bPx / 2 + 20;
        const endX = centerX + bPx / 2 - 20;
        for (let x = startX; x <= endX; x += Math.max(spacing, 15)) {
          // رسم كانة عرضية (شكل بيضاوي مفتوح)
          const stirrupH = 12;
          const stirrupW = 5;
          ctx.beginPath();
          ctx.ellipse(x, rebarY, stirrupW, stirrupH / 2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = opts.rebarColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    } else {
      // نقاط الأسياخ السفلية (لغير المستمر)
      if (results.bottomRebarX.diameter > 0) {
        const spacing = results.bottomRebarX.spacing * scale / 1000;
        const startX = centerX - bPx / 2 + 20;
        const endX = centerX + bPx / 2 - 20;
        for (let x = startX; x <= endX; x += Math.max(spacing, 15)) {
          drawRebarDot(ctx, x, rebarY, 6, opts.rebarColor);
        }
      }
    }

    // تسمية التسليح السفلي
    drawLabel(ctx, 'فرش سفلي', centerX + bPx / 2 + 5, rebarY + 5, opts);

    // ══════════════════════════════════════════════════
    // أسياخ علوية - الفصل الصارم حسب نوع الأساس
    // ══════════════════════════════════════════════════
    if (isIsolated || isContinuous) {
      // ═══ منفرد/مستمر: إلغاء كامل بصري - لا خطوط ولا أسياخ علوية ═══
      // (لا نرسم أي شيء هنا - التسليح السفلي فقط)
    } else if (isCombined && results.topRebarRequired) {
      // ═══ مشترك: شبكة علوية كاملة عبر العرض الكامل ═══
      const topRebarY = baseY - tPx + 20;
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
      const topLabelY = topRebarY + 40;
      drawLabel(ctx, 'شبكة علوية (عزم سالب بين العمودين)', centerX + bPx / 2 + 5, topLabelY, opts);

    } else if (isRaft && results.topRebarRequired) {
      // ═══ حصيرة: شبكتان كاملتان + كراسي بين الطبقتين ═══
      const topRebarY = baseY - tPx + 20;
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

      // ═══ كراسي بين الطبقتين (خطوط عمودية صغيرة) ═══
      const chairSpacing = Math.max(40, bPx / 10);
      const chairStartX = centerX - bPx / 2 + 30;
      const chairEndX = centerX + bPx / 2 - 30;
      for (let x = chairStartX; x <= chairEndX; x += chairSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, rebarY);
        ctx.lineTo(x, topRebarY);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // مثلث صغير في الأعلى والأسفل للكرسي
        const triSize = 3;
        // مثلث سفلي
        ctx.beginPath();
        ctx.moveTo(x - triSize, rebarY + triSize);
        ctx.lineTo(x + triSize, rebarY + triSize);
        ctx.lineTo(x, rebarY);
        ctx.closePath();
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
        // مثلث علوي
        ctx.beginPath();
        ctx.moveTo(x - triSize, topRebarY - triSize);
        ctx.lineTo(x + triSize, topRebarY - triSize);
        ctx.lineTo(x, topRebarY);
        ctx.closePath();
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
      }

      // تسمية الكراسي
      drawLabel(ctx, 'كراسي', centerX + bPx / 2 + 5, (rebarY + topRebarY) / 2, opts);

      // تسمية التسليح العلوي
      const topLabelY = topRebarY + 40;
      drawLabel(ctx, 'شبكة علوية كاملة + شريحة العمود', centerX + bPx / 2 + 5, topLabelY, opts);
    }
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

    // خطوط أبعاد العمود (فقط لغير المشترك - المشترك له أبعاد خاصة أعلاه)
    if (!isCombined) {
      const dimC1Px = isContinuous ? bPx * 0.7 : c1Px;
      drawDimensionLine(
        ctx,
        centerX - dimC1Px / 2,
        baseY - tPx - colHeight - 10,
        centerX + dimC1Px / 2,
        baseY - tPx - colHeight - 10,
        isContinuous ? `${(B * 0.7).toFixed(2)} m` : `${c1} m`,
        15,
        opts
      );
    }
  }

  // ─── التسميات ───
  if (opts.showLabels) {
    drawLabel(ctx, 'خرسانة', centerX, baseY - tPx / 2, opts);

    if (isCombined) {
      // تسميات الأعمدة في المشترك تتم أعلاه
    } else if (isContinuous) {
      drawLabel(ctx, 'جدار', centerX, baseY - tPx - colHeight * 0.35, opts);
    } else if (isSteelColumn) {
      drawLabel(ctx, 'عمود معدني (I)', centerX, baseY - tPx - colHeight / 2, opts);
    } else {
      drawLabel(ctx, 'عمود خرساني', centerX, baseY - tPx - colHeight / 2, opts);
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
