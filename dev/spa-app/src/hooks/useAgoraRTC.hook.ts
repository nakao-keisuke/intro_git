import AgoraRTC, {
  type IAgoraRTCClient,
  type ILocalAudioTrack,
  type ILocalVideoTrack,
  type IRemoteAudioTrack,
  type IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AGORA_ERROR_CODES,
  AGORA_EXCEPTION_CODES,
  AUDIO_VOLUME_BOOSTED,
  AUDIO_VOLUME_DEFAULT,
  NON_CRITICAL_EXCEPTION_CODES,
} from '@/constants/agora/errorCodes';
import { callEventKeys } from '@/constants/callEventKeys';
import { GET_AGORA_UID } from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import callEventEmitter from '@/libs/callEventEmitter';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { native } from '@/libs/nativeBridge';
import { createCallService } from '@/services/call/CallService';
import type { EndedCallNotificationRequest } from '@/services/call/type';
import { useCallStore } from '@/stores/callStore';
import { useUIStore } from '@/stores/uiStore';
import type { AgoraUid } from '@/types/AgoraUid';
import type { ChannelInfo } from '@/types/ChannelInfo';
import { CALL_ERROR_CATEGORY } from '@/types/callErrorCategory';
import {
  type CallEndedParams,
  CallEndReason,
  type CallStartedParams,
  GA4CallType,
} from '@/types/callEvent';
import type { DeviceCategory } from '@/types/DeviceCategory';
import { NetworkQualityMonitor } from '@/utils/agora/networkQualityMonitor';
import { recreateTracks } from '@/utils/agora/trackUtils';
import { conditionalBack } from '@/utils/backButtonUtil';
import { afterCall } from '@/utils/callState';
import { type CallType, getCallView } from '@/utils/callView';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { trackEvent } from '@/utils/eventTracker';
import { clearMediaSession } from '@/utils/mediaSession';
import { postToNext } from '@/utils/next';
import { addCallBreadcrumb } from '@/utils/sentry/callBreadcrumbs';
import {
  captureCallError,
  captureCallWarning,
} from '@/utils/sentry/captureCallError';
import { sendMessageToWebView } from '@/utils/webview';
import { useAgoraPlaybackVerification } from './useAgoraPlaybackVerification';
import { useAgoraStatsPolling } from './useAgoraStatsPolling';
import { type CallEndedInfo, callEndedInfoKey } from './useCallEndModal';

const mapCodeToCategory = (code?: number): string | undefined => {
  const map: Record<number, string> = {
    994: CALL_ERROR_CATEGORY.AUDIO_FRAME_TIMEOUT,
    995: CALL_ERROR_CATEGORY.VIDEO_FRAME_TIMEOUT,
    997: CALL_ERROR_CATEGORY.PUBLISH_FAILED,
    998: CALL_ERROR_CATEGORY.VIDEO_PLAY_FAILURE,
    999: CALL_ERROR_CATEGORY.AUDIO_PLAY_FAILURE,
  };
  return code ? map[code] : undefined;
};

export const useAgoraRTC = (
  channelInfo: ChannelInfo,
  callType: CallType,
  deviceCategory: DeviceCategory,
) => {
  const callView = getCallView(callType);
  const router = useRouter();
  const { data: session } = useSession();
  const isAgoraRtmLoginDoneWhenOutGoingCall = useCallStore(
    (s) => s.isRtmLoginDoneWhenOutGoingCall,
  );
  const isAgoraRtmLoingDoneWhenOutGoingCallRef = useRef(false);
  const closeStopCallModal = useUIStore((s) => s.closeStopCallModal);
  const openNativePermissionModal = useUIStore(
    (s) => s.openNativePermissionModal,
  );
  const setCallState = useCallStore((s) => s.setCallState);
  const callDurationSec = useCallStore((s) => s.callDurationSec);
  const setCallDurationSec = useCallStore((s) => s.setCallDurationSec);
  const callDurationSecRef = useRef<number | undefined>(undefined);
  const cameraMode = useRef<
    'user' | 'environment' | 'switching' | 'before_ready'
  >('before_ready');
  const isMicMutedRef = useRef<boolean | 'switching' | undefined>(undefined);
  const [isPartnerMicMuted, setIsPartnerMicMutedState] = useState(false);
  const [isRemoteVideoReceived, setIsRemoteVideoReceived] = useState(false);
  const routeBack = useRef(true);
  const rtc = useRef<RTC>(intitialRtc);
  const callEndedEventSent = useRef(false); // CALL_ENDEDイベント送信済みフラグ
  const callStartedEventSent = useRef(false); // CALL_STARTEDイベント送信済みフラグ
  const lastRtcStateReasonRef = useRef<string | undefined>(undefined);
  const lastAgoraErrorCodeRef = useRef<string | undefined>(undefined);
  const lastSdkExceptionRef = useRef<
    { code?: string | number; msg?: string } | undefined
  >(undefined);
  const networkQualityMonitorRef = useRef(new NetworkQualityMonitor());

  // CallServiceのインスタンスを作成
  const clientHttpClient = useMemo(() => new ClientHttpClient(), []);
  const callService = useMemo(
    () => createCallService(clientHttpClient),
    [clientHttpClient],
  );

  /**
   * 通話開始時の処理
   * - GA4イベント送信
   * - Nativeアプリへの通話開始通知
   * @param type 通話タイプ (VOICE_CALL, VIDEO_CALL, VIDEO_CHAT)
   */
  const handleCallStarted = useCallback(
    (type: GA4CallType) => {
      // 重複送信防止
      if (callStartedEventSent.current) {
        return;
      }
      callStartedEventSent.current = true;

      // 新しい通話開始時にCALL_ENDEDイベント送信フラグをリセット
      callEndedEventSent.current = false;

      // GA4イベント送信
      const callStartedParams: CallStartedParams = {
        call_id: channelInfo.channelId,
        user_id: session?.user?.id || '',
        partner_id: channelInfo.peerId || '',
        started_at: new Date().toISOString(),
        type,
      };
      trackEvent(event.CALL_STARTED, callStartedParams);

      // Nativeアプリに通話開始を通知
      const callTypeForNative =
        type === GA4CallType.VOICE_CALL
          ? 'voice'
          : type === GA4CallType.VIDEO_CHAT
            ? 'videochat'
            : 'video';
      sendMessageToWebView({
        type: 'CALL_STARTED',
        payload: {
          callType: callTypeForNative,
        },
      });
    },
    [channelInfo.channelId, channelInfo.peerId, session?.user?.id],
  );

  // first-frame-decoded イベント管理用のフラグ
  const isAudioFrameDecodedRef = useRef(false);
  const isVideoFrameDecodedRef = useRef(false);
  const pointConsumptionStartedRef = useRef(false);
  const navigationGuardActiveRef = useRef(false);
  const activateNavigationGuard = useCallback(() => {
    if (navigationGuardActiveRef.current) return;
    navigationGuardActiveRef.current = true;
  }, []);
  const deactivateNavigationGuard = useCallback(() => {
    navigationGuardActiveRef.current = false;
  }, []);
  // onTimeout の多重発火防止フラグ
  const videoTimeoutHandledRef = useRef(false);
  const audioTimeoutHandledRef = useRef(false);

  // 相手のpublish検知タイマー管理
  const publishDetectionTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 切断原因の特定用フラグ
  const pageHideFiredRef = useRef(false);
  const beforeUnloadFiredRef = useRef(false);

  const onLeave = useCallback(
    async (code?: number) => {
      addCallBreadcrumb('onLeave called', 'lifecycle', { code });

      // CALL_ENDEDイベントが既に送信済みの場合でも、リスナーのクリーンアップは行う
      if (callEndedEventSent.current) {
        rtc.current.client?.removeAllListeners();
        return;
      }

      const reason = (() => {
        switch (code) {
          case 555:
            return { code: 555, message: 'onLeave: （相手が退出）' };
          case 777:
            return {
              code: 777,
              message: 'onLeave: （ブラウザ閉じ・リロード）',
            };
          case 111:
            return { code: 111, message: 'onLeave: (アンマウントによる離脱）' };
          case 888:
            return { code: 888, message: 'onLeave: （ポイント不足）' };
          case 995:
            return {
              code: 995,
              message: 'onLeave: （映像フレーム取得タイムアウト）',
            };
          case 997:
            return { code: 997, message: 'onLeave: （publish失敗）' };
          case 998:
            return { code: 998, message: 'onLeave: （映像再生エラー）' };
          case 994:
            return {
              code: 994,
              message: 'onLeave: （音声フレーム取得タイムアウト）',
            };
          case 999:
            return { code: 999, message: 'onLeave: （音声再生エラー）' };
          default:
            return { code: 0, message: 'onLeave: （ユーザーによる手動切断）' };
        }
      })();

      // CALL_ENDED イベント送信用の終了理由をマッピング
      const endReason: CallEndReason = (() => {
        switch (code) {
          case 555:
            return CallEndReason.REMOTE_HANGUP; // 相手が退出
          case 888:
            return CallEndReason.PT_SHORTAGE; // ポイント不足
          case 777:
            return CallEndReason.LOCAL_TAB_CLOSE; // タブ/ブラウザ終了
          case 111:
            return CallEndReason.LOCAL_UNMOUNT_NAVIGATION; // アンマウント/画面遷移
          case 995:
            return CallEndReason.VIDEO_FRAME_TIMEOUT; // 映像フレーム取得タイムアウト
          case 998:
            return CallEndReason.MEDIA_PLAY_ERROR_VIDEO; // 映像再生エラー
          case 994:
            return CallEndReason.AUDIO_FRAME_TIMEOUT; // 音声フレーム取得タイムアウト
          case 999:
            return CallEndReason.MEDIA_PLAY_ERROR_AUDIO; // 音声再生エラー
          case 997:
            return CallEndReason.PUBLISH_FAILED; // publish失敗（総称）
          case 996: {
            // RTC異常切断の詳細マッピング（connection-state-change の reason から）
            const r = (lastRtcStateReasonRef.current || '').toUpperCase();
            if (r.includes('KEEP_ALIVE_TIMEOUT'))
              return CallEndReason.RTC_DISCONNECTED_KEEP_ALIVE_TIMEOUT;
            if (r.includes('LOST')) return CallEndReason.RTC_DISCONNECTED_LOST;
            if (r.includes('REJECTED'))
              return CallEndReason.RTC_DISCONNECTED_REJECTED_BY_SERVER;
            if (r.includes('BANNED'))
              return CallEndReason.RTC_DISCONNECTED_BANNED;
            if (
              r.includes('REJOIN_FAILED') ||
              r.includes('OPEN_CHANNEL_TIMEOUT')
            )
              return CallEndReason.RTC_RECONNECTING_THEN_FAILED;
            // 不明時は unexpected にフォールバック（rtc_state_reason は補助で送信）
            return CallEndReason.UNEXPECTED_ERROR;
          }
          case 0:
          case undefined: // 手動切断時（引数なし）
            return CallEndReason.LOCAL_HANGUP_MANUAL; // ユーザーによる手動切断
          default:
            console.warn(`Unexpected onLeave code: ${code}`);
            return CallEndReason.UNEXPECTED_ERROR; // 予期しないエラー
        }
      })();

      // 通話タイプを判定
      const callTypeForEvent: GA4CallType = (() => {
        if (
          callType === 'live' ||
          callType === 'sideWatch' ||
          callType === 'videoChatFromOutgoing' ||
          callType === 'videoChatFromIncoming'
        ) {
          return GA4CallType.VIDEO_CHAT;
        } else if (callType === 'voiceCall') {
          return GA4CallType.VOICE_CALL;
        } else {
          return GA4CallType.VIDEO_CALL;
        }
      })();

      // CALL_ENDED イベント送信（重複送信防止）
      if (
        session?.user?.id &&
        channelInfo.peerId &&
        !callEndedEventSent.current
      ) {
        callEndedEventSent.current = true; // フラグを立てる
        sendMessageToWebView({ type: 'CALL_ENDED' });
        const callEndedParams: CallEndedParams = {
          call_id: channelInfo.channelId,
          user_id: session.user.id,
          partner_id: channelInfo.peerId,
          ended_at: new Date().toISOString(),
          reason: endReason,
          type: callTypeForEvent,
          // 追加の補助情報（存在時のみ）
          ...(callDurationSecRef.current !== undefined && {
            duration_sec: callDurationSecRef.current,
          }),
          ...(lastRtcStateReasonRef.current && {
            rtc_state_reason: lastRtcStateReasonRef.current,
          }),
          ...(lastAgoraErrorCodeRef.current && {
            agora_error_code: lastAgoraErrorCodeRef.current,
          }),
          ...(lastSdkExceptionRef.current?.code !== undefined && {
            sdk_exception_code: lastSdkExceptionRef.current.code,
          }),
          ...(lastSdkExceptionRef.current?.msg && {
            sdk_exception_msg: lastSdkExceptionRef.current.msg,
          }),
          ...(deviceCategory && { device_category: deviceCategory }),
          ...networkQualityMonitorRef.current.getSummary(),
        };
        trackEvent(event.CALL_ENDED, callEndedParams);
      }

      try {
        await fetch('/api/log/call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: channelInfo.peerId,
            code: reason.code,
            message: reason.message,
            callType,
            errorCategory: mapCodeToCategory(code),
            callDurationSec: callDurationSecRef.current,
            deviceInfo: getDeviceInfo(),
            networkQuality: networkQualityMonitorRef.current.getSummary(),
          }),
        });
      } catch (_) {
        // ログ送信は fire-and-forget のため、失敗しても通話終了処理を継続
      }

      // stats ポーリングのクリーンアップ
      statsPolling.cleanup();

      // フラグのリセット
      isAudioFrameDecodedRef.current = false;
      isVideoFrameDecodedRef.current = false;
      pointConsumptionStartedRef.current = false;
      videoTimeoutHandledRef.current = false;
      audioTimeoutHandledRef.current = false;
      networkQualityMonitorRef.current.reset();

      rtc.current.remoteAudioTrack?.stop();
      rtc.current.remoteVideoTrack?.stop();
      rtc.current.localAudioTrack?.stop();
      rtc.current.localVideoTrack?.stop();
      rtc.current.localAudioTrack?.close();
      rtc.current.localVideoTrack?.close();
      rtc.current = {
        ...rtc.current,
        remoteAudioTrack: null,
        remoteVideoTrack: null,
        localAudioTrack: null,
        localVideoTrack: null,
      };
      rtc.current.client?.removeAllListeners();
      try {
        await rtc.current.client?.leave();
      } catch (e) {
        console.error('RTC leave error:', e);
      } finally {
        cameraMode.current = 'before_ready';
        rtc.current = intitialRtc;
        setCallState(afterCall);
        setCallDurationSec(undefined);
      }

      // DOM上のvideo/audio要素を明示的にクリーンアップ
      const localVideoContainer = document.getElementById('local_video');
      const remoteVideoContainer = document.getElementById('remote_video');

      if (localVideoContainer) {
        // 子要素のvideo/audioを全て削除
        const mediaElements =
          localVideoContainer.querySelectorAll('video, audio');
        if (mediaElements.length > 0) {
          mediaElements.forEach((el) => {
            const mediaEl = el as HTMLVideoElement | HTMLAudioElement;
            mediaEl.pause();
            mediaEl.src = '';
            mediaEl.load();
            mediaEl.remove();
          });
        }
      }

      if (remoteVideoContainer) {
        const mediaElements =
          remoteVideoContainer.querySelectorAll('video, audio');
        if (mediaElements.length > 0) {
          mediaElements.forEach((el) => {
            const mediaEl = el as HTMLVideoElement | HTMLAudioElement;
            mediaEl.pause();
            mediaEl.src = '';
            mediaEl.load();
            mediaEl.remove();
          });
        }
      }

      // Media Session APIをクリア（iOSロック画面のメディアコントロール削除）
      clearMediaSession();

      // セッションストレージのクリーンアップを追加
      sessionStorage.removeItem('appId');
      sessionStorage.removeItem('rtcChannelToken');
      sessionStorage.removeItem('channelId');
      sessionStorage.removeItem('rtmChannelId');

      // Nativeアプリへの通話終了通知は上の CALL_ENDED イベント送信ブロックで実施済み
    },
    [setCallState, setCallDurationSec],
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      onLeave(777);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onLeave]);

  useEffect(() => {
    isAgoraRtmLoingDoneWhenOutGoingCallRef.current =
      isAgoraRtmLoginDoneWhenOutGoingCall;
  }, [isAgoraRtmLoginDoneWhenOutGoingCall]);

  useEffect(() => {
    if (callDurationSec === undefined) return;
    callDurationSecRef.current = callDurationSec;
  }, [callDurationSec]);

  // stats ポーリング（主判定）: getRemoteVideoStats / getRemoteAudioStats で受信確認
  const statsPolling = useAgoraStatsPolling({
    getClient: () => rtc.current.client,
    callType,
    partnerId: channelInfo.peerId ?? '',
  });

  // ポイント消費を開始する関数
  const startPointConsumption = useCallback(() => {
    if (pointConsumptionStartedRef.current) return;
    pointConsumptionStartedRef.current = true;
    activateNavigationGuard();
    addCallBreadcrumb('Point consumption started', 'billing');

    isMicMutedRef.current = false;
    setCallDurationSec(0);

    // ビデオ通話の場合のみ設定
    if (callType !== 'voiceCall') {
      setIsRemoteVideoReceived(true);
    }

    // GA4・Reproイベント送信（ポイント消費開始時）
    if (
      callType === 'live' ||
      callType === 'sideWatch' ||
      callType === 'videoChatFromOutgoing' ||
      callType === 'videoChatFromIncoming'
    ) {
      trackEvent(event.START_VIDEO_CHAT, {
        partner_id: channelInfo.peerId,
        user_id: session?.user?.id,
      });
      handleCallStarted(GA4CallType.VIDEO_CHAT);
    } else if (
      callType === 'videoCallFromStandby' ||
      callType === 'videoCallFromOutgoing' ||
      callType === 'videoCallFromIncoming'
    ) {
      trackEvent(event.START_VIDEO_CALL, {
        partner_id: channelInfo.peerId,
        user_id: session?.user?.id,
      });
      handleCallStarted(GA4CallType.VIDEO_CALL);
    } else if (callType === 'voiceCall') {
      trackEvent(event.START_VOICE_CALL, {
        partner_id: channelInfo.peerId,
        user_id: session?.user?.id,
      });
      handleCallStarted(GA4CallType.VOICE_CALL);
    }
  }, [
    activateNavigationGuard,
    callType,
    channelInfo.peerId,
    session?.user?.id,
    setCallDurationSec,
  ]);

  // callTypeをAPI用の形式にマッピングする関数
  const mapCallTypeToApiType = useCallback(
    (type: CallType): 'voice' | 'video' | 'live' => {
      if (
        type === 'live' ||
        type === 'videoChatFromOutgoing' ||
        type === 'videoChatFromIncoming'
      ) {
        return 'live';
      } else if (type === 'voiceCall') {
        return 'voice';
      } else {
        return 'video';
      }
    },
    [],
  );

  // 再生確認・autoplayリトライロジック
  const playbackVerification = useAgoraPlaybackVerification({
    callType,
    partnerId: channelInfo.peerId ?? '',
    onLeave,
  });

  // フレームデコード完了をチェックする関数
  const checkFrameDecodedAndStartPointConsumption = useCallback(() => {
    // 音声通話の場合: 音声フレームのみ
    if (callType === 'voiceCall') {
      if (isAudioFrameDecodedRef.current) {
        startPointConsumption();
      }
    }
    // ビデオ通話・ビデオチャットの場合: 映像フレームのみ確認
    // （相手がミュートの場合は audio の first-frame-decoded が来ないため）
    else {
      if (isVideoFrameDecodedRef.current) {
        startPointConsumption();
      }
    }
  }, [callType, startPointConsumption]);

  // フレームデコードタイムアウトを設定する関数
  // 音声と映像で独立したタイムアウトを管理（相手がミュートの場合等に対応）
  useEffect(() => {
    const onJoin = async () => {
      if (rtc.current.client != null) return;

      if (!channelInfo.peerId) return;

      // システム要件チェック（非対応ブラウザを弾く）
      const systemRequirements = AgoraRTC.checkSystemRequirements();
      if (!systemRequirements) {
        console.error('[Agora] System requirements not met');
        alert(
          'お使いのブラウザは通話機能に対応していません。Chrome、Safari、Edgeなどの最新ブラウザをお使いください。',
        );
        const callEndedInfo: CallEndedInfo = {
          type: 'withChatButton',
          message: 'お使いのブラウザは通話機能に対応していません',
          partnerId: channelInfo.peerId!,
        };
        sessionStorage.setItem(callEndedInfoKey, JSON.stringify(callEndedInfo));
        conditionalBack(router, '/girls/all');
        return;
      }

      // Autoplay失敗時のハンドラを設定
      // ブラウザのAutoplayポリシーにより再生がブロックされた場合に呼ばれる
      // トースト表示・ユーザータップ待機・10秒タイムアウト切断を useAgoraPlaybackVerification に委譲
      playbackVerification.setupAutoplayHandler(
        () => rtc.current.remoteVideoTrack,
        () => rtc.current.remoteAudioTrack,
      );

      const convertToNumberString = (match: string) => {
        return (match.charCodeAt(0) - 96).toString();
      };

      const convertToAgoraUID = (userId: string) => {
        const agoraUidWithAlphabet = userId.substr(5, 3) + userId.substr(-6, 6);
        return Number(
          agoraUidWithAlphabet.replace(/[a-z]/gi, convertToNumberString),
        );
      };

      addCallBreadcrumb('RTC join started', 'rtc', {
        channelId: channelInfo.channelId,
      });

      const response = await postToNext<AgoraUid>(GET_AGORA_UID, { callType });
      if (response.type === 'error') return;

      const channelerId = convertToAgoraUID(channelInfo.peerId);

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      rtc.current = { ...rtc.current, client };

      // 接続状態の監視（SDKの自動再接続機能を活用）
      client.on('connection-state-change', (curState, prevState, reason) => {
        console.log(
          `[Agora] Connection state: ${prevState} -> ${curState}, reason: ${reason}`,
        );
        addCallBreadcrumb('Connection state change', 'rtc', {
          curState,
          prevState,
          reason,
        });
        lastRtcStateReasonRef.current = reason as string | undefined;

        if (curState === 'RECONNECTING') {
          // SDKが自動再接続中 - ユーザーに通知（UIで表示可能）
          console.log('[Agora] Network interrupted, SDK is reconnecting...');
        }

        if (curState === 'DISCONNECTED' && reason === 'LEAVE') {
          // 正常な離脱
          console.log('[Agora] Left channel normally');
        }

        if (curState === 'DISCONNECTED' && reason !== 'LEAVE') {
          // 異常切断 → 通話終了（重複送信防止 onLeave 内で制御）
          console.error('[Agora] Disconnected unexpectedly:', reason);
          const r = (String(reason) || '').toUpperCase();
          const disconnectCategory = (() => {
            if (r.includes('KEEP_ALIVE_TIMEOUT'))
              return CALL_ERROR_CATEGORY.RTC_DISCONNECT_KEEPALIVE;
            if (r.includes('REJECTED'))
              return CALL_ERROR_CATEGORY.RTC_DISCONNECT_REJECTED;
            if (r.includes('BANNED'))
              return CALL_ERROR_CATEGORY.RTC_DISCONNECT_BANNED;
            if (
              r.includes('REJOIN_FAILED') ||
              r.includes('OPEN_CHANNEL_TIMEOUT')
            )
              return CALL_ERROR_CATEGORY.RTC_RECONNECT_FAILED;
            return CALL_ERROR_CATEGORY.RTC_DISCONNECT_LOST;
          })();
          captureCallError(
            new Error(`RTC disconnected unexpectedly: ${reason}`),
            disconnectCategory,
            {
              callType,
              partnerId: channelInfo.peerId,
              callDurationSec: callDurationSecRef.current,
              reason: String(reason),
            },
          );
          // 996: RTC異常切断
          onLeave(996);
        }
      });

      // SDKの例外イベントを監視
      // 音量・ビットレート系の警告（2001〜2004）はbreadcrumbのみ、それ以外はSentryにerrorとして送信
      client.on('exception', (event) => {
        lastSdkExceptionRef.current = { code: event.code, msg: event.msg };

        if (NON_CRITICAL_EXCEPTION_CODES.has(event.code)) {
          // 音量・ビットレート系は warning レベルで記録（Sentry error は送らない）
          console.warn('[Agora] Warning:', event.code, event.msg, event.uid);
          addCallBreadcrumb(
            'SDK warning',
            'rtc',
            {
              code: event.code,
              msg: event.msg,
              uid: event.uid,
            },
            'warning',
          );
        } else {
          // それ以外は error レベルで Sentry に送信
          console.error('[Agora] Exception:', event.code, event.msg, event.uid);
          addCallBreadcrumb(
            'SDK exception',
            'rtc',
            {
              code: event.code,
              msg: event.msg,
              uid: event.uid,
            },
            'error',
          );
          captureCallError(
            new Error(`Agora SDK exception: ${event.code} - ${event.msg}`),
            CALL_ERROR_CATEGORY.SDK_EXCEPTION,
            {
              callType,
              partnerId: channelInfo.peerId,
              sdkCode: event.code,
              sdkMsg: event.msg,
            },
          );
        }

        // AUDIO_INPUT_LEVEL_TOO_LOW 検知 → マイクゲインをブースト
        if (
          event.code === AGORA_EXCEPTION_CODES.AUDIO_INPUT_LEVEL_TOO_LOW &&
          rtc.current.localAudioTrack
        ) {
          try {
            rtc.current.localAudioTrack.setVolume(AUDIO_VOLUME_BOOSTED);
            addCallBreadcrumb('Audio volume boosted', 'rtc', {
              volume: AUDIO_VOLUME_BOOSTED,
              reason: 'AUDIO_INPUT_LEVEL_TOO_LOW',
            });
          } catch (error) {
            console.warn('[Agora] Failed to boost audio volume:', error);
            addCallBreadcrumb('Audio volume boost failed', 'rtc', {
              error: String(error),
            });
          }
        }

        // AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER → ゲインを元に戻す
        // 旧コード(2002)と新コード(4001)の両方に対応
        if (
          (event.code ===
            AGORA_EXCEPTION_CODES.AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER ||
            event.code ===
              AGORA_EXCEPTION_CODES.AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER_V2) &&
          rtc.current.localAudioTrack
        ) {
          try {
            rtc.current.localAudioTrack.setVolume(AUDIO_VOLUME_DEFAULT);
            addCallBreadcrumb('Audio volume reset', 'rtc', {
              volume: AUDIO_VOLUME_DEFAULT,
              reason: 'AUDIO_INPUT_LEVEL_TOO_LOW_RECOVER',
            });
          } catch (error) {
            console.warn('[Agora] Failed to reset audio volume:', error);
            addCallBreadcrumb('Audio volume reset failed', 'rtc', {
              error: String(error),
            });
          }
        }
      });

      // 相手がpublishできているか検知（user-joined後5秒タイマー）
      client.on('user-joined', (user) => {
        console.log('[Agora] user-joined:', user.uid);
        addCallBreadcrumb(
          'Remote user joined',
          'rtc',
          { uid: user.uid },
          'info',
        );

        // 5秒以内にpublishされなければ警告
        const timerId = setTimeout(() => {
          addCallBreadcrumb(
            'Remote user publish timeout',
            'rtc',
            { uid: user.uid, timeoutMs: 5000 },
            'warning',
          );
          captureCallWarning(
            `User ${user.uid} joined but did not publish within 5 seconds`,
            CALL_ERROR_CATEGORY.REMOTE_PUBLISH_TIMEOUT,
            {
              callType,
              partnerId: channelInfo.peerId,
              remoteUid: user.uid,
            },
          );
          publishDetectionTimers.current.delete(String(user.uid));
        }, 5000);

        publishDetectionTimers.current.set(String(user.uid), timerId);
      });

      client.on('user-published', async (user, mediaType) => {
        if (user.uid === response.uid) return;

        // Publishタイマークリア（正常にpublishされた）
        const detection = publishDetectionTimers.current.get(String(user.uid));
        if (detection) {
          clearTimeout(detection);
          publishDetectionTimers.current.delete(String(user.uid));
          addCallBreadcrumb(
            'Remote publish detected (timer cleared)',
            'rtc',
            { uid: user.uid, mediaType },
            'info',
          );
        }

        /**
         * subscribe → null の場合に1回リトライする共通ヘルパー。
         * 初回 video/audio subscribe・createRetryFunction 経由の4箇所で利用。
         */
        const subscribeTrackWithRetry = async <
          T extends IRemoteVideoTrack | IRemoteAudioTrack,
        >(
          targetMediaType: 'video' | 'audio',
        ): Promise<T | null> => {
          try {
            let track = await rtc.current.client?.subscribe(
              user,
              targetMediaType,
            );
            if (!track) {
              addCallBreadcrumb(
                'Subscribe returned no track, retrying once',
                'media',
                { uid: user.uid },
                'warning',
              );
              track = await rtc.current.client?.subscribe(
                user,
                targetMediaType,
              );
            }
            return (track as T) ?? null;
          } catch (error) {
            addCallBreadcrumb(
              'Subscribe failed during retry',
              'media',
              { uid: user.uid, error: String(error) },
              'error',
            );
            return null;
          }
        };

        /**
         * リトライ関数ファクトリ: unsubscribe → subscribe（1回リトライ付き）→ first-frame-decoded 登録 → play()
         * retryVideoFn / retryAudioFn の共通ロジックを集約。
         */
        const createRetryFunction =
          <T extends IRemoteVideoTrack | IRemoteAudioTrack>(
            targetMediaType: 'video' | 'audio',
            setupFrameListener: (track: T) => void,
          ) =>
          async (): Promise<void> => {
            await rtc.current.client?.unsubscribe(user, targetMediaType);
            const newTrack = await subscribeTrackWithRetry<T>(targetMediaType);
            if (!newTrack) {
              throw new Error(
                `Retry subscribe returned no ${targetMediaType} track`,
              );
            }
            setupFrameListener(newTrack);
            if (targetMediaType === 'video') {
              (newTrack as IRemoteVideoTrack).play('remote_video');
            } else {
              (newTrack as IRemoteAudioTrack).play();
            }
            rtc.current = {
              ...rtc.current,
              [`remote${targetMediaType.charAt(0).toUpperCase() + targetMediaType.slice(1)}Track`]:
                newTrack,
            } as typeof rtc.current;
          };

        if (mediaType === 'video') {
          addCallBreadcrumb(
            'Remote video published',
            'media',
            { uid: user.uid },
            'info',
          );
          if (callType === 'voiceCall') return;

          // subscribeできていない検知（失敗時は1回リトライ）
          try {
            const remoteVideoTrack =
              await subscribeTrackWithRetry<IRemoteVideoTrack>('video');

            addCallBreadcrumb(
              'Remote video subscribe succeeded',
              'media',
              { uid: user.uid },
              'info',
            );

            // リトライ後もトラックが取得できない場合は通話終了
            if (!remoteVideoTrack) {
              addCallBreadcrumb(
                'Subscribe retry failed: video track still undefined',
                'media',
                { uid: user.uid },
                'error',
              );
              captureCallError(
                new Error(
                  'Subscribe retry failed: video track is still undefined',
                ),
                CALL_ERROR_CATEGORY.SUBSCRIBE_RETRY_FAILED,
                {
                  callType,
                  partnerId: channelInfo.peerId,
                  mediaType: 'video',
                },
              );
              await onLeave(998);
              return;
            }

            // play()未実行・Autoplay検知
            try {
              /**
               * 映像トラックに first-frame-decoded リスナーを登録する共通処理。
               * play()前に登録することでレースコンディション（play()中に発火して取りこぼす）を防ぐ。
               * リトライ後の新トラックに対しても同じ設定を行うため関数化。
               */
              const setupVideoFirstFrameListener = (
                track: IRemoteVideoTrack,
              ) => {
                track.once('first-frame-decoded', () => {
                  statsPolling.markVideoConfirmed(); // stats ポーリングをモニタリングモードへ移行
                  addCallBreadcrumb(
                    'Video first frame decoded',
                    'media',
                    {},
                    'info',
                  );
                  isVideoFrameDecodedRef.current = true;
                  checkFrameDecodedAndStartPointConsumption();
                });
              };

              // first-frame-decoded リスナー登録（初回のみ）
              if (rtc.current.remoteVideoTrack === null) {
                setupVideoFirstFrameListener(remoteVideoTrack);
              }

              // 映像の再生を開始
              await remoteVideoTrack.play('remote_video');
              addCallBreadcrumb(
                'Remote video play started',
                'media',
                { uid: user.uid },
                'info',
              );

              /** stats タイムアウト（10s）時に checkForceDisconnectVideo から呼ばれるリトライ関数 */
              const retryVideoFn = createRetryFunction<IRemoteVideoTrack>(
                'video',
                setupVideoFirstFrameListener,
              );

              // stats ポーリングを開始（5s・10sで確認→以降はモニタリング・初回のみ）
              if (rtc.current.remoteVideoTrack === null) {
                statsPolling.startVideoStatsPolling(user.uid, {
                  onConfirmed: () => {
                    if (isVideoFrameDecodedRef.current) return;
                    addCallBreadcrumb(
                      'Video stats polling triggered point consumption',
                      'media',
                      {},
                      'info',
                    );
                    isVideoFrameDecodedRef.current = true;
                    checkFrameDecodedAndStartPointConsumption();
                  },
                  onTimeout: () => {
                    if (isVideoFrameDecodedRef.current) return;
                    if (videoTimeoutHandledRef.current) return;
                    videoTimeoutHandledRef.current = true;
                    playbackVerification.checkForceDisconnectVideo(
                      remoteVideoTrack,
                      retryVideoFn,
                      user.uid,
                    );
                  },
                  onQualityDegraded: () => {
                    // 一時的な品質低下は通話継続中に頻発するため breadcrumb のみ記録
                    addCallBreadcrumb(
                      'Video quality degraded during call',
                      'media',
                      { callType, partnerId: channelInfo.peerId },
                      'info',
                    );
                  },
                });
              }

              // デコードできていない検知（video要素の可視性とstate監視）
              // 初回のみ登録（再publish時はuser-unpublishedでリスナー解除→remoteVideoTrack=nullにリセット済み）
              if (rtc.current.remoteVideoTrack === null) {
                remoteVideoTrack.on(
                  'video-element-visible-status',
                  (status: any) => {
                    const statusNum =
                      typeof status === 'number' ? status : Number(status);
                    addCallBreadcrumb(
                      'Video element visible status changed',
                      'media',
                      { status: statusNum },
                      statusNum === -2 ? 'warning' : 'info',
                    );

                    if (statusNum === -2) {
                      const visibleStatus =
                        remoteVideoTrack.getVideoElementVisibleStatus?.();
                      captureCallWarning(
                        `Video element not visible: status=${visibleStatus}`,
                        CALL_ERROR_CATEGORY.VIDEO_ELEMENT_NOT_VISIBLE,
                        {
                          callType,
                          partnerId: channelInfo.peerId,
                          visibleStatus,
                        },
                      );
                    }
                  },
                );

                // video-state-changed イベント（Web SDK v4.20.x以降）
                if (typeof remoteVideoTrack.on === 'function') {
                  remoteVideoTrack.on('video-state-changed', (state: any) => {
                    const stateStr = String(state);
                    const level =
                      stateStr === 'STOPPED' || stateStr === 'FAILED'
                        ? 'warning'
                        : 'info';
                    addCallBreadcrumb(
                      'Video state changed',
                      'media',
                      { state: stateStr },
                      level,
                    );

                    if (stateStr === 'STOPPED' || stateStr === 'FAILED') {
                      captureCallWarning(
                        `Video state abnormal: ${stateStr}`,
                        CALL_ERROR_CATEGORY.VIDEO_STATE_ABNORMAL,
                        {
                          callType,
                          partnerId: channelInfo.peerId,
                          videoState: stateStr,
                        },
                      );
                    }
                  });
                }
              }
            } catch (error) {
              addCallBreadcrumb(
                'Remote video play failed',
                'media',
                { uid: user.uid, error: String(error) },
                'error',
              );
              console.error('Failed to play remote video:', error);
              captureCallError(
                error instanceof Error ? error : new Error(String(error)),
                CALL_ERROR_CATEGORY.VIDEO_PLAY_FAILURE,
                {
                  callType,
                  partnerId: channelInfo.peerId,
                  callDurationSec: callDurationSecRef.current,
                },
              );
              // 映像が再生できない場合は通話を終了
              await onLeave(998); // 998: 映像再生エラー
            }

            rtc.current = { ...rtc.current, remoteVideoTrack };
          } catch (subscribeError: any) {
            // Subscribe失敗を検知してエラーカテゴリ別に送信
            const errorCode = subscribeError?.code || 'UNKNOWN';

            addCallBreadcrumb(
              'Remote video subscribe failed',
              'media',
              { uid: user.uid, errorCode },
              'error',
            );

            const subscribeCategory = (() => {
              switch (errorCode) {
                case 'INVALID_REMOTE_USER':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_INVALID_USER;
                case 'REMOTE_USER_IS_NOT_PUBLISHED':
                case 'TRACK_IS_NOT_PUBLISHED':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_NOT_PUBLISHED;
                case 'OPERATION_ABORTED':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_ABORTED;
                default:
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_FAILED;
              }
            })();

            captureCallError(subscribeError, subscribeCategory, {
              callType,
              partnerId: channelInfo.peerId,
              mediaType: 'video',
              errorCode,
            });
          }
        }

        if (mediaType === 'audio') {
          addCallBreadcrumb(
            'Remote audio published',
            'media',
            { uid: user.uid },
            'info',
          );
          setIsPartnerMicMutedState(false);

          // subscribeできていない検知（失敗時は1回リトライ）
          try {
            const remoteAudioTrack =
              await subscribeTrackWithRetry<IRemoteAudioTrack>('audio');

            addCallBreadcrumb(
              'Remote audio subscribe succeeded',
              'media',
              { uid: user.uid },
              'info',
            );

            // リトライ後もトラックが取得できない場合は通話終了
            if (!remoteAudioTrack) {
              addCallBreadcrumb(
                'Subscribe retry failed: audio track still undefined',
                'media',
                { uid: user.uid },
                'error',
              );
              captureCallError(
                new Error(
                  'Subscribe retry failed: audio track is still undefined',
                ),
                CALL_ERROR_CATEGORY.SUBSCRIBE_RETRY_FAILED,
                {
                  callType,
                  partnerId: channelInfo.peerId,
                  mediaType: 'audio',
                },
              );
              await onLeave(999);
              return;
            }

            // play()未実行・Autoplay検知
            try {
              /**
               * 音声トラックに first-frame-decoded リスナーを登録する共通処理。
               * play()前に登録することでレースコンディション（play()中に発火して取りこぼす）を防ぐ。
               * リトライ後の新トラックに対しても同じ設定を行うため関数化。
               */
              const setupAudioFirstFrameListener = (
                track: IRemoteAudioTrack,
              ) => {
                track.once('first-frame-decoded', () => {
                  statsPolling.markAudioConfirmed(); // stats ポーリングをモニタリングモードへ移行
                  addCallBreadcrumb(
                    'Audio first frame decoded',
                    'media',
                    {},
                    'info',
                  );
                  isAudioFrameDecodedRef.current = true;
                  checkFrameDecodedAndStartPointConsumption();
                });
              };

              // first-frame-decoded リスナー登録（初回のみ）
              if (rtc.current.remoteAudioTrack === null) {
                setupAudioFirstFrameListener(remoteAudioTrack);
                // 音声通話の場合のみCALL_STARTEDイベント送信
                if (callType === 'voiceCall') {
                  handleCallStarted(GA4CallType.VOICE_CALL);
                }
              }

              // 音声の再生を開始
              await remoteAudioTrack.play();
              addCallBreadcrumb(
                'Remote audio play started',
                'media',
                { uid: user.uid },
                'info',
              );

              /** stats タイムアウト（10s）時に checkForceDisconnectAudio から呼ばれるリトライ関数 */
              const retryAudioFn = createRetryFunction<IRemoteAudioTrack>(
                'audio',
                setupAudioFirstFrameListener,
              );

              // stats ポーリングを開始（全通話タイプ・5s・10sで確認→以降はモニタリング・初回のみ）
              // 音声通話: 確認後にポイント消費開始・タイムアウト時に切断判定
              // ビデオ通話・ビデオチャット: Sentry記録のみ・切断なし（切断判定は映像statsに依存）
              if (rtc.current.remoteAudioTrack === null) {
                statsPolling.startAudioStatsPolling(user.uid, {
                  onConfirmed: () => {
                    if (callType !== 'voiceCall') {
                      addCallBreadcrumb(
                        'Audio stats confirmed (monitoring only)',
                        'media',
                        { callType },
                        'info',
                      );
                      return;
                    }
                    if (isAudioFrameDecodedRef.current) return;
                    addCallBreadcrumb(
                      'Audio stats polling triggered point consumption',
                      'media',
                      {},
                      'info',
                    );
                    isAudioFrameDecodedRef.current = true;
                    checkFrameDecodedAndStartPointConsumption();
                  },
                  onTimeout: () => {
                    if (callType !== 'voiceCall') return; // ビデオ通話・ビデオチャットは切断しない（Sentry記録はuseAgoraStatsPolling内で実施済み）
                    if (isAudioFrameDecodedRef.current) return;
                    if (audioTimeoutHandledRef.current) return;
                    audioTimeoutHandledRef.current = true;
                    playbackVerification.checkForceDisconnectAudio(
                      remoteAudioTrack,
                      retryAudioFn,
                      user.uid,
                    );
                  },
                  onQualityDegraded: () => {
                    // 一時的な品質低下は通話継続中に頻発するため breadcrumb のみ記録
                    addCallBreadcrumb(
                      'Audio quality degraded during call',
                      'media',
                      { callType, partnerId: channelInfo.peerId },
                      'info',
                    );
                  },
                });
              }
            } catch (error) {
              addCallBreadcrumb(
                'Remote audio play failed',
                'media',
                { uid: user.uid, error: String(error) },
                'error',
              );
              console.error('Failed to play remote audio:', error);
              captureCallError(
                error instanceof Error ? error : new Error(String(error)),
                CALL_ERROR_CATEGORY.AUDIO_PLAY_FAILURE,
                {
                  callType,
                  partnerId: channelInfo.peerId,
                  callDurationSec: callDurationSecRef.current,
                },
              );
              // 音声が再生できない場合は通話を終了
              await onLeave(999); // 999: 音声再生エラー
            }

            rtc.current = { ...rtc.current, remoteAudioTrack };
          } catch (subscribeError: any) {
            // Subscribe失敗を検知してエラーカテゴリ別に送信
            const errorCode = subscribeError?.code || 'UNKNOWN';

            addCallBreadcrumb(
              'Remote audio subscribe failed',
              'media',
              { uid: user.uid, errorCode },
              'error',
            );

            const subscribeCategory = (() => {
              switch (errorCode) {
                case 'INVALID_REMOTE_USER':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_INVALID_USER;
                case 'REMOTE_USER_IS_NOT_PUBLISHED':
                case 'TRACK_IS_NOT_PUBLISHED':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_NOT_PUBLISHED;
                case 'OPERATION_ABORTED':
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_ABORTED;
                default:
                  return CALL_ERROR_CATEGORY.SUBSCRIBE_FAILED;
              }
            })();

            captureCallError(subscribeError, subscribeCategory, {
              callType,
              partnerId: channelInfo.peerId,
              mediaType: 'audio',
              errorCode,
            });
          }
        }
      });

      client.on('user-unpublished', async (user, mediaType) => {
        if (mediaType === 'audio' && user.uid !== response.uid) {
          setIsPartnerMicMutedState(true);
        }

        // 古いビデオトラックのリスナーをクリーンアップ（再publish時のリスナー重複蓄積を防止）
        // audio は .once('first-frame-decoded') のみで永続リスナーがないため対象外
        if (mediaType === 'video' && rtc.current.remoteVideoTrack) {
          try {
            rtc.current.remoteVideoTrack.removeAllListeners();
            rtc.current.remoteVideoTrack.stop();
          } catch (error) {
            console.warn('Failed to clean up video track:', error);
          } finally {
            rtc.current = { ...rtc.current, remoteVideoTrack: null };
          }
        }
      });

      // Stream-fallback 検知（映像→音声のみに降格）
      client.on('stream-fallback', (uid, isFallbackOrRecover) => {
        if (isFallbackOrRecover) {
          // 映像→音声のみに降格
          console.warn('[Agora] Stream fallback to audio-only:', uid);
          addCallBreadcrumb(
            'Stream fallback to audio-only',
            'media',
            { uid, fallback: true },
            'warning',
          );
          captureCallWarning(
            `Stream fallback to audio-only for user ${uid}`,
            CALL_ERROR_CATEGORY.VIDEO_STREAM_FALLBACK,
            {
              callType,
              partnerId: channelInfo.peerId,
              remoteUid: uid,
            },
          );
        } else {
          // 回復
          console.log('[Agora] Stream recovered from fallback:', uid);
          addCallBreadcrumb(
            'Stream recovered from fallback',
            'media',
            { uid, fallback: false },
            'info',
          );
        }
      });

      while (
        (callView.type === 'videoCallFromOutgoing' ||
          callView.type === 'voiceCall' ||
          callView.type === 'videoChatFromOutgoing') &&
        !isAgoraRtmLoingDoneWhenOutGoingCallRef.current
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      await client.join(
        channelInfo.appId,
        channelInfo.channelId,
        channelInfo.rtcChannelToken,
        null,
      );
      addCallBreadcrumb('RTC join succeeded', 'rtc', { uid: response.uid });
      rtc.current = { ...rtc.current, client };

      client.on('network-quality', (stats) => {
        networkQualityMonitorRef.current.addSample(
          stats.uplinkNetworkQuality,
          stats.downlinkNetworkQuality,
        );
      });

      client.on('user-left', async (user) => {
        if (
          (callType === 'live' ||
            callType === 'videoChatFromOutgoing' ||
            callType === 'videoChatFromIncoming') &&
          user.uid !== channelerId
        ) {
          return;
        }
        if (user.uid === response.uid) return;
        rtc.current.client?.removeAllListeners();
        closeStopCallModal();
        await onLeave(555);
        if (!routeBack.current) return;
        const callEndedInfo: CallEndedInfo = {
          type: 'withChatButton',
          message: callView.endedCallByWomanMessage,
          partnerId: channelInfo.peerId!,
          ...(callDurationSecRef.current !== undefined && {
            callDurationSec: callDurationSecRef.current,
          }),
        };
        sessionStorage.setItem(callEndedInfoKey, JSON.stringify(callEndedInfo));
        // 画面遷移は各コンポーネントのcallEventKeys.callEndリスナーで行う
        callEventEmitter.emit(callEventKeys.callEnd);
      });

      let localAudioTrack = null;
      let localVideoTrack = null;

      // リトライ設定
      const MAX_RETRY_COUNT = 2;
      const RETRY_DELAY_MS = 1000;

      // エラーハンドリング用のヘルパー関数
      const handleTrackCreationError = (error: any): boolean => {
        const errorCode = error?.code;
        console.error(
          '[Agora] Track creation error:',
          errorCode,
          error?.message,
        );
        if (errorCode) {
          lastAgoraErrorCodeRef.current = String(errorCode);
        }

        if (errorCode === AGORA_ERROR_CODES.PERMISSION_DENIED) {
          console.error(
            'カメラ・マイクの使用が許可されていません。ブラウザの設定からカメラ・マイクへのアクセスを許可してください。',
          );
          captureCallError(
            error instanceof Error ? error : new Error(String(error)),
            CALL_ERROR_CATEGORY.DEVICE_PERMISSION_DENIED,
            { callType, partnerId: channelInfo.peerId },
          );
          // ブラウザ環境のみモーダル表示（Native環境は事前のcheckAndRequestPermissionで処理済み）
          if (!native.isInWebView()) {
            const isVoiceOnly =
              callType === 'voiceCall' || callType === 'voiceCallFromOutgoing';
            const denied: ('camera' | 'microphone')[] = isVoiceOnly
              ? ['microphone']
              : ['camera', 'microphone'];
            openNativePermissionModal(denied);
          }
          return false;
        }

        if (errorCode === AGORA_ERROR_CODES.DEVICE_NOT_FOUND) {
          alert(
            'カメラまたはマイクが見つかりません。デバイスが正しく接続されているか確認してください。',
          );
          captureCallError(
            error instanceof Error ? error : new Error(String(error)),
            CALL_ERROR_CATEGORY.DEVICE_NOT_FOUND,
            { callType, partnerId: channelInfo.peerId },
          );
          return false; // リトライ不可
        }

        // NOT_READABLE等はリトライ可能
        captureCallError(
          error instanceof Error ? error : new Error(String(error)),
          CALL_ERROR_CATEGORY.DEVICE_NOT_READABLE,
          { callType, partnerId: channelInfo.peerId, errorCode },
        );
        return true;
      };

      // ビデオ通話の場合は、カメラとマイクを同時に要求
      if (
        callView.type === 'videoCallFromStandby' ||
        callView.type === 'videoCallFromOutgoing' ||
        callView.type === 'videoCallFromIncoming'
      ) {
        let retryCount = 0;
        let trackCreationSuccess = false;

        while (retryCount <= MAX_RETRY_COUNT && !trackCreationSuccess) {
          try {
            const [audioTrack, videoTrack] =
              await AgoraRTC.createMicrophoneAndCameraTracks(
                {
                  encoderConfig: 'music_standard',
                  AEC: true,
                  AGC: true,
                  ANS: true,
                },
                {
                  facingMode: 'user',
                  optimizationMode: 'motion',
                },
              );
            localAudioTrack = audioTrack;
            localVideoTrack = videoTrack;
            trackCreationSuccess = true;
          } catch (error: any) {
            const canRetry = handleTrackCreationError(error);

            if (!canRetry) {
              // リトライ不可のエラー → 通話終了
              const callEndedInfo: CallEndedInfo = {
                type: 'withChatButton',
                message: 'カメラまたはマイクにアクセスできませんでした',
                partnerId: channelInfo.peerId!,
              };
              sessionStorage.setItem(
                callEndedInfoKey,
                JSON.stringify(callEndedInfo),
              );
              conditionalBack(router, '/girls/all');
              return;
            }

            retryCount++;
            if (retryCount <= MAX_RETRY_COUNT) {
              await new Promise((resolve) =>
                setTimeout(resolve, RETRY_DELAY_MS),
              );
            } else {
              // リトライ上限に達した
              alert(
                'カメラまたはマイクが他のアプリで使用中です。他のアプリを閉じてから再度お試しください。',
              );
              const callEndedInfo: CallEndedInfo = {
                type: 'withChatButton',
                message: 'カメラまたはマイクにアクセスできませんでした',
                partnerId: channelInfo.peerId!,
              };
              sessionStorage.setItem(
                callEndedInfoKey,
                JSON.stringify(callEndedInfo),
              );
              conditionalBack(router, '/girls/all');
              return;
            }
          }
        }
      }
      // 音声通話の場合は、マイクのみを要求
      else if (callType === 'voiceCall') {
        let retryCount = 0;
        let trackCreationSuccess = false;

        while (retryCount <= MAX_RETRY_COUNT && !trackCreationSuccess) {
          try {
            localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
              encoderConfig: 'music_standard',
              AEC: true,
              AGC: true,
              ANS: true,
            });
            trackCreationSuccess = true;
          } catch (error: any) {
            const canRetry = handleTrackCreationError(error);

            if (!canRetry) {
              // リトライ不可のエラー → 通話終了
              const callEndedInfo: CallEndedInfo = {
                type: 'withChatButton',
                message: 'マイクにアクセスできませんでした',
                partnerId: channelInfo.peerId!,
              };
              sessionStorage.setItem(
                callEndedInfoKey,
                JSON.stringify(callEndedInfo),
              );
              conditionalBack(router, '/girls/all');
              return;
            }

            retryCount++;
            if (retryCount <= MAX_RETRY_COUNT) {
              await new Promise((resolve) =>
                setTimeout(resolve, RETRY_DELAY_MS),
              );
            } else {
              // リトライ上限に達した
              alert(
                'マイクが他のアプリで使用中です。他のアプリを閉じてから再度お試しください。',
              );
              const callEndedInfo: CallEndedInfo = {
                type: 'withChatButton',
                message: 'マイクにアクセスできませんでした',
                partnerId: channelInfo.peerId!,
              };
              sessionStorage.setItem(
                callEndedInfoKey,
                JSON.stringify(callEndedInfo),
              );
              conditionalBack(router, '/girls/all');
              return;
            }
          }
        }
      }

      rtc.current = { ...rtc.current, localAudioTrack, localVideoTrack };

      // トラック作成直後にミュート状態を明示的に設定
      if (localAudioTrack) {
        try {
          await localAudioTrack.setMuted(false);
          isMicMutedRef.current = false;
        } catch (error) {
          console.error(
            '[Agora] Failed to initialize audio track mute state:',
            error,
          );
          isMicMutedRef.current = false;
        }
      }

      rtc.current.localVideoTrack?.play('local_video', {
        mirror: true, // インカメラの時のみ左右反転
      });
      if (
        rtc.current.localAudioTrack === null &&
        rtc.current.localVideoTrack === null
      ) {
        return;
      }
      // publish用のリトライ処理（トラック再作成を含む）
      const publishWithRetry = async (
        tracks: (
          | typeof rtc.current.localAudioTrack
          | typeof rtc.current.localVideoTrack
        )[],
        isVideoCall: boolean,
      ): Promise<boolean> => {
        let retryCount = 0;
        let currentTracks = tracks;

        while (retryCount <= MAX_RETRY_COUNT) {
          try {
            await rtc.current.client?.publish(
              currentTracks.filter(Boolean) as any[],
            );
            return true;
          } catch (error: any) {
            const errorCode = error?.code;
            console.error(
              `[Agora] Publish failed (attempt ${retryCount + 1}):`,
              errorCode,
              error?.message,
            );
            if (errorCode) {
              lastAgoraErrorCodeRef.current = String(errorCode);
            }

            const publishCategory =
              errorCode === AGORA_ERROR_CODES.INVALID_LOCAL_TRACK
                ? CALL_ERROR_CATEGORY.PUBLISH_INVALID_TRACK
                : CALL_ERROR_CATEGORY.PUBLISH_FAILED;
            captureCallError(
              error instanceof Error ? error : new Error(String(error)),
              publishCategory,
              {
                callType,
                partnerId: channelInfo.peerId,
                errorCode,
                attempt: retryCount + 1,
              },
            );

            // トラック関連エラーの場合はトラックを再作成してリトライ
            if (
              errorCode ===
                AGORA_ERROR_CODES.CAN_NOT_PUBLISH_MULTIPLE_VIDEO_TRACKS ||
              errorCode === AGORA_ERROR_CODES.EXIST_DISABLED_VIDEO_TRACK ||
              errorCode === AGORA_ERROR_CODES.INVALID_LOCAL_TRACK
            ) {
              retryCount++;
              if (retryCount <= MAX_RETRY_COUNT) {
                const recreatedTracks = await recreateTracks(
                  isVideoCall,
                  rtc.current.localAudioTrack,
                  rtc.current.localVideoTrack,
                );
                if (recreatedTracks) {
                  // rtc.currentを更新
                  rtc.current = {
                    ...rtc.current,
                    localAudioTrack: recreatedTracks.audioTrack,
                    localVideoTrack: recreatedTracks.videoTrack,
                  };
                  // 再作成したトラックでリトライ
                  if (isVideoCall) {
                    currentTracks = [
                      recreatedTracks.audioTrack,
                      recreatedTracks.videoTrack,
                    ];
                    // ローカルビデオを再生
                    recreatedTracks.videoTrack?.play('local_video', {
                      mirror: true,
                    });
                  } else {
                    currentTracks = [recreatedTracks.audioTrack];
                  }
                  await new Promise((resolve) =>
                    setTimeout(resolve, RETRY_DELAY_MS),
                  );
                  continue;
                } else {
                  // トラック再作成失敗
                  alert(
                    '映像・音声の送信に失敗しました。しばらく時間をおいてから再度お試しください。',
                  );
                  return false;
                }
              } else {
                // リトライ上限に達した
                alert(
                  '映像・音声の送信に失敗しました。しばらく時間をおいてから再度お試しください。',
                );
                return false;
              }
            }

            // その他のエラーは通常のリトライ
            retryCount++;
            if (retryCount <= MAX_RETRY_COUNT) {
              await new Promise((resolve) =>
                setTimeout(resolve, RETRY_DELAY_MS),
              );
            } else {
              // リトライ上限に達した
              alert(
                '映像・音声の送信に失敗しました。しばらく時間をおいてから再度お試しください。',
              );
              return false;
            }
          }
        }
        return false;
      };

      if (callType === 'voiceCall') {
        const publishSuccess = await publishWithRetry(
          [rtc.current.localAudioTrack!],
          false,
        );
        if (!publishSuccess) {
          const callEndedInfo: CallEndedInfo = {
            type: 'withChatButton',
            message: '音声の送信に失敗しました',
            partnerId: channelInfo.peerId!,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
          await onLeave(997);
          conditionalBack(router, '/girls/all');
          return;
        }
      }
      if (
        callView.type === 'videoCallFromStandby' ||
        callView.type === 'videoCallFromOutgoing' ||
        callView.type === 'videoCallFromIncoming'
      ) {
        const publishSuccess = await publishWithRetry(
          [rtc.current.localAudioTrack!, rtc.current.localVideoTrack!],
          true,
        );
        if (!publishSuccess) {
          const callEndedInfo: CallEndedInfo = {
            type: 'withChatButton',
            message: '映像・音声の送信に失敗しました',
            partnerId: channelInfo.peerId!,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
          await onLeave(997);
          conditionalBack(router, '/girls/all');
          return;
        }
        cameraMode.current = 'user';
      }
    };
    onJoin();

    // ページ離脱イベントの追跡（切断原因の特定用）
    const handlePageHide = () => {
      pageHideFiredRef.current = true;
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      beforeUnloadFiredRef.current = true;
      // 通話中（ポイント消費開始後）はブラウザ離脱を警告
      if (pointConsumptionStartedRef.current) {
        e.preventDefault();
        e.returnValue = ''; // レガシーブラウザ互換
      }
    };
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    const isInCall = () => pointConsumptionStartedRef.current;

    /** スワイプバック/ブラウザバック検知時に StopCallModal を表示する（二重表示防止付き）
     *  queueMicrotask で遅延: history.pushState/replaceState が React の useInsertionEffect
     *  フェーズ中に呼ばれた場合、同期的な setState が禁止されるため（React 19）。 */
    const showStopCallModalIfNeeded = () => {
      queueMicrotask(() => {
        const uiState = useUIStore.getState();
        if (!uiState.isStopCallModalOpen) {
          uiState.openStopCallModal();
        }
      });
    };

    const guardedPushState: typeof history.pushState = (...args) => {
      if (!isInCall()) {
        originalPushState(...args);
        return;
      }
      addCallBreadcrumb('SPA pushState blocked', 'navigation', {}, 'warning');
      showStopCallModalIfNeeded();
    };
    const guardedReplaceState: typeof history.replaceState = (...args) => {
      if (!isInCall()) {
        originalReplaceState(...args);
        return;
      }
      // Next.js 内部のスクロール復元やシャローアップデート（URL が変わらない replaceState）は許可
      const newUrl = args[2];
      if (
        newUrl === undefined ||
        newUrl === null ||
        String(newUrl) === window.location.href
      ) {
        originalReplaceState(...args);
        return;
      }
      addCallBreadcrumb(
        'SPA replaceState blocked',
        'navigation',
        {},
        'warning',
      );
      showStopCallModalIfNeeded();
    };
    history.pushState = guardedPushState;
    history.replaceState = guardedReplaceState;

    // iOS (Safari / Chrome): スワイプバックジェスチャーを touchstart レベルでブロック
    // iOS 16+ では popstate が発火しないため history.forward() だけでは防げない（WebKit Bug #248303）。
    // iOS Chrome も WebKit ベースのため同様。
    // 画面左端 / 右端付近の touchstart を preventDefault() してナビゲーションジェスチャーを抑止する。
    const EDGE_THRESHOLD = 30; // px — エッジスワイプ検知幅
    const handleEdgeTouchStart = (e: TouchEvent) => {
      if (!isInCall()) return;
      const x = e.touches[0]?.pageX;
      if (
        x !== undefined &&
        (x < EDGE_THRESHOLD || x > window.innerWidth - EDGE_THRESHOLD)
      ) {
        e.preventDefault();
        showStopCallModalIfNeeded();
      }
    };
    document.addEventListener('touchstart', handleEdgeTouchStart, {
      passive: false,
    });

    const handlePopState = () => {
      if (!isInCall()) return;
      history.forward();
      showStopCallModalIfNeeded();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('touchstart', handleEdgeTouchStart);

      deactivateNavigationGuard();

      // StopCallModal が開いたまま unmount された場合に備えてリセット
      useUIStore.getState().closeStopCallModal();

      // history メソッドを復元
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;

      // 切断原因の共通コンテキスト
      const disconnectContext = {
        callType,
        callState: useCallStore.getState().callState,
        pointConsumptionStarted: pointConsumptionStartedRef.current,
        partnerId: channelInfo.peerId,
        callDurationSec: callDurationSecRef.current,
        lastRtcState: lastRtcStateReasonRef.current,
        isAudioDecoded: isAudioFrameDecodedRef.current,
        isVideoDecoded: isVideoFrameDecodedRef.current,
        visibilityState: document.visibilityState,
        lastSdkException: lastSdkExceptionRef.current,
        pageHideFired: pageHideFiredRef.current,
        beforeUnloadFired: beforeUnloadFiredRef.current,
      };

      if (pointConsumptionStartedRef.current) {
        // 画面離脱（バックグラウンド遷移・タブ切替等）による unmount は
        // iOS WebView で頻発する正常系のため、breadcrumb のみ記録
        const isPageLeave =
          pageHideFiredRef.current ||
          beforeUnloadFiredRef.current ||
          document.visibilityState === 'hidden';

        if (isPageLeave) {
          addCallBreadcrumb(
            'Call ended: user left page during call',
            'lifecycle',
            disconnectContext,
            'info',
          );
        } else {
          captureCallWarning(
            'Call ended unexpectedly: reason unknown',
            CALL_ERROR_CATEGORY.UNMOUNT_UNEXPECTED,
            disconnectContext,
          );
        }
      }
      // ポイント消費開始前のunmount は正常フロー（着信拒否・発信キャンセル等）のため
      // Sentry イベントは送信せず breadcrumb のみ記録
      addCallBreadcrumb(
        'Component unmounting',
        'lifecycle',
        {
          wasConnected: pointConsumptionStartedRef.current,
          visibilityState: document.visibilityState,
          pageHideFired: pageHideFiredRef.current,
          beforeUnloadFired: beforeUnloadFiredRef.current,
        },
        'info',
      );

      // autoplayハンドラのクリーンアップ（トースト・タイムアウト・AgoraRTC.onAutoplayFailed）
      playbackVerification.cleanupAutoplayHandler();

      // stats ポーリングのクリーンアップ
      statsPolling.cleanup();

      // publishDetectionTimersのクリーンアップ
      publishDetectionTimers.current.forEach((timer) => clearTimeout(timer));
      publishDetectionTimers.current.clear();

      onLeave(111);
    };
  }, []);

  const switchCamera = async () => {
    if (
      cameraMode.current === 'switching' ||
      cameraMode.current === 'before_ready'
    )
      return;

    if (rtc.current.localVideoTrack === null || rtc.current.client === null)
      return;

    const cameraNextMode =
      cameraMode.current === 'user' ? 'environment' : 'user';
    cameraMode.current = 'switching';

    await rtc.current.client.unpublish(rtc.current.localVideoTrack);
    await rtc.current.localVideoTrack.stop();
    await rtc.current.localVideoTrack.close();

    const localVideoTrack = await AgoraRTC.createCameraVideoTrack({
      facingMode: cameraNextMode,
    });

    await localVideoTrack.play('local_video', {
      mirror: cameraNextMode === 'user', // インカメラの時のみ反転
    });
    await rtc.current.client.publish([localVideoTrack]);
    rtc.current = { ...rtc.current, localVideoTrack };
    cameraMode.current = cameraNextMode;
  };

  const changeMicState = async () => {
    if (
      isMicMutedRef.current === undefined ||
      isMicMutedRef.current === 'switching'
    )
      return;

    isMicMutedRef.current = 'switching';
    const isMuted = rtc.current.localAudioTrack?.muted;
    await rtc.current.localAudioTrack?.setMuted(!isMuted);
    isMicMutedRef.current = !isMuted;
  };

  return [
    async (code?: number) => {
      // ユーザーによる手動切断の場合のみ通話終了通知を送信
      if (code === undefined || code === 0) {
        // 通話が実際に接続されていた場合のみ送信（発信キャンセルは除外）
        const duration = callDurationSecRef.current;
        if (duration !== undefined && session?.user?.id && channelInfo.peerId) {
          try {
            const notificationRequest: EndedCallNotificationRequest = {
              channelName: channelInfo.channelId,
              callType: mapCallTypeToApiType(callType),
              requestUserId: session.user.id,
              partnerUserId: channelInfo.peerId,
              duration,
            };

            await callService.endedCallNotification?.(notificationRequest);
          } catch (error) {
            console.error('Failed to send ended call notification:', error);
          }
        }
      }

      // ナビゲーションガードを解除（iOS WebView のスワイプバック復元）
      deactivateNavigationGuard();
      pointConsumptionStartedRef.current = false;

      await onLeave(code);

      if (!routeBack.current) return;
      closeStopCallModal();
      routeBack.current = false;
      if (callDurationSecRef.current) {
        if (!sessionStorage.getItem(callEndedInfoKey)) {
          const callEndedInfo: CallEndedInfo = {
            type: 'withChatButton',
            message: callView.endedCallByManMessage,
            partnerId: channelInfo.peerId!,
            callDurationSec: callDurationSecRef.current,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
        }
      } else {
        if (
          callView.type === 'videoCallFromOutgoing' ||
          callView.type === 'voiceCall' ||
          callView.type === 'videoChatFromOutgoing'
        ) {
          const callEndedInfo: CallEndedInfo = {
            type: 'withChatButton',
            message: '発信をキャンセルしました',
            partnerId: channelInfo.peerId!,
            callDurationSec: 0,
            callType: callView.type,
          };
          sessionStorage.setItem(
            callEndedInfoKey,
            JSON.stringify(callEndedInfo),
          );
        }
      }
      // 画面遷移は各コンポーネントのcallEventKeys.callEndリスナーで行う
      callEventEmitter.emit(callEventKeys.callEnd);
    },
    callType === 'voiceCall' ? null : switchCamera,
    changeMicState,
    isMicMutedRef.current,
    isPartnerMicMuted,
    isRemoteVideoReceived,
  ] as const;
};

const intitialRtc: RTC = {
  remoteAudioTrack: null,
  remoteVideoTrack: null,
  localAudioTrack: null,
  localVideoTrack: null,
  client: null,
};

type RTC = {
  readonly remoteAudioTrack: IRemoteAudioTrack | null;
  readonly remoteVideoTrack: IRemoteVideoTrack | null;
  readonly localAudioTrack: ILocalAudioTrack | null;
  readonly localVideoTrack: ILocalVideoTrack | null;
  readonly client: IAgoraRTCClient | null;
};
