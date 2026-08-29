import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { STAGES } from '../../data/stages';
import type { StageData, UserProgress } from '../../types/game';
import { StarBadge } from '../common/StarBadge';

interface StageSelectScreenProps {
  progress: UserProgress;
  onSelectStage: (stageId: string) => void;
  onBack: () => void;
  onPlayTap: () => void;
}

export const StageSelectScreen: React.FC<StageSelectScreenProps> = ({
  progress,
  onSelectStage,
  onBack,
  onPlayTap,
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden">
      {/* トップバー */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-2">
        <button
          onClick={() => {
            onPlayTap();
            onBack();
          }}
          className="w-16 h-16 min-w-[64px] min-h-[64px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
          title="もどる"
        >
          <ArrowLeft size={32} />
        </button>

        <div className="text-xl font-extrabold text-slate-700">
          ステージをえらぶ
        </div>

        <div className="w-16" /> {/* スペーサー */}
      </div>

      {/* 12枚のステージカードグリッド */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto overflow-x-hidden p-2 grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 items-center justify-items-center auto-rows-max">
        {STAGES.map((stage) => {
          const isUnlocked = progress.unlockedStages.includes(stage.id);
          const isCompleted = Boolean(progress.completedStages[stage.id]);

          return (
            <StageCard
              key={stage.id}
              stage={stage}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              onClick={() => {
                if (!isUnlocked) return; // ロック状態は無反応（第4.1節）
                onPlayTap();
                onSelectStage(stage.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface StageCardProps {
  stage: StageData;
  isUnlocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const StageCard: React.FC<StageCardProps> = ({
  stage,
  isUnlocked,
  isCompleted,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!isUnlocked}
      className={`relative w-full aspect-square max-w-[140px] rounded-3xl p-2 flex flex-col items-center justify-center transition-all duration-200 select-none touch-manipulation ${
        !isUnlocked
          ? 'bg-slate-200 text-slate-400 opacity-60 border-2 border-slate-300 cursor-not-allowed'
          : isCompleted
          ? 'bg-white shadow-md hover:shadow-lg border-2 border-amber-300 active:scale-95 cursor-pointer'
          : 'bg-white shadow-sm hover:shadow-md border-2 border-dashed border-sky-300 active:scale-95 cursor-pointer'
      }`}
    >
      {/* ロック時の鍵アイコン */}
      {!isUnlocked ? (
        <div className="flex flex-col items-center justify-center gap-1">
          <Lock size={36} className="text-slate-400" />
        </div>
      ) : (
        <>
          {/* 星バッジ（クリア時） */}
          <div className="absolute top-2 right-2">
            {isCompleted && <StarBadge size={22} active={true} />}
          </div>

          {/* ステージの図形シルエットプレビュー */}
          <div className="w-16 h-16 flex items-center justify-center">
            <StageSilhouette stage={stage} isCompleted={isCompleted} />
          </div>
        </>
      )}
    </button>
  );
};

/**
 * ステージごとの幾何プレビュー（SVG）
 */
const StageSilhouette: React.FC<{ stage: StageData; isCompleted: boolean }> = ({
  stage,
  isCompleted,
}) => {
  const color = isCompleted ? stage.themeColor : '#94a3b8';
  const fillColor = isCompleted ? stage.fillColor : 'none';

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {stage.guidePaths.map((path, i) => {
        if (path.points.length < 2) return null;
        const d = path.points.reduce(
          (acc, p, idx) =>
            `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x * 100} ${p.y * 100}`,
          ''
        );
        const finalD = path.closed ? `${d} Z` : d;

        return (
          <path
            key={i}
            d={finalD}
            stroke={color}
            strokeWidth={path.closed && isCompleted ? 4 : 6}
            strokeDasharray={isCompleted ? 'none' : '4, 4'}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={path.closed && isCompleted ? fillColor : 'none'}
          />
        );
      })}
    </svg>
  );
};
