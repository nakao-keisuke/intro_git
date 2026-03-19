import { useCallback, useEffect, useState } from 'react';

/**
 * キーボードの高さとビューポート情報を管理するカスタムフック
 * Visual Viewport APIを使用してiOS/Android問わずキーボード高さを検出
 */
interface KeyboardMetrics {
  keyboardHeight: number;
  viewportHeight: number;
  isKeyboardVisible: boolean;
}

export const useKeyboardHeight = (): KeyboardMetrics => {
  const [metrics, setMetrics] = useState<KeyboardMetrics>({
    keyboardHeight: 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    isKeyboardVisible: false,
  });

  const updateMetrics = useCallback(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const visualViewport = window.visualViewport;
    const layoutHeight = document.documentElement.clientHeight;

    // Safari/Chrome両対応: offsetTopを考慮した計算
    const calculatedKeyboardHeight = Math.max(
      0,
      layoutHeight - (visualViewport.height + visualViewport.offsetTop),
    );

    // キーボードが表示されているかの判定（閾値: 50px）
    // この値より小さい場合は、ブラウザのツールバー等の影響と判断
    const isVisible = calculatedKeyboardHeight > 50;

    setMetrics({
      keyboardHeight: calculatedKeyboardHeight,
      viewportHeight: visualViewport.height,
      isKeyboardVisible: isVisible,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    // 初期値設定
    updateMetrics();

    // イベントリスナー登録
    // resize: キーボードの開閉、画面回転等
    // scroll: iOSでのキーボード表示時のスクロール
    window.visualViewport.addEventListener('resize', updateMetrics);
    window.visualViewport.addEventListener('scroll', updateMetrics);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateMetrics);
      window.visualViewport?.removeEventListener('scroll', updateMetrics);
    };
  }, [updateMetrics]);

  // 画面回転時の再計算
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientationChange = () => {
      // 回転アニメーション完了を待ってから再計算
      setTimeout(updateMetrics, 300);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateMetrics]);

  return metrics;
};
