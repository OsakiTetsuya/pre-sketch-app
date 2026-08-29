import { STORAGE_KEY } from '../constants';
import type { UserProgress } from '../types/game';
import { STAGES } from '../data/stages';

export const DEFAULT_USER_PROGRESS: UserProgress = {
  unlockedStages: STAGES.map((s) => s.id),
  completedStages: {},
  soundEnabled: true,
};

/**
 * localStorage から進捗を取得する（全ステージ開放）
 */
export const loadProgress = (): UserProgress => {
  const allStageIds = STAGES.map((s) => s.id);
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_USER_PROGRESS;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      // 最初から全ステージを選択可能にする
      unlockedStages: allStageIds,
      completedStages:
        parsed.completedStages && typeof parsed.completedStages === 'object'
          ? parsed.completedStages
          : {},
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch (err) {
    console.warn('Failed to load progress from localStorage:', err);
    return DEFAULT_USER_PROGRESS;
  }
};

/**
 * localStorage に進捗を保存する（例外安全）
 */
export const saveProgress = (progress: UserProgress): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Failed to save progress to localStorage:', err);
  }
};

/**
 * 進捗を初期状態にリセットする
 */
export const resetProgress = (): UserProgress => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to reset progress in localStorage:', err);
  }
  return DEFAULT_USER_PROGRESS;
};
