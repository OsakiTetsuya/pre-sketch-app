import { describe, it, expect } from 'vitest';
import {
  dist,
  linePoints,
  circlePoints,
  createTraceState,
  advanceTrace,
  traceProgress,
  isStageComplete,
  isPathComplete,
} from '../geometry';
import { DEFAULT_TOLERANCE } from '../../constants';

describe('geometry utilities', () => {
  it('calculates euclidean distance correctly', () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('generates line checkpoints with correct spacing', () => {
    const pts = linePoints({ x: 0, y: 0 }, { x: 1, y: 0 }, 0.1);
    expect(pts.length).toBe(11);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[10]).toEqual({ x: 1, y: 0 });
  });

  it('generates circle points starting at top by default', () => {
    const pts = circlePoints({ x: 0.5, y: 0.5 }, 0.2, 0.1);
    expect(pts.length).toBeGreaterThan(6);
    expect(pts[0].x).toBeCloseTo(0.5);
    expect(pts[0].y).toBeCloseTo(0.3); // -PI/2 -> y = 0.5 - 0.2 = 0.3
  });
});

describe('advanceTrace algorithm', () => {
  const line = linePoints({ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, 0.05);
  const n = line.length;
  const tolerance = DEFAULT_TOLERANCE;

  it('case 1: does not advance when touching midpoint before start', () => {
    const initial = createTraceState(n);
    const midPoint = line[Math.floor(n / 2)];
    const afterTouch = advanceTrace(initial, line, midPoint, tolerance);

    expect(afterTouch.started).toBe(false);
    expect(afterTouch.cursor).toBe(0);
    expect(traceProgress(afterTouch)).toBe(0);
  });

  it('case 2: reaches 1.0 progress when following line in order', () => {
    let state = createTraceState(n);
    // Touch every checkpoint in order
    for (const pt of line) {
      state = advanceTrace(state, line, pt, tolerance);
    }
    expect(state.started).toBe(true);
    expect(traceProgress(state)).toBe(1.0);
    expect(isStageComplete([state])).toBe(true);
  });

  it('case 3: random points away from start/path do not increase progress (anti-scribble)', () => {
    let state = createTraceState(n);
    // Random points around the canvas
    const randomPoints = [
      { x: 0.9, y: 0.9 },
      { x: 0.1, y: 0.8 },
      { x: 0.5, y: 0.7 },
      { x: 0.3, y: 0.9 },
    ];
    for (const pt of randomPoints) {
      state = advanceTrace(state, line, pt, tolerance);
    }
    expect(state.started).toBe(false);
    expect(traceProgress(state)).toBe(0);
  });

  it('case 4: moving backward does not decrease progress', () => {
    let state = createTraceState(n);
    // Move halfway
    const half = Math.floor(n / 2);
    for (let i = 0; i <= half; i++) {
      state = advanceTrace(state, line, line[i], tolerance);
    }
    const progressBefore = traceProgress(state);

    // Move backwards
    for (let i = half - 1; i >= 0; i--) {
      state = advanceTrace(state, line, line[i], tolerance);
    }
    expect(traceProgress(state)).toBe(progressBefore);
  });

  it('case 5: allows small skips (LOOKAHEAD = 2) and advances cursor', () => {
    let state = createTraceState(n);
    // Start at checkpoint 0
    state = advanceTrace(state, line, line[0], tolerance);
    expect(state.started).toBe(true);
    expect(state.cursor).toBe(1);

    // Move finger to checkpoint 2 (lookahead allows advance)
    state = advanceTrace(state, line, line[2], tolerance);
    state = advanceTrace(state, line, line[2], tolerance);
    expect(state.cursor).toBe(3);
    expect(state.passed[0]).toBe(true);
    expect(state.passed[1]).toBe(true);
    expect(state.passed[2]).toBe(true);
  });

  it('case 6: ぐしゃぐしゃ描きではクリアできない（DoD #3）', () => {
    // 決定論的な擬似乱数でランダムウォークを生成する
    let s = 42;
    const rnd = () => {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    let state = createTraceState(line.length);
    let x = 0.5,
      y = 0.5;
    for (let i = 0; i < 3000; i++) {
      const a = rnd() * Math.PI * 2;
      x = Math.min(1, Math.max(0, x + Math.cos(a) * 0.03));
      y = Math.min(1, Math.max(0, y + Math.sin(a) * 0.03));
      state = advanceTrace(state, line, { x, y }, tolerance);
    }
    // 進行度は上がってもよいが、on-path 率が低いので完了してはならない
    expect(isPathComplete(state)).toBe(false);
  });

  it('case 7: ていねいになぞればクリアできる（甘口判定の維持）', () => {
    let state = createTraceState(line.length);
    for (const pt of line) {
      // 各チェックポイントで少し揺れながら通過する
      state = advanceTrace(state, line, { x: pt.x, y: pt.y + 0.015 }, tolerance);
      state = advanceTrace(state, line, { x: pt.x, y: pt.y - 0.015 }, tolerance);
    }
    expect(isPathComplete(state)).toBe(true);
  });
});
