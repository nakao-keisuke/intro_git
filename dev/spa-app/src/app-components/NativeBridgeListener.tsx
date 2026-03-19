import { usePathname, useRouter } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import type { GetIncomingCallResponseElementData } from '@/apis/check-incoming-call';
import { NativePermissionModal } from '@/components/common/NativePermissionModal';
import { CHECK_INCOMING_CALL, HTTP_GET_MY_POINT } from '@/constants/endpoints';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';
import { useRefreshMyPoint } from '@/hooks/useRefreshMyPoint.hook';
import { native } from '@/libs/nativeBridge';
import { useCallStore } from '@/stores/callStore';
import { usePointStore } from '@/stores/pointStore';
import { usePollingStore } from '@/stores/pollingStore';
import type { ResponseData } from '@/types/NextApi';
import {
  formatAttributionForSource,
  getPurchaseAttribution,
} from '@/utils/purchaseAttribution';
import { sendMessageToWebView } from '@/utils/webview';

// プッシュ通知タイプ (サーバーの aps.data.noti_type の値)
const PUSH_NOTI_TYPE = {
  CHAT_MESSAGE: 11,
  VIDEO_CALL: 26,
  VOICE_CALL: 28,
} as const;

type PushTappedDetail = {
  noti_type?: number; // 通知種別
  ownerid?: string; // 受信者ID
  userid?: string; // 送信者ID
};

/**
 * Native (React Native WebView) からのイベントを受信するリスナー
 *
 * Nativeからは CustomEvent 形式で送信される:
 *   window.dispatchEvent(new CustomEvent('eventName', { detail: { ... } }))
 *
 * 対応イベント:
 *   - purchaseCompleted: 購入完了 → レビューモーダル表示 & ポイント更新
 *   - pullToRefresh: Pull to Refresh → ページリロード
 *   - pushTapped: プッシュ通知タップ → メッセージ画面に遷移
 */
export function NativeBridgeListener() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshMyPoint = useRefreshMyPoint();
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
  const isInCall = useCallStore((s) => s.callDurationSec !== undefined);
  const setIncomingCall = usePollingStore((s) => s.setIncomingCall);
  const isProcessingPushTap = useRef(false);
  const {
    isPermissionModalOpen,
    deniedPermissions,
    closePermissionModal,
    openAppSettings,
    isNativeApp,
  } = useNativeMediaPermission();

  useEffect(() => {
    // 購入完了時の処理
    const handlePurchaseCompleted = async (e: Event) => {
      const detail = (
        e as CustomEvent<
          { productId?: string; packageId?: string; price?: number } | undefined
        >
      ).detail;

      if (detail?.productId || detail?.packageId) {
        // 購入データありの場合: サーバーから最新ポイントを取得して反映
        // 通話中はポーリング停止で古い値になるため、直接APIを呼ぶ
        try {
          const res = await fetch(HTTP_GET_MY_POINT);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          if (data.type === 'success' && typeof data.point === 'number') {
            setCurrentPoint(data.point);
          }
        } catch {
          // APIエラー時は通話中以外ならポーリングキャッシュから同期
          if (!isInCall) {
            refreshMyPoint();
          }
        }
      } else {
        // 購入データなしの場合（iOS等）: レビューモーダル表示 & ポイント更新
        native.requestAppReview();
        refreshMyPoint();
      }

      // Renka向けに購入完了のReproイベントをpostMessageで送信
      // 1) 購入起点（Purchase Attribution）を取得
      const attribution = getPurchaseAttribution();
      // 2) source_ui をシンプルな source に正規化（マッチなしは 'direct'）
      const source = formatAttributionForSource(attribution);
      // 3) Repro向けイベント名を動的生成（例: purchase_mypage, purchase_header_button）
      const eventName = `purchase_${source}`;
      // 4) RenkaのWebViewへpostMessage（JSON文字列）を送信
      sendMessageToWebView({
        type: 'REPRO_TRACK',
        payload: { event: eventName },
      });
    };

    // Pull to Refresh
    const handlePullToRefresh = () => {
      window.location.reload();
    };

    // プッシュ通知タップ
    const handlePushTapped = async (e: Event) => {
      // CustomEventでない場合は無視
      if (!(e instanceof CustomEvent) || !e.detail) {
        return;
      }

      const { noti_type, userid } = e.detail as PushTappedDetail;

      // useridが無効な場合は遷移しない
      if (!userid || !userid.trim()) {
        return;
      }

      // ビデオ通話/音声通話通知 → incomingCallAtomにセットしてuseIncomingCallHandlerに処理を委譲
      // これによりNativeプッシュフローとWebポーリングフローを統一し、
      // sessionStorageの競合状態を解消する
      if (
        noti_type === PUSH_NOTI_TYPE.VIDEO_CALL ||
        noti_type === PUSH_NOTI_TYPE.VOICE_CALL
      ) {
        // 既に着信画面にいる場合はスキップ
        if (pathname?.includes('/incoming/')) {
          return;
        }

        // 重複処理防止
        if (isProcessingPushTap.current) {
          return;
        }
        isProcessingPushTap.current = true;

        try {
          const res = await fetch(CHECK_INCOMING_CALL);
          const data: ResponseData<{
            incomingInfo: GetIncomingCallResponseElementData | undefined;
          }> = await res.json();

          if (data.type === 'success' && data.incomingInfo) {
            // ポーリング形式に変換してatomにセット
            // useIncomingCallHandlerが検知して着信画面に遷移する
            const pollingFormatData = {
              code: 0,
              data: {
                senderId: data.incomingInfo.partnerId,
                appId: data.incomingInfo.appId,
                rtmChannelToken: data.incomingInfo.rtmChannelToken || '',
                rtcChannelToken: data.incomingInfo.rtcChannelToken,
                channelId: data.incomingInfo.channelId,
                callType: data.incomingInfo.callType,
                date: data.incomingInfo.date,
                isPartnerInSecondApps:
                  data.incomingInfo.isPartnerInSecondApps ?? true,
              },
            };

            setIncomingCall({
              data: pollingFormatData,
              updatedAt: Date.now(),
            });
          }
        } catch (error) {
          console.error('Failed to check incoming call:', error);
          // フォールバック: メッセージ画面に遷移してポーリングに任せる
          router.replace(`/message/${userid}`);
        } finally {
          isProcessingPushTap.current = false;
        }

        return;
      }

      // その他の通知タイプ → メッセージ画面に遷移
      router.push(`/message/${userid}`);
    };

    // CustomEvent リスナー登録
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);
    window.addEventListener('pullToRefresh', handlePullToRefresh);
    window.addEventListener('pushTapped', handlePushTapped);

    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
      window.removeEventListener('pullToRefresh', handlePullToRefresh);
      window.removeEventListener('pushTapped', handlePushTapped);
    };
  }, [
    router,
    pathname,
    refreshMyPoint,
    setCurrentPoint,
    isInCall,
    setIncomingCall,
  ]);

  return (
    <NativePermissionModal
      isOpen={isPermissionModalOpen}
      deniedPermissions={deniedPermissions}
      onClose={closePermissionModal}
      onOpenSettings={openAppSettings}
      isNativeApp={isNativeApp}
    />
  );
}
