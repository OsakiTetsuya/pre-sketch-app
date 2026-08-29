import type { StageData } from '../types/game';
import { linePoints, circlePoints, polygonPoints, spiralPoints } from '../utils/geometry';

export const STAGES: StageData[] = [
  // --- Stage 1: せんをひこう ---
  {
    id: 'stage_1_1',
    stageNumber: 1,
    subStageNumber: 1,
    title: 'たてせん',
    motifName: 'あめ',
    themeColor: '#0284c7',
    fillColor: '#38bdf8',
    completionEffect: 'motif',
    guidePaths: [
      { id: 'a', type: 'line', closed: false, points: linePoints({ x: 0.30, y: 0.18 }, { x: 0.30, y: 0.72 }) },
      { id: 'b', type: 'line', closed: false, points: linePoints({ x: 0.50, y: 0.24 }, { x: 0.50, y: 0.78 }) },
      { id: 'c', type: 'line', closed: false, points: linePoints({ x: 0.70, y: 0.18 }, { x: 0.70, y: 0.72 }) },
    ],
  },
  {
    id: 'stage_1_2',
    stageNumber: 1,
    subStageNumber: 2,
    title: 'よこせん',
    motifName: 'くるま',
    themeColor: '#dc2626',
    fillColor: '#f87171',
    completionEffect: 'motif',
    guidePaths: [
      { id: 'a', type: 'line', closed: false, points: linePoints({ x: 0.16, y: 0.34 }, { x: 0.84, y: 0.34 }) },
      { id: 'b', type: 'line', closed: false, points: linePoints({ x: 0.16, y: 0.50 }, { x: 0.84, y: 0.50 }) },
      { id: 'c', type: 'line', closed: false, points: linePoints({ x: 0.16, y: 0.66 }, { x: 0.84, y: 0.66 }) },
    ],
  },
  {
    id: 'stage_1_3',
    stageNumber: 1,
    subStageNumber: 3,
    title: 'ぐるぐるせん',
    motifName: 'キャンディ',
    themeColor: '#db2777',
    fillColor: '#f9a8d4',
    completionEffect: 'motif',
    guidePaths: [
      {
        id: 'spiral',
        type: 'spiral',
        closed: false,
        points: spiralPoints({ x: 0.50, y: 0.50 }, 0.06, 0.34, 2.5),
      },
    ],
  },

  // --- Stage 2: まるをかこう ---
  {
    id: 'stage_2_1',
    stageNumber: 2,
    subStageNumber: 1,
    title: 'おおきなまる',
    motifName: 'りんご',
    themeColor: '#dc2626',
    fillColor: '#ef4444',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'circle', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.54 }, 0.32) },
    ],
  },
  {
    id: 'stage_2_2',
    stageNumber: 2,
    subStageNumber: 2,
    title: 'まるふたつ',
    motifName: 'ゆきだるま',
    themeColor: '#0369a1',
    fillColor: '#bae6fd',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'head', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.30 }, 0.16) },
      { id: 'body', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.66 }, 0.24) },
    ],
  },
  {
    id: 'stage_2_3',
    stageNumber: 2,
    subStageNumber: 3,
    title: 'まる＋せん',
    motifName: 'たいよう',
    themeColor: '#ea580c',
    fillColor: '#fbbf24',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'sun', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.50 }, 0.20) },
      { id: 'ray_n', type: 'line', closed: false, points: linePoints({ x: 0.50, y: 0.24 }, { x: 0.50, y: 0.10 }) },
      { id: 'ray_s', type: 'line', closed: false, points: linePoints({ x: 0.50, y: 0.76 }, { x: 0.50, y: 0.90 }) },
      { id: 'ray_w', type: 'line', closed: false, points: linePoints({ x: 0.24, y: 0.50 }, { x: 0.10, y: 0.50 }) },
      { id: 'ray_e', type: 'line', closed: false, points: linePoints({ x: 0.76, y: 0.50 }, { x: 0.90, y: 0.50 }) },
    ],
  },

  // --- Stage 3: さんかく・しかく ---
  {
    id: 'stage_3_1',
    stageNumber: 3,
    subStageNumber: 1,
    title: 'さんかく',
    motifName: 'おにぎり',
    themeColor: '#57534e',
    fillColor: '#f5f5f4',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'tri',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.50, y: 0.20 },
          { x: 0.82, y: 0.74 },
          { x: 0.18, y: 0.74 },
        ]),
      },
    ],
  },
  {
    id: 'stage_3_2',
    stageNumber: 3,
    subStageNumber: 2,
    title: 'しかく',
    motifName: 'プレゼント',
    themeColor: '#7c3aed',
    fillColor: '#c4b5fd',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'rect',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.22, y: 0.28 },
          { x: 0.78, y: 0.28 },
          { x: 0.78, y: 0.80 },
          { x: 0.22, y: 0.80 },
        ]),
      },
    ],
  },
  {
    id: 'stage_3_3',
    stageNumber: 3,
    subStageNumber: 3,
    title: 'さんかく＋しかく',
    motifName: 'おうち',
    themeColor: '#b45309',
    fillColor: '#fcd34d',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'roof',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.50, y: 0.16 },
          { x: 0.84, y: 0.44 },
          { x: 0.16, y: 0.44 },
        ]),
      },
      {
        id: 'wall',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.24, y: 0.44 },
          { x: 0.76, y: 0.44 },
          { x: 0.76, y: 0.84 },
          { x: 0.24, y: 0.84 },
        ]),
      },
    ],
  },

  // --- Stage 4: かたちの合体 ---
  {
    id: 'stage_4_1',
    stageNumber: 4,
    subStageNumber: 1,
    title: '△＋○',
    motifName: 'アイスクリーム',
    themeColor: '#be123c',
    fillColor: '#fda4af',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'cone',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.28, y: 0.48 },
          { x: 0.72, y: 0.48 },
          { x: 0.50, y: 0.88 },
        ]),
      },
      { id: 'scoop', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.36 }, 0.20) },
    ],
  },
  {
    id: 'stage_4_2',
    stageNumber: 4,
    subStageNumber: 2,
    title: '□＋○＋○',
    motifName: 'くるま',
    themeColor: '#1d4ed8',
    fillColor: '#60a5fa',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'body',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.16, y: 0.38 },
          { x: 0.84, y: 0.38 },
          { x: 0.84, y: 0.66 },
          { x: 0.16, y: 0.66 },
        ]),
      },
      { id: 'wheelL', type: 'circle', closed: true, points: circlePoints({ x: 0.30, y: 0.72 }, 0.10) },
      { id: 'wheelR', type: 'circle', closed: true, points: circlePoints({ x: 0.70, y: 0.72 }, 0.10) },
    ],
  },
  {
    id: 'stage_4_3',
    stageNumber: 4,
    subStageNumber: 3,
    title: '○＋△＋△',
    motifName: 'ねこさん',
    themeColor: '#78350f',
    fillColor: '#fbbf24',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'face', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.58 }, 0.26) },
      {
        id: 'earL',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.28, y: 0.40 },
          { x: 0.40, y: 0.20 },
          { x: 0.46, y: 0.42 },
        ]),
      },
      {
        id: 'earR',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.72, y: 0.40 },
          { x: 0.60, y: 0.20 },
          { x: 0.54, y: 0.42 },
        ]),
      },
    ],
  },

  // --- Stage 5: もっとかたちを合体しよう（生きもの・乗りもの） ---
  {
    id: 'stage_5_1',
    stageNumber: 5,
    subStageNumber: 1,
    title: '○＋○＋△',
    motifName: 'ぺんぎん',
    themeColor: '#0f172a',
    fillColor: '#38bdf8',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'head', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.32 }, 0.15) },
      { id: 'body', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.65 }, 0.22) },
      {
        id: 'beak',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.40, y: 0.30 },
          { x: 0.20, y: 0.34 },
          { x: 0.40, y: 0.38 },
        ]),
      },
      {
        id: 'wing',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.64, y: 0.52 },
          { x: 0.82, y: 0.66 },
          { x: 0.64, y: 0.72 },
        ]),
      },
    ],
  },
  {
    id: 'stage_5_2',
    stageNumber: 5,
    subStageNumber: 2,
    title: '○＋○＋○＋○',
    motifName: 'くまさん',
    themeColor: '#78350f',
    fillColor: '#fbbf24',
    completionEffect: 'fill',
    guidePaths: [
      { id: 'face', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.56 }, 0.25) },
      { id: 'earL', type: 'circle', closed: true, points: circlePoints({ x: 0.32, y: 0.34 }, 0.10) },
      { id: 'earR', type: 'circle', closed: true, points: circlePoints({ x: 0.68, y: 0.34 }, 0.10) },
      { id: 'snout', type: 'circle', closed: true, points: circlePoints({ x: 0.50, y: 0.64 }, 0.09) },
    ],
  },
  {
    id: 'stage_5_3',
    stageNumber: 5,
    subStageNumber: 3,
    title: '□＋△＋せん',
    motifName: 'しんかんせん',
    themeColor: '#0369a1',
    fillColor: '#bae6fd',
    completionEffect: 'fill',
    guidePaths: [
      {
        id: 'body',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.14, y: 0.62 },
          { x: 0.62, y: 0.62 },
          { x: 0.86, y: 0.56 },
          { x: 0.68, y: 0.38 },
          { x: 0.14, y: 0.38 },
        ]),
      },
      { id: 'line', type: 'line', closed: false, points: linePoints({ x: 0.14, y: 0.52 }, { x: 0.76, y: 0.52 }) },
      {
        id: 'cockpit',
        type: 'polygon',
        closed: true,
        points: polygonPoints([
          { x: 0.60, y: 0.42 },
          { x: 0.72, y: 0.48 },
          { x: 0.60, y: 0.48 },
        ]),
      },
    ],
  },
];

export const STAGE_ORDER = STAGES.map((s) => s.id);
