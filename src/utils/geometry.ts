import {
  LOOKAHEAD,
  DEFAULT_TOLERANCE,
  COMPLETION_THRESHOLD,
  ON_PATH_THRESHOLD,
  ON_PATH_ALPHA,
  CHECKPOINT_STEP,
} from '../constants';
import type { Point, TraceState } from '../types/game';

export { type Point, type TraceState };

/** 2点間のユークリッド距離 */
export const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

/** 直線を等間隔のチェックポイント列に変換 */
export const linePoints = (from: Point, to: Point, step = CHECKPOINT_STEP): Point[] => {
  const n = Math.max(2, Math.ceil(dist(from, to) / step));
  return Array.from({ length: n + 1 }, (_, i) => ({
    x: from.x + (to.x - from.x) * (i / n),
    y: from.y + (to.y - from.y) * (i / n),
  }));
};

/** 円（既定で真上 -PI/2 から時計回り） */
export const circlePoints = (
  c: Point,
  r: number,
  step = CHECKPOINT_STEP,
  startAngle = -Math.PI / 2
): Point[] => {
  const n = Math.max(8, Math.ceil((2 * Math.PI * r) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = startAngle + (2 * Math.PI * i) / n;
    return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
  });
};

/** 多角形（closed=true で最初の頂点に戻る） */
export const polygonPoints = (
  verts: Point[],
  step = CHECKPOINT_STEP,
  closed = true
): Point[] => {
  if (verts.length === 0) return [];
  const vs = closed ? [...verts, verts[0]] : verts;
  const out: Point[] = [];
  for (let i = 0; i < vs.length - 1; i++) {
    const seg = linePoints(vs[i], vs[i + 1], step);
    out.push(...(i === 0 ? seg : seg.slice(1))); // 頂点の重複を除く
  }
  return out;
};

/** 渦巻き（Stage 1-3 用） */
export const spiralPoints = (
  c: Point,
  rStart: number,
  rEnd: number,
  turns: number,
  step = CHECKPOINT_STEP
): Point[] => {
  const total = 2 * Math.PI * turns;
  const n = Math.max(16, Math.ceil((2 * Math.PI * ((rStart + rEnd) / 2) * turns) / step));
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const a = total * t;
    const r = rStart + (rEnd - rStart) * t;
    return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
  });
};

/** TraceState の初期化 */
export const createTraceState = (n: number): TraceState => ({
  cursor: 0,
  passed: new Array(n).fill(false),
  started: false,
  onPathRate: 1,
});

/**
 * 指の現在位置 p を受け取り、進行状態を更新して返す（純関数）。
 */
export const advanceTrace = (
  state: TraceState,
  checkpoints: Point[],
  p: Point,
  tolerance = DEFAULT_TOLERANCE
): TraceState => {
  if (checkpoints.length === 0) return state;

  // --- 開始判定: 始点付近に触れるまで何も進めない ---
  if (!state.started) {
    if (dist(p, checkpoints[0]) > tolerance) return state;
    return advanceTrace({ ...state, started: true }, checkpoints, p, tolerance);
  }

  // --- on-path 率の更新（開始以降のすべての点が対象） ---
  // パス全体のどのチェックポイントかに近ければ on-path とみなす。
  // 「カーソル近傍のみ」にすると、仕様で許容している逆走が off-path 扱いになってしまう。
  const onPath = checkpoints.some((c) => dist(p, c) <= tolerance) ? 1 : 0;
  const counted: TraceState = {
    ...state,
    onPathRate: state.onPathRate * (1 - ON_PATH_ALPHA) + onPath * ON_PATH_ALPHA,
  };

  if (counted.cursor >= checkpoints.length) return counted;

  // --- 進行判定: cursor から LOOKAHEAD 先までを順に見る ---
  const end = Math.min(counted.cursor + LOOKAHEAD, checkpoints.length - 1);
  for (let i = counted.cursor; i <= end; i++) {
    if (dist(p, checkpoints[i]) <= tolerance) {
      const passed = [...counted.passed];
      for (let j = counted.cursor; j <= i; j++) passed[j] = true;
      return { ...counted, passed, cursor: i + 1 };
    }
  }
  return counted;
};

/** 進行度 (0.0 〜 1.0) */
export const traceProgress = (state: TraceState): number => {
  if (state.passed.length === 0) return 0;
  return state.passed.filter(Boolean).length / state.passed.length;
};

/** 1つのパスが完了しているか（進行度と on-path 率の両方を満たすこと） */
export const isPathComplete = (
  s: TraceState,
  threshold = COMPLETION_THRESHOLD
): boolean => traceProgress(s) >= threshold && s.onPathRate >= ON_PATH_THRESHOLD;

/** 全パスが完了閾値を超えているか判定 */
export const isStageComplete = (
  states: TraceState[],
  threshold = COMPLETION_THRESHOLD
): boolean => states.length > 0 && states.every((s) => isPathComplete(s, threshold));
