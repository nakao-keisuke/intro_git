import { usePathname, useRouter } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useIncomingCall } from '@/hooks/usePollingData';
import type { JamboResponse, JamboResponseData } from '@/types/JamboApi';
import { isValid as isValidUserId } from '@/utils/mongodb';
import { sendMessageToWebView } from '@/utils/webview';

export interface IncomingCallInfo {
  partnerId: string;
  appId: string;
  rtmChannelToken: string;
  rtcChannelToken: string;
  channelId: string;
  callType: 'voice' | 'video' | 'live' | 'random';
  date: string;
  isPartnerInSecondApps: boolean;
}

interface IncomingCallResponseData extends JamboResponseData {
  // Jamboのレスポンス(data直下)をそのままcamelCaseで受け取る
  senderId: string;
  appId: string;
  rtmChannelToken: string;
  rtcChannelToken: string;
  channelId: string;
  callType: string;
  date: string;
  isPartnerInSecondApps: boolean;
}

type CheckIncomingCallResponse = JamboResponse<IncomingCallResponseData>;

/**
 * 着信チェックをポーリングで行うカスタムフック
 * 似たようなのがあるが、こっちはApp Routerバージョン
 */
export const useIncomingCallHandler = () => {
  const [incomingCallInfo, setIncomingCallInfo] = useState<
    IncomingCallInfo[] | null
  >(null);
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef<string | undefined>(undefined);
  const { data: session } = useSession();

  // ポーリングデータを取得（3秒ごとに自動更新）
  // NativeBridgeListenerからのプッシュ通知も同じatomを更新するため、統一的に処理される
  const incomingCallData = useIncomingCall();

  const isRestrictedPath = () => {
    if (!currentPath.current) return true;
    return (
      currentPath.current.includes('/health') ||
      currentPath.current.includes('/login') ||
      currentPath.current.includes('/signup') ||
      currentPath.current.includes('/confirm-mail') ||
      currentPath.current.includes('/incoming/') ||
      currentPath.current.includes('/outgoing/')
    );
  };

  const handleIncomingCall = useCallback(
    (callInfo: IncomingCallInfo[]) => {
      // セッションがない場合は何もしない
      if (!session) return;

      callInfo.forEach((callInfo) => {
        const incomingPath = getIncomingPath(
          callInfo.callType,
          callInfo.partnerId,
        );

        if (currentPath.current?.includes('/incoming/')) {
          return;
        }

        sessionStorage.setItem('appId', callInfo.appId);
        sessionStorage.setItem('rtcChannelToken', callInfo.rtcChannelToken);
        sessionStorage.setItem('channelId', callInfo.channelId);
        sessionStorage.setItem(
          'isPartnerInSecondApps',
          callInfo.isPartnerInSecondApps.toString(),
        );

        // Nativeアプリにバイブレーション通知を送信
        sendMessageToWebView({
          type: 'INCOMING_CALL_VIBRATE',
        });

        // プッシュ通知からの遷移では戻り先が不明確なため、履歴スタックを汚さずにreplaceを使用
        router.replace(incomingPath);
      });
    },
    [router, session],
  );

  // ポーリングデータで着信を検知（3秒ごと、通話中は自動停止）
  useEffect(() => {
    // セッションがないまたは制限パスの場合は何もしない
    if (!session || !incomingCallData?.data || isRestrictedPath()) return;

    const response = incomingCallData.data as CheckIncomingCallResponse;

    // エラーレスポンスまたは着信情報がない場合は何もしない（code !== 0）
    if (response.code !== 0 || !response.data) return;

    const incomingInfo = response.data;

    // senderId バリデーション（"noposter" 等の無効値を除外）
    if (!isValidUserId(incomingInfo.senderId)) {
      return;
    }

    // 15秒以内の着信のみ処理（古い着信を無視）
    const isWithin15Seconds = (dateStr: string | undefined): boolean => {
      if (!dateStr || dateStr.length < 14) {
        console.warn('Incoming call date is missing or invalid, allowing call');
        return true; // dateがない場合は通す
      }

      const year = parseInt(dateStr.substring(0, 4), 10);
      const month = parseInt(dateStr.substring(4, 6), 10) - 1;
      const day = parseInt(dateStr.substring(6, 8), 10);
      const hour = parseInt(dateStr.substring(8, 10), 10);
      const minute = parseInt(dateStr.substring(10, 12), 10);
      const second = parseInt(dateStr.substring(12, 14), 10);

      const callTime = new Date(year, month, day, hour, minute, second);
      const now = new Date();

      const diffInSeconds = Math.abs(
        (now.getTime() - callTime.getTime()) / 1000,
      );
      return diffInSeconds <= 15;
    };

    if (!isWithin15Seconds(incomingInfo.date)) {
      return;
    }

    // 着信情報を変換
    const incomingCall: IncomingCallInfo = {
      partnerId: incomingInfo.senderId,
      appId: incomingInfo.appId,
      rtmChannelToken: incomingInfo.rtmChannelToken,
      rtcChannelToken: incomingInfo.rtcChannelToken,
      channelId: incomingInfo.channelId,
      callType: (() => {
        const type = incomingInfo.callType?.toLowerCase();
        if (!type) {
          console.warn(
            'Incoming call callType is missing, defaulting to voice',
          );
        }
        return (type || 'voice') as 'voice' | 'video' | 'live' | 'random';
      })(),
      date: incomingInfo.date,
      isPartnerInSecondApps: incomingInfo.isPartnerInSecondApps,
    };

    handleIncomingCall([incomingCall]);
    setIncomingCallInfo([incomingCall]);
  }, [incomingCallData?.updatedAt, session, handleIncomingCall]);

  useEffect(() => {
    if (!pathname) return;
    currentPath.current = pathname;
  }, [pathname]);

  const resetIncomingCall = useCallback(() => {
    setIncomingCallInfo(null);
  }, []);

  // セッションがない場合でも常に同じ形式の戻り値を返す
  return {
    incomingCallInfos: session ? incomingCallInfo : null,
    resetIncomingCall,
  };
};

const getIncomingPath = (
  callType: IncomingCallInfo['callType'],
  partnerId: string,
) => {
  switch (callType) {
    case 'voice':
      return `/incoming/voice-call/${partnerId}`;
    case 'video':
      return `/incoming/video-call/${partnerId}`;
    case 'live':
      return `/incoming/video-chat/${partnerId}`;
    case 'random':
      return `/incoming/video-call/${partnerId}`;
    default:
      return `/incoming/voice-call/${partnerId}`;
  }
};
