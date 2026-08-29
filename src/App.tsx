import React, { useState, useEffect, useRef } from 'react';
import type { Screen } from './types/game';
import { useUserProgress } from './hooks/useUserProgress';
import { useSoundEffects, unlockAudio } from './hooks/useSoundEffects';
import { HomeScreen } from './components/screens/HomeScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { PlayScreen } from './components/screens/PlayScreen';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const {
    progress,
    completeStage,
    toggleSound,
    unlockAllStages,
    resetAllProgress,
  } = useUserProgress();

  const {
    playStroke,
    playCheckpoint,
    playSuccess,
    playTap,
  } = useSoundEffects(progress.soundEnabled);

  // 戻る操作の吸収（第8.4節）
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    // 起動時にダミー履歴を積む
    window.history.pushState({ app: true }, '');

    const handlePopState = () => {
      const current = screenRef.current;
      if (current.name === 'play') {
        window.history.pushState({ app: true }, '');
        setScreen({ name: 'stageSelect' });
      } else if (current.name === 'stageSelect') {
        window.history.pushState({ app: true }, '');
        setScreen({ name: 'home' });
      } else {
        // home のときは履歴を積み直さず離脱を許す
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStartPlay = () => {
    unlockAudio();
    setScreen({ name: 'stageSelect' });
  };

  const handleSelectStage = (stageId: string) => {
    setScreen({ name: 'play', stageId });
  };

  const handleNextStage = (nextStageId: string | null) => {
    if (nextStageId) {
      setScreen({ name: 'play', stageId: nextStageId });
    } else {
      setScreen({ name: 'stageSelect' });
    }
  };

  return (
    <main className="w-full h-dvh flex flex-col items-center justify-center bg-slate-100 select-none overflow-hidden touch-none">
      {screen.name === 'home' && (
        <HomeScreen
          soundEnabled={progress.soundEnabled}
          onToggleSound={toggleSound}
          onStartPlay={handleStartPlay}
          onUnlockAll={unlockAllStages}
          onResetProgress={resetAllProgress}
          onPlayTap={playTap}
        />
      )}

      {screen.name === 'stageSelect' && (
        <StageSelectScreen
          progress={progress}
          onSelectStage={handleSelectStage}
          onBack={() => setScreen({ name: 'home' })}
          onPlayTap={playTap}
        />
      )}

      {screen.name === 'play' && (
        <PlayScreen
          stageId={screen.stageId}
          onBack={() => setScreen({ name: 'stageSelect' })}
          onNextStage={handleNextStage}
          onCompleteStage={completeStage}
          onPlayStroke={playStroke}
          onPlayCheckpoint={playCheckpoint}
          onPlaySuccess={playSuccess}
          onPlayTap={playTap}
        />
      )}
    </main>
  );
};

export default App;
