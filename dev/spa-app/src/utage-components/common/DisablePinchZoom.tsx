import { useEffect } from 'react';

/**
 * iOS Safari でピンチズームを無効化するコンポーネント
 * gesturestart/gesturechange イベントを preventDefault することで
 * viewport の user-scalable=no が無視される iOS でもズームを防ぐ
 */
export default function DisablePinchZoom() {
  useEffect(() => {
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    const handleGestureChange = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener('gesturestart', handleGestureStart);
    document.addEventListener('gesturechange', handleGestureChange);

    return () => {
      document.removeEventListener('gesturestart', handleGestureStart);
      document.removeEventListener('gesturechange', handleGestureChange);
    };
  }, []);

  return null;
}
