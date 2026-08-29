import React, { useEffect, useRef } from 'react';
import type { StageData, TraceState } from '../../types/game';

interface GuideOverlayProps {
  stage: StageData;
  side: number;
  dpr: number;
  traceStates: TraceState[];
  isCompleted: boolean;
  completionProgress: number; // 0.0 to 1.0 (for fade in animation)
}

export const GuideOverlay: React.FC<GuideOverlayProps> = ({
  stage,
  side,
  dpr,
  traceStates,
  isCompleted,
  completionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズとDPRの設定
    const physicalSize = Math.round(side * dpr);
    if (canvas.width !== physicalSize || canvas.height !== physicalSize) {
      canvas.width = physicalSize;
      canvas.height = physicalSize;
    }
    canvas.style.width = `${side}px`;
    canvas.style.height = `${side}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, side, side);

    const c = (p: { x: number; y: number }) => ({ x: p.x * side, y: p.y * side });

    // 1. 完成時の塗りつぶし (fill) 演出描画
    if (isCompleted && stage.completionEffect === 'fill') {
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, completionProgress));
      ctx.fillStyle = stage.fillColor;

      stage.guidePaths.forEach((path) => {
        if (path.points.length < 2) return;
        ctx.beginPath();
        const start = c(path.points[0]);
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < path.points.length; i++) {
          const pt = c(path.points[i]);
          ctx.lineTo(pt.x, pt.y);
        }
        if (path.closed) {
          ctx.closePath();
        }
        ctx.fill();
      });
      ctx.restore();
    }

    // 2. ガイドパス（点線とお手本線）の描画
    stage.guidePaths.forEach((path, idx) => {
      if (path.points.length < 2) return;
      const state = traceStates[idx];
      const cursor = state?.cursor ?? 0;

      // 2a. 未通過区間（点線ガイド）
      ctx.save();
      ctx.setLineDash([12, 14]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = isCompleted ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.18)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      const startPt = c(path.points[0]);
      ctx.moveTo(startPt.x, startPt.y);
      for (let i = 1; i < path.points.length; i++) {
        const pt = c(path.points[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // 2b. 通過済み区間（消化済みの実線）
      if (cursor > 1 && !isCompleted) {
        ctx.save();
        ctx.setLineDash([]);
        ctx.lineWidth = 8;
        ctx.strokeStyle = stage.themeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.4;

        ctx.beginPath();
        const firstPt = c(path.points[0]);
        ctx.moveTo(firstPt.x, firstPt.y);
        const limit = Math.min(cursor, path.points.length);
        for (let i = 1; i < limit; i++) {
          const pt = c(path.points[i]);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 2c. 始点マーカー（未完成パスのみ）
      const isPathDone = state?.passed.every(Boolean);
      if (!isCompleted && !isPathDone && path.points.length > 0) {
        const p0 = c(path.points[0]);
        ctx.save();
        // 外側の薄い円
        ctx.fillStyle = stage.themeColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // 内側の実体円
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 12, 0, Math.PI * 2);
        ctx.fill();

        // 中心白丸
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 3. 完成時のモチーフ演出描画 (Stage 1 開いた線の場合)
    if (isCompleted && stage.completionEffect === 'motif') {
      ctx.save();
      ctx.globalAlpha = Math.min(1, completionProgress);
      // モチーフごとの装飾描画
      drawMotifDecorations(ctx, stage, side);
      ctx.restore();
    }
  }, [stage, side, dpr, traceStates, isCompleted, completionProgress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
};

/**
 * Stage 1-1 〜 1-3 などのモチーフ装飾（基本Canvas図形）
 */
const drawMotifDecorations = (
  ctx: CanvasRenderingContext2D,
  stage: StageData,
  side: number
) => {
  const c = (p: { x: number; y: number }) => ({ x: p.x * side, y: p.y * side });

  if (stage.id === 'stage_1_1') {
    // 雨粒モチーフ
    stage.guidePaths.forEach((path) => {
      path.points.forEach((pt, idx) => {
        if (idx % 4 === 2) {
          const p = c(pt);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    });
  } else if (stage.id === 'stage_1_2') {
    // 車（ミニバン）モチーフ
    stage.guidePaths.forEach((path) => {
      const p = c(path.points[Math.floor(path.points.length / 2)]);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(p.x - 24, p.y - 14, 48, 24, 6);
      ctx.fill();
      // 窓
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(p.x - 16, p.y - 10, 14, 8);
      ctx.fillRect(p.x + 2, p.y - 10, 14, 8);
      // タイヤ
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(p.x - 14, p.y + 10, 6, 0, Math.PI * 2);
      ctx.arc(p.x + 14, p.y + 10, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (stage.id === 'stage_1_3') {
    // キャンディモチーフ（中心）
    const center = c({ x: 0.5, y: 0.5 });
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }
};
