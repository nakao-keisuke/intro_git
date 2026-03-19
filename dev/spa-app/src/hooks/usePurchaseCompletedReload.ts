import { useEffect } from 'react';

/**
 * ネイティブアプリ（Renka）からの purchaseCompleted イベントを監視し、
 * ポイント購入完了時にページをリロードする。
 *
 * RTM認証時にポイント不足と判定された場合に有効化し、
 * 購入完了後にRTM初期化をやり直すために使用する。
 */
export const usePurchaseCompletedReload = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    const handlePurchaseCompleted = () => {
      window.location.reload();
    };
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
    };
  }, [enabled]);
};
