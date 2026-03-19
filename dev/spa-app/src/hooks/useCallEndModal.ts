import { usePathname, useRouter } from '@tanstack/react-router'; // ★ App Router 用
import { useEffect, useRef, useState } from 'react';
import { callEventKeys } from '@/constants/callEventKeys';
import { useLiveStore } from '@/features/live/store/liveStore';
import callEventEmitter from '@/libs/callEventEmitter';
import type { CallType } from '@/utils/callView';

export type CallEndedType = 'normal' | 'withChatButton' | 'pointless' | 'error';
export type CallEndedInfo = {
  type: CallEndedType;
  message: string;
  partnerId: string;
  callDurationSec?: number;
  callType?: CallType;
};
export type ActionButtonType = 'purchase' | 'chat';
export const callEndedInfoKey = 'callEndedInfo';

/**
 * App Routerバージョン
 */
export const useCallEndModal = () => {
  const router = useRouter();
  const pathname = usePathname(); // ★ ページ遷移検知に利用
  const setRefreshLivePeople = useLiveStore(
    (s) => s.setIsNeedToRefreshLivePeople,
  );

  const [isCallEndedModalOpen, setIsCallEndedModalOpen] = useState(false);
  const [callEndedModalMessage, setCallEndedModalMessage] = useState('');
  const [callEndedType, setCallEndedType] = useState<CallEndedType | null>(
    null,
  );
  const [actionButtonType, setActionButtonType] =
    useState<ActionButtonType | null>(null);
  const partnerIdRef = useRef<string | null>(null);
  const [callDurationSec, setCallDurationSec] = useState<number | undefined>();
  const [callType, setCallType] = useState<CallType | undefined>();
  const isModalDisplayedRef = useRef(false); // モーダル重複表示防止フラグ

  // callEndedInfo をチェックする共通関数
  const checkCallEndedInfo = () => {
    // 既に表示済みの場合は何もしない（重複表示防止）
    if (isModalDisplayedRef.current) return;

    const callEndedInfoJSON = sessionStorage.getItem(callEndedInfoKey);
    if (callEndedInfoJSON) {
      try {
        const callEndedInfo: CallEndedInfo = JSON.parse(callEndedInfoJSON);
        if (
          callEndedInfo.type === 'pointless' ||
          callEndedInfo.type === 'error'
        )
          setActionButtonType('purchase');
        if (callEndedInfo.type === 'withChatButton') {
          setActionButtonType('chat');
        }
        setCallEndedType(callEndedInfo.type);
        setCallEndedModalMessage(callEndedInfo.message);
        partnerIdRef.current = callEndedInfo.partnerId;
        setCallDurationSec(callEndedInfo.callDurationSec);
        setCallType(callEndedInfo.callType);
        setIsCallEndedModalOpen(true);
        sessionStorage.removeItem(callEndedInfoKey);
        // 表示済みフラグを立てる
        isModalDisplayedRef.current = true;
      } catch {
        // JSON parse error → 無視
      }
    }
  };

  useEffect(() => {
    // callEventKeys.callEnd イベントをリスニング（通話終了時に即座にモーダル表示）
    const handleCallEnd = () => {
      // 少し遅延を入れてsessionStorageの書き込みが完了するのを待つ
      setTimeout(() => {
        checkCallEndedInfo();
      }, 100);
    };

    callEventEmitter.on(callEventKeys.callEnd, handleCallEnd);

    return () => {
      callEventEmitter.off(callEventKeys.callEnd, handleCallEnd);
    };
  }, []);

  useEffect(() => {
    // ページ遷移（pathname 変化）ごとにチェック（フォールバック）
    checkCallEndedInfo();
  }, [pathname]); // ★ App Router ではこれが routeChangeComplete 相当

  useEffect(() => {
    // 初回マウント時のフォールバック（sessionStorage 設定が遅れる可能性があるので少し遅延）
    const timer = setTimeout(() => {
      checkCallEndedInfo();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const closeModal = (isPushed: boolean) => {
    setIsCallEndedModalOpen(false);
    setCallEndedType(null);
    setActionButtonType(null);
    setCallEndedModalMessage('');
    setCallDurationSec(undefined);
    setCallType(undefined);
    setRefreshLivePeople(true);
    partnerIdRef.current = null;
    // 表示済みフラグをリセット（次回の表示を可能にする）
    isModalDisplayedRef.current = false;

    if (sessionStorage.getItem('isFullScreen')) {
      sessionStorage.removeItem('isFullScreen');
      if (isPushed) return;
      router.refresh(); // ★ App Router では reload → refresh に置換
    }
  };

  return [
    callEndedModalMessage,
    actionButtonType,
    callEndedType,
    isCallEndedModalOpen,
    partnerIdRef.current,
    closeModal,
    callDurationSec,
    callType,
  ] as const;
};
