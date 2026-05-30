// ============================================================
// محرك الرسوم الهندسية - Canvas 2D
// ============================================================

/** إعدادات الرسم */
export interface DrawOptions {
  scale: number;         // مقياس الرسم (px/m)
  offsetX: number;       // إزاحة X
  offsetY: number;       // إزاحة Y
  lineWidth: number;     // سماكة الخط
  color: string;         // لون الخط الأساسي
  dimensionColor: string; // لون خطوط الأبعاد
  rebarColor: string;    // لون التسليح
  concreteColor: string; // لون الخرسانة
  soilColor: string;     // لون التربة
  textFont: string;      // خط النص
  showDimensions: boolean;
  showRebar: boolean;
  showLabels: boolean;
}

/** الإعدادات الافتراضية */
export const DEFAULT_DRAW_OPTIONS: DrawOptions = {
  scale: 150,      // 150 px = 1 m
  offsetX: 50,
  offsetY: 50,
  lineWidth: 2,
  color: '#1e293b',
  dimensionColor: '#64748b',
  rebarColor: '#dc2626',
  concreteColor: '#d4d4d8',
  soilColor: '#92400e',
  textFont: '14px Cairo, sans-serif',
  showDimensions: true,
  showRebar: true,
  showLabels: true,
};

/** رسم خط بسيط */
export function drawLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  opts: Partial<DrawOptions> = {}
) {
  const options = { ...DEFAULT_DRAW_OPTIONS, ...opts };
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.lineWidth;
  ctx.stroke();
}

/** رسم مستطيل ممتلئ */
export function drawFilledRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  fillColor: string,
  strokeColor: string = '#1e293b',
  lineWidth: number = 2
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, w, h);
}

/** رسم خط أبعاد مع سهمين وقيمة */
export function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  text: string,
  offset: number = 20,
  opts: Partial<DrawOptions> = {}
) {
  const options = { ...DEFAULT_DRAW_OPTIONS, ...opts };
  const isHorizontal = Math.abs(y1 - y2) < 5;

  ctx.save();
  ctx.strokeStyle = options.dimensionColor;
  ctx.fillStyle = options.dimensionColor;
  ctx.lineWidth = 1;
  ctx.font = options.textFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isHorizontal) {
    // خط أبعاد أفقي
    const dimY = y1 + offset;

    // خط الامتداد
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, dimY + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2, dimY + 5);
    ctx.stroke();

    // خط البُعد
    ctx.beginPath();
    ctx.moveTo(x1, dimY);
    ctx.lineTo(x2, dimY);
    ctx.stroke();

    // نص القيمة
    const midX = (x1 + x2) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(midX - 25, dimY - 10, 50, 20);
    ctx.fillStyle = options.dimensionColor;
    ctx.fillText(text, midX, dimY);
  } else {
    // خط أبعاد عمودي
    const dimX = x1 + offset;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(dimX + 5, y1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(dimX + 5, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(dimX, y1);
    ctx.lineTo(dimX, y2);
    ctx.stroke();

    const midY = (y1 + y2) / 2;
    ctx.save();
    ctx.translate(dimX, midY);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-25, -10, 50, 20);
    ctx.fillStyle = options.dimensionColor;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/** رسم تظليل (Hatching) */
export function drawHatching(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  spacing: number = 8,
  angle: number = 45,
  color: string = '#a8a29e'
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const maxDim = Math.sqrt(w * w + h * h);

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  for (let i = -maxDim; i <= maxDim * 2; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h * cos / sin, y + h);
    ctx.stroke();
  }

  ctx.restore();
}

/** رسم سيخ (دائرة صغيرة) */
export function drawRebarDot(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  diameter: number = 6,
  color: string = '#dc2626'
) {
  ctx.beginPath();
  ctx.arc(x, y, diameter / 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/** رسم نص مع خلفية */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  opts: Partial<DrawOptions> = {}
) {
  const options = { ...DEFAULT_DRAW_OPTIONS, ...opts };
  ctx.save();
  ctx.font = options.textFont;
  const metrics = ctx.measureText(text);
  const padding = 4;

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(
    x - metrics.width / 2 - padding,
    y - 8 - padding,
    metrics.width + padding * 2,
    16 + padding * 2
  );

  ctx.fillStyle = options.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}
