import { useEffect, useState } from "react";

interface UseEstimatedProgressOptions {
  isActive: boolean;
  estimatedDurationMs: number;
  updateIntervalMs?: number;
  startProgress?: number;
  maxProgressBeforeComplete?: number;
}

interface EstimatedProgressState {
  progress: number;
  secondsRemaining: number;
  isBeyondEstimate: boolean;
}

export function useEstimatedProgress({
  isActive,
  estimatedDurationMs,
  updateIntervalMs = 250,
  startProgress = 8,
  maxProgressBeforeComplete = 94,
}: UseEstimatedProgressOptions): EstimatedProgressState {
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isBeyondEstimate, setIsBeyondEstimate] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      setSecondsRemaining(0);
      setIsBeyondEstimate(false);
      return;
    }

    const duration = Math.max(estimatedDurationMs, 1000);
    const initialProgress = Math.min(startProgress, maxProgressBeforeComplete);
    const maxProgress = Math.min(Math.max(maxProgressBeforeComplete, initialProgress), 98);
    const progressRange = Math.max(maxProgress - initialProgress, 1);
    const startedAt = Date.now();

    setProgress(initialProgress);
    setSecondsRemaining(Math.ceil(duration / 1000));

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const withinEstimateRatio = Math.min(elapsed / duration, 1);
      const remainingMs = Math.max(duration - elapsed, 0);

      let nextProgress = initialProgress + withinEstimateRatio * progressRange;

      if (elapsed > duration) {
        const overtime = elapsed - duration;
        const overtimeRatio = 1 - Math.exp(-overtime / duration);
        nextProgress = maxProgress + (99 - maxProgress) * overtimeRatio;
      }

      setProgress(Math.min(Math.max(nextProgress, initialProgress), 99));
      setSecondsRemaining(Math.ceil(remainingMs / 1000));
      setIsBeyondEstimate(elapsed > duration);
    }, updateIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isActive, estimatedDurationMs, updateIntervalMs, startProgress, maxProgressBeforeComplete]);

  return { progress, secondsRemaining, isBeyondEstimate };
}
