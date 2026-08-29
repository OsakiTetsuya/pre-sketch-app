import React, { useState, useRef, useEffect } from 'react';
import { Settings, X, RotateCcw, Unlock, Volume2, VolumeX } from 'lucide-react';
import { BigButton } from './BigButton';

interface ParentalGateModalProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUnlockAll: () => void;
  onResetProgress: () => void;
  onPlayTap?: () => void;
}

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  soundEnabled,
  onToggleSound,
  onUnlockAll,
  onResetProgress,
  onPlayTap,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0.0 to 1.0

  const pressStartTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const HOLD_DURATION = 3000; // 3秒

  const handlePointerDown = () => {
    onPlayTap?.();
    setIsPressing(true);
    pressStartTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!pressStartTimeRef.current) return;
      const elapsed = Date.now() - pressStartTimeRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION);
      setPressProgress(p);

      if (p >= 1) {
        setIsPressing(false);
        setPressProgress(0);
        pressStartTimeRef.current = null;
        setIsOpen(true);
      } else {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePointerUpOrCancel = () => {
    setIsPressing(false);
    setPressProgress(0);
    pressStartTimeRef.current = null;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const circumference = 2 * Math.PI * 26; // r=26 -> ~163.36
  const strokeDashoffset = circumference - pressProgress * circumference;

  return (
    <>
      {/* トリガーボタン（3秒長押し） */}
      <div className="relative flex items-center justify-center">
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUpOrCancel}
          onPointerLeave={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          className="relative w-16 h-16 min-w-[64px] min-h-[64px] flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-slate-500 shadow-sm border border-slate-200 select-none touch-none active:scale-95 cursor-pointer"
          title="ほごしゃメニュー（3びょう ながオシ）"
        >
          <Settings size={28} />

          {/* 長押し時の円形プログレス */}
          {isPressing && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#0284c7"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* 保護者向け設定モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">保護者メニュー</h2>
              <button
                onClick={() => {
                  onPlayTap?.();
                  setIsOpen(false);
                }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* 音声トグル */}
              <button
                onClick={() => {
                  onPlayTap?.();
                  onToggleSound();
                }}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 size={24} className="text-sky-500" /> : <VolumeX size={24} className="text-slate-400" />}
                  <span>効果音</span>
                </div>
                <span className="text-sm font-extrabold text-sky-600">
                  {soundEnabled ? 'ON' : 'OFF'}
                </span>
              </button>

              {/* 全ステージ開放 */}
              <button
                onClick={() => {
                  onPlayTap?.();
                  onUnlockAll();
                  setIsOpen(false);
                }}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Unlock size={24} className="text-amber-500" />
                  <span>全ステージを開放</span>
                </div>
              </button>

              {/* 進捗リセット */}
              <button
                onClick={() => {
                  onPlayTap?.();
                  if (window.confirm('進捗をリセットしますか？')) {
                    onResetProgress();
                    setIsOpen(false);
                  }
                }}
                className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 font-bold text-rose-600 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw size={24} className="text-rose-500" />
                  <span>進捗を初期化</span>
                </div>
              </button>
            </div>

            <BigButton
              variant="primary"
              size="normal"
              onClick={() => {
                onPlayTap?.();
                setIsOpen(false);
              }}
              className="w-full mt-2"
            >
              とじる
            </BigButton>
          </div>
        </div>
      )}
    </>
  );
};
