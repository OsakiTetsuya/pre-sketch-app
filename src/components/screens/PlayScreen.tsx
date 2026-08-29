import React, { useState, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, ArrowRight, Star } from 'lucide-react';
import { STAGES } from '../../data/stages';
import { useCanvasSize } from '../../hooks/useCanvasSize';
import { DrawingCanvas } from '../canvas/DrawingCanvas';
import { BigButton } from '../common/BigButton';

interface PlayScreenProps {
  stageId: string;
  onBack: () => void;
  onNextStage: (nextStageId: string | null) => void;
  onCompleteStage: (stageId: string) => void;
  onPlayStroke: () => void;
  onPlayCheckpoint: (progress: number) => void;
  onPlaySuccess: () => void;
  onPlayTap: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  stageId,
  onBack,
  onNextStage,
  onCompleteStage,
  onPlayStroke,
  onPlayCheckpoint,
  onPlaySuccess,
  onPlayTap,
}) => {
  const stage = STAGES.find((s) => s.id === stageId) || STAGES[0];
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  const isDrawingRef = useRef(false);
  const { side, dpr, onPointerRelease } = useCanvasSize({
    headerHeight: 80,
    padding: 16,
    isDrawingRef,
  });

  // ステージ切り替え時に状態を初期化
  useEffect(() => {
    setIsCompleted(false);
    setShowModal(false);
  }, [stageId]);

  /** 完成時の処理シーケンス (第10.3節) */
  const handleStageComplete = useCallback(() => {
    if (isCompleted) return;
    setIsCompleted(true);
    onCompleteStage(stage.id);

    // t=0ms: 音声 ＆ 紙吹雪
    onPlaySuccess();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: [stage.themeColor, stage.fillColor, '#fbbf24', '#f472b6'],
      });
    } catch {
      // ignore
    }

    // t=700ms: 完成モーダル表示
    setTimeout(() => {
      setShowModal(true);
    }, 700);
  }, [isCompleted, onCompleteStage, onPlaySuccess, stage]);

  /** やりなおし */
  const handleReset = () => {
    onPlayTap();
    setIsCompleted(false);
    setShowModal(false);
    setResetSignal((n) => n + 1);
  };

  /** つぎへ */
  const handleNext = () => {
    onPlayTap();
    const currentIndex = STAGES.findIndex((s) => s.id === stage.id);
    const nextStage = currentIndex >= 0 && currentIndex < STAGES.length - 1 ? STAGES[currentIndex + 1] : null;
    onNextStage(nextStage ? nextStage.id : null);
  };

  const isLastStage = STAGES[STAGES.length - 1].id === stage.id;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 select-none overflow-hidden touch-none">
      {/* ヘッダーバー */}
      <div className="w-full max-w-lg flex items-center justify-between z-40">
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

        {/* モチーフ名バッジ（ひらがな装飾） */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-slate-400">
            {stage.stageNumber}-{stage.subStageNumber}
          </span>
          <span className="text-xl font-black text-slate-700">
            {stage.motifName}
          </span>
        </div>

        <button
          onClick={handleReset}
          className="w-16 h-16 min-w-[64px] min-h-[64px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
          title="やりなおし"
        >
          <RotateCcw size={28} />
        </button>
      </div>

      {/* 正方形キャンバス中央配置（レターボックス） */}
      <div className="flex-1 flex items-center justify-center w-full my-auto">
        <div className="bg-white rounded-3xl shadow-md p-2 flex items-center justify-center border border-slate-100">
          <DrawingCanvas
            key={stage.id}
            stage={stage}
            side={side}
            dpr={dpr}
            resetSignal={resetSignal}
            isDrawingRef={isDrawingRef}
            onPointerRelease={onPointerRelease}
            onStrokeMove={onPlayStroke}
            onCheckpointHit={(_pt, idx) => {
              const totalPts = stage.guidePaths.reduce((s, p) => s + p.points.length, 0);
              onPlayCheckpoint((idx + 1) / Math.max(1, totalPts));
            }}
            onComplete={handleStageComplete}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      {/* フッタースペーサー */}
      <div className="h-6" />

      {/* 完成モーダル (第10.3節) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-6 border-4 border-amber-300 transform scale-100 animate-in zoom-in-95 duration-200">
            {/* 「やったね！」テキストバッジ */}
            <div className="px-6 py-2 bg-amber-400 text-amber-950 font-black text-3xl rounded-full shadow-md">
              やったね！
            </div>

            {/* 星点灯アニメーション */}
            <div className="relative my-2 animate-bounce">
              <Star size={72} className="fill-amber-400 text-amber-500 drop-shadow-md" />
            </div>

            {/* アクションボタン */}
            <div className="w-full flex items-center justify-center gap-4">
              <BigButton
                variant="secondary"
                size="normal"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw size={28} />
                <span>もういちど</span>
              </BigButton>

              <BigButton
                variant="primary"
                size="normal"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <span>{isLastStage ? 'おしまい' : 'つぎへ'}</span>
                <ArrowRight size={28} />
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
