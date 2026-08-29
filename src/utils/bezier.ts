import type { Point } from '../types/game';

/**
 * 連続する2点の中点をアンカーにした二次ベジェ曲線で平滑化描画する。
 */
export const drawSmoothPath = (
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  side: number
): void => {
  if (pts.length === 0) return;

  const c = (p: Point) => ({ x: p.x * side, y: p.y * side });

  if (pts.length === 1) {
    const p = c(pts[0]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  const p0 = c(pts[0]);
  ctx.moveTo(p0.x, p0.y);

  if (pts.length === 2) {
    const p1 = c(pts[1]);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    return;
  }

  for (let i = 1; i < pts.length - 1; i++) {
    const cur = c(pts[i]);
    const nxt = c(pts[i + 1]);
    const mid = { x: (cur.x + nxt.x) / 2, y: (cur.y + nxt.y) / 2 };
    // 現在の点を制御点、次の点との中点をアンカーにする
    ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
  }

  const last = c(pts[pts.length - 1]);
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
};
