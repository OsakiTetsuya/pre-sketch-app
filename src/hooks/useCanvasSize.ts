import { useState, useEffect, useRef, useCallback } from 'react';
import { MAX_CANVAS_SIZE } from '../constants';

interface UseCanvasSizeOptions {
  padding?: number;
  headerHeight?: number;
  isDrawingRef?: React.RefObject<boolean>;
}

export interface CanvasSizeInfo {
  side: number;
  dpr: number;
  onPointerRelease: () => void;
}

export const useCanvasSize = (options: UseCanvasSizeOptions = {}): CanvasSizeInfo => {
  const { padding = 16, headerHeight = 80, isDrawingRef } = options;
  const [side, setSide] = useState<number>(300);
  const [dpr, setDpr] = useState<number>(1);
  const pendingResizeRef = useRef(false);
  const resizeTimerRef = useRef<number | null>(null);

  const calculateSize = useCallback(() => {
    if (typeof window === 'undefined') return;
    const availW = Math.max(100, window.innerWidth - padding * 2);
    const availH = Math.max(100, window.innerHeight - headerHeight - padding * 2);
    const s = Math.min(availW, availH, MAX_CANVAS_SIZE);
    const d = Math.min(window.devicePixelRatio || 1, 3);
    setSide(s);
    setDpr(d);
  }, [padding, headerHeight]);

  const handleResize = useCallback(() => {
    if (isDrawingRef?.current) {
      pendingResizeRef.current = true;
      return;
    }
    if (resizeTimerRef.current !== null) {
      window.clearTimeout(resizeTimerRef.current);
    }
    resizeTimerRef.current = window.setTimeout(() => {
      calculateSize();
    }, 150);
  }, [calculateSize, isDrawingRef]);

  const onPointerRelease = useCallback(() => {
    if (pendingResizeRef.current) {
      pendingResizeRef.current = false;
      calculateSize();
    }
  }, [calculateSize]);

  useEffect(() => {
    calculateSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeTimerRef.current !== null) {
        window.clearTimeout(resizeTimerRef.current);
      }
    };
  }, [calculateSize, handleResize]);

  return { side, dpr, onPointerRelease };
};
