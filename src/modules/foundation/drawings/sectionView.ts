// ============================================================
// محرك الرسم الهندسي الديناميكي المتكامل - الكود العربي السوري
// يدعم التكيف الكامل مع: المنفرد، المستمر، المشترك، والحصيرة العامة بشرائحها
// الرموز الكودية المعتمدة: B, L, t, D_f, columnWidth, columnDepth, inputs.type
// ============================================================

import type { FoundationInputs, FoundationResults } from '@/stores/foundationStore';
import type { DrawOptions } from '@/engine/drawing/canvasEngine';
import { DEFAULT_DRAW_OPTIONS, drawDimensionLine, drawRebarDot, drawLabel } from '@/engine/drawing/canvasEngine';

export function drawFoundationSection(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  inputs: FoundationInputs,
  results: FoundationResults,
  customOpts: Partial<DrawOptions> = {}
) {
  const opts = { ...DEFAULT_DRAW_OPTIONS, ...customOpts };
  const { B, L, D_f, t, columnWidth: c1, columnDepth: c2, cover, isSteelColumn } = inputs;
  const fType = inputs.type;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 60;
  const usableWidth = canvas.width - 2 * padding;
  const usableHeight = canvas.height - 2 * padding;

  const scale = Math.min(usableWidth / (fType === 'continuous' ? B * 1.5 : B), (usableHeight / 2) / (t + 1.2));
  const centerX = canvas.width / 2;
  const planCenterY = padding + (usableHeight / 4);
  const sectionCenterY = canvas.height - padding - (usableHeight / 4);

  const footingW_px = B * scale;
  const footingL_px = (fType === 'isolated' ? B : B * 1.4) * scale;
  const colW_px = c1 * scale;
  const colH_px = c2 * scale;
  const cover_px = (cover / 1000) * scale;

  // ═══════════════════════════════════════
  // 1️⃣ رسم المسقط الأفقي المتكيف (PLAN VIEW)
  // ═══════════════════════════════════════
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.fillStyle = '#f1f5f9';

  ctx.beginPath();
  if (fType === 'isolated') {
    ctx.rect(centerX - footingW_px / 2, planCenterY - footingW_px / 2, footingW_px, footingW_px);
  } else {
    ctx.rect(centerX - footingL_px / 2, planCenterY - footingW_px / 2, footingL_px, footingW_px);
  }
  ctx.fill();
  ctx.stroke();

  // رسم العمود/الأعمدة في المسقط
  ctx.fillStyle = isSteelColumn ? '#475569' : '#cbd5e1';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;

  if (fType === 'combined') {
    ctx.beginPath();
    ctx.rect(centerX - footingL_px / 4 - colW_px / 2, planCenterY - colH_px / 2, colW_px, colH_px);
    ctx.rect(centerX + footingL_px / 4 - colW_px / 2, planCenterY - colH_px / 2, colW_px, colH_px);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.rect(centerX - colW_px / 2, planCenterY - colH_px / 2, colW_px, colH_px);
    ctx.fill();
    ctx.stroke();
  }

  // خطوط شريحة العمود للحصيرة العامة
  if (fType === 'mat') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(centerX - footingL_px / 3, planCenterY - footingW_px / 2);
    ctx.lineTo(centerX - footingL_px / 3, planCenterY + footingW_px / 2);
    ctx.moveTo(centerX + footingL_px / 3, planCenterY - footingW_px / 2);
    ctx.lineTo(centerX + footingL_px / 3, planCenterY + footingW_px / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    drawLabel(ctx, 'شريحة العمود Column Strip', centerX, planCenterY + footingW_px / 2 - 15, { ...opts, textColor: '#854d0e' });
  }

  // تسمية المسقط الأفقي
  drawLabel(ctx, `مسقط أفقي - ${fType === 'isolated' ? 'أساس منفرد' : fType === 'continuous' ? 'أساس مستمر' : fType === 'combined' ? 'أساس مشترك' : 'حصيرة عامة'}`, centerX, planCenterY - footingW_px / 2 - 20, opts);

  // ═══════════════════════════════════════
  // 2️⃣ رسم المقطع الرأسي المتكامل والتسليح (SECTION VIEW)
  // ═══════════════════════════════════════
  const t_px = t * scale;
  const Df_px = D_f * scale;
  const baseY = sectionCenterY + t_px / 2;

  // جسم الأساس (الخرسانة)
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.rect(centerX - footingW_px / 2, baseY - t_px, footingW_px, t_px);
  ctx.fill();
  ctx.stroke();

  // التربة أسفل الأساس
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(centerX - footingW_px / 2 - 20, baseY, footingW_px + 40, Df_px * 0.4);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 0.5;
  // خطوط التربة المائلة
  for (let i = -footingW_px; i < footingW_px * 2; i += 10) {
    ctx.beginPath();
    ctx.moveTo(centerX - footingW_px / 2 - 20 + i, baseY);
    ctx.lineTo(centerX - footingW_px / 2 - 20 + i + Df_px * 0.4, baseY + Df_px * 0.4);
    ctx.stroke();
  }

  // رسم العمود فوق الأساس
  const colDrawHeight = 60;
  if (isSteelColumn) {
    // ═══ عمود معدني بقطاع I في المقطع ═══
    const flangeW = colW_px * 0.9;
    const webW = colW_px * 0.15;
    const flangeT = colDrawHeight * 0.12;

    // صفيحة الارتكاز
    const bpW = (inputs.basePlateWidth || c1) * scale;
    const bpH = Math.max(6, t_px * 0.04);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(centerX - bpW / 2, baseY - t_px - bpH, bpW, bpH);
    ctx.strokeRect(centerX - bpW / 2, baseY - t_px - bpH, bpW, bpH);

    // مسامير التثبيت
    const boltR = 2;
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (const dx of [-bpW * 0.35, bpW * 0.35]) {
      ctx.beginPath();
      ctx.arc(centerX + dx, baseY - t_px - bpH / 2, boltR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // الجناح السفلي
    const botFlangeY = baseY - t_px - bpH - flangeT;
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillRect(centerX - flangeW / 2, botFlangeY, flangeW, flangeT);
    ctx.strokeRect(centerX - flangeW / 2, botFlangeY, flangeW, flangeT);

    // الروح (Web)
    const webTop = botFlangeY - (colDrawHeight - 2 * flangeT);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(centerX - webW / 2, webTop, webW, colDrawHeight - 2 * flangeT - bpH);
    ctx.strokeRect(centerX - webW / 2, webTop, webW, colDrawHeight - 2 * flangeT - bpH);

    // الجناح العلوي
    ctx.fillStyle = '#64748b';
    ctx.fillRect(centerX - flangeW / 2, webTop - flangeT, flangeW, flangeT);
    ctx.strokeRect(centerX - flangeW / 2, webTop - flangeT, flangeW, flangeT);

    drawLabel(ctx, 'عمود معدني (I)', centerX, webTop - flangeT - 12, { ...opts, textColor: '#475569' });
  } else {
    // ═══ عمود خرساني ═══
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(centerX - colW_px / 2, baseY - t_px - colDrawHeight, colW_px, colDrawHeight);
    ctx.fill();
    ctx.stroke();

    drawLabel(ctx, 'عمود خرساني', centerX, baseY - t_px - colDrawHeight - 12, { ...opts, textColor: '#475569' });
  }

  // ═══════════════════════════════════════
  // التسليح في المقطع الرأسي
  // ═══════════════════════════════════════
  if (results.calculated) {
    const isIsolatedOrStrip = fType === 'isolated' || fType === 'continuous';
    const isCombined = fType === 'combined';
    const isRaft = fType === 'mat';

    // ── أسياخ سفلية (دائماً) ──
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - footingW_px / 2 + cover_px, baseY - t_px + cover_px + 15);
    ctx.lineTo(centerX - footingW_px / 2 + cover_px, baseY - cover_px);
    ctx.lineTo(centerX + footingW_px / 2 - cover_px, baseY - cover_px);
    ctx.lineTo(centerX + footingW_px / 2 - cover_px, baseY - t_px + cover_px + 15);
    ctx.stroke();

    const dotCount = 8;
    const stepX = (footingW_px - 2 * cover_px) / (dotCount - 1);
    for (let i = 0; i < dotCount; i++) {
      drawRebarDot(ctx, centerX - footingW_px / 2 + cover_px + i * stepX, baseY - cover_px - 6, 3.5, '#1d4ed8');
    }

    // ── تسمية التسليح السفلي ──
    drawLabel(ctx, 'فرش سفلي', centerX + footingW_px / 2 + 5, baseY - cover_px, { ...opts, textColor: '#1d4ed8' });

    // ══════════════════════════════════════════════════
    // أسياخ علوية - الفصل الصارم حسب نوع الأساس
    // ══════════════════════════════════════════════════
    if (isIsolatedOrStrip) {
      // منفرد/مستمر: لا تسليح علوي بصرياً
      // الأساس المنفرد والمستمر لا يتطلب تسليحاً علويّاً كودياً
    } else if ((isCombined || isRaft) && results.topRebarRequired) {
      // مشترك/حصيرة: شبكة علوية كاملة
      ctx.strokeStyle = '#b91c1c';
      ctx.beginPath();
      ctx.moveTo(centerX - footingW_px / 2 + cover_px, baseY - cover_px - 15);
      ctx.lineTo(centerX - footingW_px / 2 + cover_px, baseY - t_px + cover_px);
      ctx.lineTo(centerX + footingW_px / 2 - cover_px, baseY - t_px + cover_px);
      ctx.lineTo(centerX + footingW_px / 2 - cover_px, baseY - cover_px - 15);
      ctx.stroke();

      for (let i = 0; i < dotCount; i++) {
        drawRebarDot(ctx, centerX - footingW_px / 2 + cover_px + i * stepX, baseY - t_px + cover_px + 6, 3.5, '#2563eb');
      }

      // تسمية التسليح العلوي - إزاحة رأسية لمنع التداخل
      const topLabelY = baseY - t_px + cover_px + 30;
      if (isCombined) {
        drawLabel(ctx, 'شبكة علوية (عزم سالب بين العمودين)', centerX + footingW_px / 2 + 5, topLabelY, { ...opts, textColor: '#b91c1c' });
      } else {
        drawLabel(ctx, 'شبكة علوية كاملة + شريحة العمود', centerX + footingW_px / 2 + 5, topLabelY, { ...opts, textColor: '#b91c1c' });
      }
    }

    // ── حديد إضافي لشريحة العمود (حصيرة فقط) ──
    if (isRaft) {
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(centerX - colW_px * 1.5, baseY - t_px + cover_px + 3);
      ctx.lineTo(centerX + colW_px * 1.5, baseY - t_px + cover_px + 3);
      ctx.stroke();
      drawLabel(ctx, 'حديد إضافي لشريحة العمود', centerX, baseY - t_px + cover_px + 20, { ...opts, textColor: '#6b21a8' });
    }

    // ── منطقة الشد (إن وجدت) ──
    if (results.hasTension) {
      const compressedFraction = results.compressedLength / L;
      const tensionStartX = centerX - footingW_px / 2 + footingW_px * compressedFraction;
      const tensionWidth = footingW_px * (1 - compressedFraction);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(tensionStartX, baseY - t_px, tensionWidth, t_px);

      ctx.font = 'bold 11px Cairo, sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.textAlign = 'center';
      ctx.fillText('منطقة شد', tensionStartX + tensionWidth / 2, baseY - t_px / 2);
    }

    // ── إجهاد التربة ──
    drawLabel(ctx, `σ₁ = ${results.sigma_1} kN/m²`, centerX, baseY + Df_px * 0.4 + 20, opts);
  }

  // ─── خطوط الأبعاد ───
  drawDimensionLine(ctx, centerX - footingW_px / 2, baseY + 15, centerX + footingW_px / 2, baseY + 15, `B = ${B} m`, 20, opts);
  drawDimensionLine(ctx, centerX + footingW_px / 2 + 20, baseY - t_px, centerX + footingW_px / 2 + 20, baseY, `t = ${t} m`, 20, opts);
  drawLabel(ctx, 'مقطع رأسي تفصيلي SECTION', centerX, baseY + 50, { ...opts, textColor: '#475569' });

  // ─── خط مستوى التأسيس ───
  const groundLevel = baseY - t_px - Df_px * 0.1;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(centerX - footingW_px / 2 - 30, groundLevel);
  ctx.lineTo(centerX + footingW_px / 2 + 30, groundLevel);
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);
  drawLabel(ctx, 'مستوى التأسيس', centerX + footingW_px / 2 + 20, groundLevel - 10, { ...opts, textColor: '#16a34a' });

  // ─── شارة الكود السوري ───
  ctx.font = '10px Cairo, sans-serif';
  ctx.fillStyle = '#0f766e';
  ctx.textAlign = 'left';
  ctx.fillText('الكود العربي السوري - ملحق 5', 10, 15);
}
