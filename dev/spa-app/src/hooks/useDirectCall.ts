import { useRouter, useSearchParams } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { PRICING_INFO } from '@/constants/pricing';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';
import { getOutgoingCallPath } from '@/utils/callView';

type UseDirectCallParams = {
  partnerId: string;
  myPoint?: number;
};

type UseDirectCallReturn = {
  startDirectCall: (callType: 'voice' | 'video') => Promise<void>;
  isNavigating: boolean;
  isPointInsufficient: boolean;
  closePointModal: () => void;
  voiceCallRate: number;
  videoCallRate: number;
};

/**
 * 直接通話を開始するためのカスタムフック
 * @param {UseDirectCallParams} params - パートナーIDとポイント情報
 * @returns {UseDirectCallReturn} 通話開始関数と状態
 */
export const useDirectCall = ({
  partnerId,
  myPoint,
}: UseDirectCallParams): UseDirectCallReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAndRequestPermission } = useNativeMediaPermission();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPointInsufficient, setIsPointInsufficient] = useState(false);

  // PRICING_INFOから通話料金を取得
  const voiceCallRate = useMemo(() => {
    const voiceCallPricing = PRICING_INFO.find(
      (item) => item.label === '音声通話',
    );
    if (voiceCallPricing && typeof voiceCallPricing.price === 'number') {
      return voiceCallPricing.price;
    }
    return 140;
  }, []);

  const videoCallRate = useMemo(() => {
    const videoCallPricing = PRICING_INFO.find(
      (item) => item.label === 'ビデオ通話',
    );
    if (videoCallPricing && typeof videoCallPricing.price === 'number') {
      return videoCallPricing.price;
    }
    return 230;
  }, []);

  const startDirectCall = useCallback(
    async (callType: 'voice' | 'video') => {
      // ポイントチェック
      const requiredPoints =
        callType === 'voice' ? voiceCallRate : videoCallRate;
      if (myPoint !== undefined && myPoint < requiredPoints) {
        setIsPointInsufficient(true);
        return;
      }

      // 権限チェック（拒否時はhook内部でモーダル表示）
      const granted = await checkAndRequestPermission(callType);
      if (!granted) return;

      // sessionStorageに通話開始元を保存
      sessionStorage.setItem('callStartedFrom', window.location.pathname);
      sessionStorage.setItem('callStartedFromUrl', window.location.href);

      // 埋め込みモードの検出
      const isEmbedded = searchParams?.get('embedded') === 'true';

      // 戻り先のパスを取得（埋め込みモードの場合はfromパラメータ、通常モードは現在のパス）
      const fromPath = isEmbedded
        ? (searchParams?.get('from') ?? '/girls/all')
        : window.location.pathname;

      // 通話ページのURLを生成（fromパラメータ付き）
      const basePath =
        callType === 'video'
          ? `${getOutgoingCallPath('videoCallFromOutgoing')}/${partnerId}`
          : `${getOutgoingCallPath('voiceCallFromOutgoing')}/${partnerId}`;
      const callPath = `${basePath}?from=${encodeURIComponent(fromPath)}`;

      if (isEmbedded) {
        // iframe内の場合、フラグを保存して親ウィンドウで通話ページを開く
        // replaceを使用して履歴に残さない（戻るボタンで通話ページに戻らないようにする）
        sessionStorage.setItem('callStartedFromEmbedded', 'true');
        window.parent.location.replace(callPath);
        return;
      }

      // 通常モード: iframe外での通話開始
      // replaceを使用して履歴に残さない（戻るボタンで通話ページに戻らないようにする）
      setIsNavigating(true);

      try {
        router.replace(callPath);
      } catch (error) {
        console.error('通話開始エラー:', error);
        alert('通話の開始に失敗しました。再度お試しください。');
      } finally {
        setIsNavigating(false);
      }
    },
    [
      partnerId,
      myPoint,
      voiceCallRate,
      videoCallRate,
      router,
      searchParams,
      checkAndRequestPermission,
    ],
  );

  const closePointModal = useCallback(() => {
    setIsPointInsufficient(false);
  }, []);

  return {
    startDirectCall,
    isNavigating,
    isPointInsufficient,
    closePointModal,
    voiceCallRate,
    videoCallRate,
  };
};
