import React, { useEffect, useRef } from 'react';
import { PARTICLE_LIMIT } from '../../constants';
import type { Point, StageData, TraceState } from '../../types/game';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface RingRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface ParticleCanvasProps {
  side: number;
  dpr: number;
  stage: StageData;
  traceStates: TraceState[];
  currentPointerPos: Point | null;
  isDrawing: boolean;
  lastCheckpointPos: Point | null;
  checkpointTimestamp: number;
  isCompleted: boolean;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  side,
  dpr,
  stage,
  traceStates,
  currentPointerPos,
  isDrawing,
  lastCheckpointPos,
  checkpointTimestamp,
  isCompleted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<RingRipple[]>([]);
  const lastRippleTsRef = useRef<number>(0);

  // お手本アニメーション用
  const idleStartTimeRef = useRef<number>(Date.now());

  // FPS計測用
  const lastFrameTimeRef = useRef<number>(performance.now());
  const fpsRef = useRef<number>(60);

  // 毎フレーム参照する最新 props を ref に保持 (Fix G)
  const propsRef = useRef({ stage, traceStates, currentPointerPos, isDrawing, isCompleted });
  propsRef.current = { stage, traceStates, currentPointerPos, isDrawing, isCompleted };

  // ユーザーの操作状態を追跡
  useEffect(() => {
    if (isDrawing) {
      idleStartTimeRef.current = Date.now();
    } else {
      idleStartTimeRef.current = Date.now();
    }
  }, [isDrawing]);

  // 新しいチェックポイント通過時に波紋を追加
  useEffect(() => {
    if (!lastCheckpointPos || checkpointTimestamp === lastRippleTsRef.current) return;
    lastRippleTsRef.current = checkpointTimestamp;
    ripplesRef.current.push({
      x: lastCheckpointPos.x * side,
      y: lastCheckpointPos.y * side,
      radius: 8,
      maxRadius: 36,
      color: stage.themeColor,
      alpha: 0.8,
    });
  }, [lastCheckpointPos, checkpointTimestamp, side, stage.themeColor]);

  // 描画ループ (依存配列は [side, dpr] のみ: Fix G)
  useEffect(() => {
    let animId: number;

    const render = (now: number) => {
      const dt = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      if (dt > 0) {
        const currentFps = 1000 / dt;
        fpsRef.current = fpsRef.current * 0.9 + currentFps * 0.1;
      }

      const {
        stage: curStage,
        traceStates: curTraceStates,
        currentPointerPos: curPointerPos,
        isDrawing: curIsDrawing,
        isCompleted: curIsCompleted,
      } = propsRef.current;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const physicalSize = Math.round(side * dpr);
      if (canvas.width !== physicalSize || canvas.height !== physicalSize) {
        canvas.width = physicalSize;
        canvas.height = physicalSize;
      }
      canvas.style.width = `${side}px`;
      canvas.style.height = `${side}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, side, side);

      // 1. キラキラ粒子の生成
      if (curIsDrawing && curPointerPos && !curIsCompleted) {
        const genCount = fpsRef.current < 45 ? 1 : 2;
        for (let k = 0; k < genCount; k++) {
          if (particlesRef.current.length < PARTICLE_LIMIT) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.4 + Math.random() * 0.8;
            particlesRef.current.push({
              x: curPointerPos.x * side + (Math.random() - 0.5) * 12,
              y: curPointerPos.y * side + (Math.random() - 0.5) * 12,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 0.8,
              color: Math.random() > 0.3 ? curStage.themeColor : '#fde047',
              size: 4 + Math.random() * 6,
              alpha: 1,
              life: 0,
              maxLife: 500 + Math.random() * 200,
            });
          }
        }
      }

      // 2. 粒子の更新と描画
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += 16.6;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3. 波紋エフェクトの更新と描画
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 1.2;
        r.alpha -= 0.03;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. お手本アニメーション（動く指カーソル）
      const idleTime = Date.now() - idleStartTimeRef.current;
      const shouldShowGuide = !curIsCompleted && !curIsDrawing && idleTime > 3000;

      if (shouldShowGuide && curStage.guidePaths.length > 0) {
        const activePathIdx = curTraceStates.findIndex((st) => !st.passed.every(Boolean));
        const targetPath = curStage.guidePaths[activePathIdx >= 0 ? activePathIdx : 0];

        if (targetPath && targetPath.points.length > 1) {
          const cycle = 4000;
          const elapsed = (Date.now() - idleStartTimeRef.current - 3000) % cycle;
          const t = Math.min(1, elapsed / 3000);

          const totalPoints = targetPath.points.length;
          const exactIdx = t * (totalPoints - 1);
          const i0 = Math.floor(exactIdx);
          const i1 = Math.min(i0 + 1, totalPoints - 1);
          const segFrac = exactIdx - i0;

          const pA = targetPath.points[i0];
          const pB = targetPath.points[i1];
          const gx = (pA.x + (pB.x - pA.x) * segFrac) * side;
          const gy = (pA.y + (pB.y - pA.y) * segFrac) * side;

          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.strokeStyle = curStage.themeColor;
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.arc(gx, gy, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = curStage.themeColor;
          ctx.beginPath();
          ctx.arc(gx, gy, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [side, dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30"
    />
  );
};
