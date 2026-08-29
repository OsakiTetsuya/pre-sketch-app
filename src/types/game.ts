/** キャンバス基準の正規化座標（0.0 〜 1.0） */
export type Point = {
  x: number;
  y: number;
};

export type PathSegment = {
  id: string;
  type: 'line' | 'arc' | 'circle' | 'polygon' | 'spiral';
  /** チェックポイント列。geometry.ts のヘルパーで生成する */
  points: Point[];
  /** 判定許容半径。省略時は DEFAULT_TOLERANCE (0.08) */
  toleranceRadius?: number;
  /** 閉じた図形か。塗りつぶし可否の判断に使う */
  closed?: boolean;
};

/** 完成時の演出種別（第10.4節） */
export type CompletionEffect = 'fill' | 'motif';

export type StageData = {
  id: string;               // 'stage_1_1'
  stageNumber: number;      // 1
  subStageNumber: number;   // 1
  title: string;            // 'たてせん'
  motifName: string;        // 'あめ'
  themeColor: string;       // '#0284c7' ユーザーが引く線の色
  fillColor: string;        // '#38bdf8' 完成時の塗り色
  completionEffect: CompletionEffect;
  guidePaths: PathSegment[];
};

export type UserProgress = {
  /** 開放済みステージ ID。初期値は ['stage_1_1'] */
  unlockedStages: string[];
  completedStages: Record<string, { stars: number; completedAt: string }>;
  soundEnabled: boolean;
};

/** なぞり進行状態（第6.3節） */
export type TraceState = {
  cursor: number;
  passed: boolean[];
  started: boolean;
  /** 入力点がガイド上にあった割合の指数移動平均。初期値 1.0 */
  onPathRate: number;
};

export type Screen =
  | { name: 'home' }
  | { name: 'stageSelect' }
  | { name: 'play'; stageId: string };
