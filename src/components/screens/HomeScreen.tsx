import React from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { BigButton } from '../common/BigButton';
import { ParentalGateModal } from '../common/ParentalGateModal';

interface HomeScreenProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStartPlay: () => void;
  onUnlockAll: () => void;
  onResetProgress: () => void;
  onPlayTap: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  soundEnabled,
  onToggleSound,
  onStartPlay,
  onUnlockAll,
  onResetProgress,
  onPlayTap,
}) => {
  const handleStart = () => {
    onPlayTap();
    onStartPlay();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-6 select-none">
      {/* トップバー（音量トグル ＆ 保護者メニュー） */}
      <div className="w-full max-w-md flex items-center justify-between">
        <button
          onClick={() => {
            onPlayTap();
            onToggleSound();
          }}
          className="w-16 h-16 min-w-[64px] min-h-[64px] flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-sm border border-slate-200 active:scale-95 cursor-pointer"
          title="おと"
        >
          {soundEnabled ? <Volume2 size={32} className="text-sky-500" /> : <VolumeX size={32} className="text-slate-400" />}
        </button>

        <ParentalGateModal
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          onUnlockAll={onUnlockAll}
          onResetProgress={onResetProgress}
          onPlayTap={onPlayTap}
        />
      </div>

      {/* タイトルロゴ（○△□ モチーフ） */}
      <div className="flex flex-col items-center gap-4 my-auto">
        <div className="flex items-center gap-3">
          {/* 丸 */}
          <div className="w-14 h-14 rounded-full bg-rose-400 shadow-md flex items-center justify-center text-white text-2xl font-black">
            ○
          </div>
          {/* 三角 */}
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[52px] border-b-amber-400 drop-shadow-md" />
          {/* 四角 */}
          <div className="w-14 h-14 rounded-2xl bg-sky-400 shadow-md flex items-center justify-center text-white text-2xl font-black">
            □
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-wider drop-shadow-xs">
          PreSketch
        </h1>
        <p className="text-sm font-bold text-slate-400">
          ゆびで なぞって あそぼう！
        </p>
      </div>

      {/* 巨大「あそぶ」ボタン */}
      <div className="w-full max-w-sm flex justify-center pb-8">
        <BigButton
          variant="primary"
          size="large"
          onClick={handleStart}
          className="w-4/5 py-8 text-3xl shadow-xl flex items-center gap-3"
        >
          <Play size={40} className="fill-white" />
          <span>あそぶ</span>
        </BigButton>
      </div>
    </div>
  );
};
