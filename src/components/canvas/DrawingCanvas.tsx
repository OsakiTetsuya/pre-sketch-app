import React, { useRef, useEffect, useState, useCallback } from 'react';
import { STROKE_WIDTH, MIN_POINT_DISTANCE, DEFAULT_TOLERANCE } from '../../constants';
import type { Point, StageData, TraceState } from '../../types/game';
import { advanceTrace, isStageComplete, isPathComplete, dist, createTraceState } from '../../utils/geometry';
import { drawSmoothPath } from '../../utils/bezier';
import { GuideOverlay } from './GuideOverlay';
import { ParticleCanvas } from './ParticleCanvas';

interface DrawingCanvasProps {
  stage: StageData;
  side: number;
  dpr: number;
  onPointerRelease: () => void;
  isDrawingRef?: React.RefObject<boolean>;
  resetSignal?: number;
  onTraceUpdate?: (states: TraceState[], progress: number) => void;
  onCheckpointHit?: (checkpoint: Point, index: number) => void;
  onStrokeMove?: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  stage,
  side,
  dpr,
  onPointerRelease,
  isDrawingRef,
  resetSignal = 0,
  onTraceUpdate,
  onCheckpointHit,
  onStrokeMove,
  onComplete,
  isCompleted = false,
}) => {
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeId = useRef<number | null>(null);

  // ユーザーの描いたストローク配列（正規化座標の連続点配列のリスト）
  const strokesRef = useRef<Point[][]>([]);
  // 現在描画中のストローク
  const currentStrokeRef = useRef<Point[]>([]);

  // なぞり進行状態（Fix D: ref に真の値を保持）
  const traceStatesRef = useRef<TraceState[]>([]);
  const [traceStates, setTraceStates] = useState<TraceState[]>([]);

  // 現在追跡中のガイドパス index (Fix E)
  const activePathIdxRef = useRef<number>(-1);

  // 全ストロークの再描画
  const redrawAllStrokes = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const physicalSize = Math.round(side * dpr);
    if (canvas.width !== physicalSize || canvas.height !== physicalSize) {
      canvas.width = physicalSize;
      canvas.height = physicalSize;
    }
    canvas.style.width = `${side}px`;
    canvas.style.height = `${side}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, side, side);

    ctx.strokeStyle = stage.themeColor;
    ctx.fillStyle = stage.themeColor;
    ctx.lineWidth = isCompleted && stage.completionEffect === 'motif' ? 28 : STROKE_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 過去の完了ストロークを描画
    for (const stroke of strokesRef.current) {
      drawSmoothPath(ctx, stroke, side);
    }

    // 現在描画中のストロークを描画
    if (currentStrokeRef.current.length > 0) {
      drawSmoothPath(ctx, currentStrokeRef.current, side);
    }
  }, [side, dpr, stage.themeColor, stage.completionEffect, isCompleted]);

  // 初期化とステージ切替・リセット (Fix A, B-4, D)
  useEffect(() => {
    const init = stage.guidePaths.map((p) => createTraceState(p.points.length));
    traceStatesRef.current = init;
    setTraceStates(init);
    strokesRef.current = [];
    currentStrokeRef.current = [];
    activePathIdxRef.current = -1;
    redrawAllStrokes();
  }, [stage, resetSignal, redrawAllStrokes]);

  // サイズ変更時に再描画
  useEffect(() => {
    redrawAllStrokes();
  }, [redrawAllStrokes]);

  // 現在のポインタ位置（粒子演出用）
  const [currentPointerPos, setCurrentPointerPos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // チェックポイント波紋用
  const [lastCheckpointPos, setLastCheckpointPos] = useState<Point | null>(null);
  const [checkpointTimestamp, setCheckpointTimestamp] = useState<number>(0);

  // 完成時フェードインアニメーション用
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  // 完成アニメーションのトリガー
  useEffect(() => {
    if (isCompleted) {
      const startTime = performance.now();
      const animDuration = 400;

      const animateCompletion = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / animDuration);
        setCompletionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animateCompletion);
        } else {
          setIsBouncing(true);
          setTimeout(() => setIsBouncing(false), 300);
        }
      };
      requestAnimationFrame(animateCompletion);
    } else {
      setCompletionProgress(0);
      setIsBouncing(false);
    }
  }, [isCompleted]);

  /** 正規化座標をキャンバスピクセル座標へ */
  const toNormalized = (clientX: number, clientY: number, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  /** 未完成パスのうち、指の位置に最も近いものを選ぶ (Fix E) */
  const pickPath = (p: Point): number => {
    const states = traceStatesRef.current;
    let best = -1;
    let bestD = Infinity;
    stage.guidePaths.forEach((path, i) => {
      const st = states[i];
      if (!st || isPathComplete(st)) return; // 完成済みは対象外
      // 開始済みなら現在のカーソル位置、未開始なら始点を基準に測る
      const anchor = st.started
        ? path.points[Math.min(st.cursor, path.points.length - 1)]
        : path.points[0];
      const d = dist(p, anchor);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };

  // ポインタ移動時のなぞり判定 (Fix D, E)
  const processPoint = (p: Point) => {
    if (isCompleted) return;
    onStrokeMove?.();

    const prev = traceStatesRef.current;
    const idx = activePathIdxRef.current;
    if (idx < 0 || idx >= prev.length) return;

    const path = stage.guidePaths[idx];
    const tolerance = path.toleranceRadius ?? DEFAULT_TOLERANCE;
    const nextState = advanceTrace(prev[idx], path.points, p, tolerance);

    // 参照が変わらない＝何も起きていない
    if (nextState === prev[idx]) return;

    const next = [...prev];
    next[idx] = nextState;
    traceStatesRef.current = next;
    setTraceStates(next); // 値を渡すだけ。updater は使わない

    // --- ここから副作用（updater の外） ---
    if (nextState.cursor > prev[idx].cursor && nextState.cursor - 1 < path.points.length) {
      const hit = path.points[nextState.cursor - 1];
      setLastCheckpointPos(hit);
      setCheckpointTimestamp(Date.now());
      onCheckpointHit?.(hit, nextState.cursor - 1);
    }

    const totalPassed = next.reduce((sum, s) => sum + s.passed.filter(Boolean).length, 0);
    const totalPoints = stage.guidePaths.reduce((sum, gp) => sum + gp.points.length, 0);
    onTraceUpdate?.(next, totalPassed / Math.max(1, totalPoints));

    if (isStageComplete(next)) {
      onComplete?.();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    if (activeId.current !== null) return; // 2本目以降は無視（パームリジェクション）

    activeId.current = e.pointerId;
    if (isDrawingRef) isDrawingRef.current = true; // Fix C
    e.currentTarget.setPointerCapture(e.pointerId);

    const normPt = toNormalized(e.clientX, e.clientY, e.currentTarget);
    activePathIdxRef.current = pickPath(normPt); // Fix E

    currentStrokeRef.current = [normPt];
    setCurrentPointerPos(normPt);
    setIsDrawing(true);

    processPoint(normPt);
    redrawAllStrokes();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activeId.current || isCompleted) return;

    const events = (e.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [e.nativeEvent];
    const canvas = e.currentTarget;

    for (const ev of events) {
      const normPt = toNormalized(ev.clientX, ev.clientY, canvas);
      setCurrentPointerPos(normPt);

      // 間引き判定
      const lastPt = currentStrokeRef.current[currentStrokeRef.current.length - 1];
      if (!lastPt || dist(lastPt, normPt) >= MIN_POINT_DISTANCE) {
        currentStrokeRef.current.push(normPt);
        processPoint(normPt);
      }
    }

    redrawAllStrokes();
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activeId.current) return;
    activeId.current = null;
    setIsDrawing(false);
    setCurrentPointerPos(null);

    // 順序が重要: onPointerRelease より前に isDrawingRef を false にする (Fix C)
    if (isDrawingRef) isDrawingRef.current = false;

    // 現在のストロークを完了ストローク配列に追加
    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }

    // 保留中のリサイズを適用
    onPointerRelease();
  };

  return (
    <div
      className={`relative select-none touch-none transition-transform duration-300 ${
        isBouncing ? 'scale-105' : 'scale-100'
      }`}
      style={{
        width: `${side}px`,
        height: `${side}px`,
      }}
    >
      {/* レイヤー 1: ガイド層 */}
      <GuideOverlay
        stage={stage}
        side={side}
        dpr={dpr}
        traceStates={traceStates}
        isCompleted={isCompleted}
        completionProgress={completionProgress}
      />

      {/* レイヤー 2: 描画層 */}
      <canvas
        ref={drawingCanvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className="absolute inset-0 z-20 cursor-crosshair touch-none"
        style={{
          width: `${side}px`,
          height: `${side}px`,
        }}
      />

      {/* レイヤー 3: 演出層 */}
      <ParticleCanvas
        side={side}
        dpr={dpr}
        stage={stage}
        traceStates={traceStates}
        currentPointerPos={currentPointerPos}
        isDrawing={isDrawing}
        lastCheckpointPos={lastCheckpointPos}
        checkpointTimestamp={checkpointTimestamp}
        isCompleted={isCompleted}
      />
    </div>
  );
};
