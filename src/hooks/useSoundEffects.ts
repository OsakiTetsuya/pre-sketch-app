import { useRef, useCallback } from 'react';
import { STROKE_SOUND_THROTTLE_MS } from '../constants';

// モジュールスコープの単一 AudioContext (第9.1節)
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
};

/** iOS / Android のオーディオ解禁。最初のユーザー操作内で呼ぶ */
export const unlockAudio = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume();
  }
};

export const useSoundEffects = (soundEnabled = true) => {
  const lastStrokeSoundTimeRef = useRef<number>(0);

  const playTone = useCallback(
    (
      freq: number,
      type: OscillatorType = 'sine',
      duration = 0.15,
      volume = 0.15,
      delay = 0
    ) => {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      // suspended の場合は再開を試みる
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // ignore
        }
      };
    },
    [soundEnabled]
  );

  /** なぞり中の音 (80ms スロットリング) */
  const playStroke = useCallback(() => {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastStrokeSoundTimeRef.current < STROKE_SOUND_THROTTLE_MS) return;
    lastStrokeSoundTimeRef.current = now;

    const freq = 440 + Math.random() * 80;
    playTone(freq, 'sine', 0.05, 0.08);
  }, [soundEnabled, playTone]);

  /** チェックポイント通過時の音 (進行度に応じて音階が上がる) */
  const playCheckpoint = useCallback(
    (progress = 0) => {
      if (!soundEnabled) return;
      const freq = 523.25 * (1 + Math.min(1, Math.max(0, progress)));
      playTone(freq, 'triangle', 0.08, 0.12);
    },
    [soundEnabled, playTone]
  );

  /** 完成時のファンファーレ音 (ド・ミ・ソ・ド) */
  const playSuccess = useCallback(() => {
    if (!soundEnabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      playTone(freq, 'triangle', 0.25, 0.15, i * 0.1);
    });
  }, [soundEnabled, playTone]);

  /** タップ音 */
  const playTap = useCallback(() => {
    if (!soundEnabled) return;
    playTone(880, 'square', 0.04, 0.06);
  }, [soundEnabled, playTone]);

  return {
    playStroke,
    playCheckpoint,
    playSuccess,
    playTap,
    unlockAudio,
  };
};
