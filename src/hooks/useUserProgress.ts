import { useState, useEffect, useCallback } from 'react';
import type { UserProgress } from '../types/game';
import { loadProgress, saveProgress, resetProgress as clearStorage } from '../utils/storage';
import { STAGES } from '../data/stages';

export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());

  // 進捗が更新されるたびに localStorage へ保存
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  /** ステージ完了処理 */
  const completeStage = useCallback((stageId: string, stars = 1) => {
    setProgress((prev) => {
      const now = new Date().toISOString();
      const nextCompleted = {
        ...prev.completedStages,
        [stageId]: { stars, completedAt: now },
      };

      return {
        ...prev,
        completedStages: nextCompleted,
        unlockedStages: STAGES.map((s) => s.id),
      };
    });
  }, []);

  /** 音量の ON/OFF トグル */
  const toggleSound = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  /** 全ステージ開放 */
  const unlockAllStages = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      unlockedStages: STAGES.map((s) => s.id),
    }));
  }, []);

  /** 進捗リセット */
  const resetAllProgress = useCallback(() => {
    const fresh = clearStorage();
    setProgress(fresh);
  }, []);

  return {
    progress,
    completeStage,
    toggleSound,
    unlockAllStages,
    resetAllProgress,
  };
};
