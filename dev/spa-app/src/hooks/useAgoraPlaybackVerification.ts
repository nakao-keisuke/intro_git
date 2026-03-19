import AgoraRTC, {
  type IRemoteAudioTrack,
  type IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';
import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { CALL_ERROR_CATEGORY } from '@/types/callErrorCategory';
import type { CallType } from '@/utils/callView';
import { addCallBreadcrumb } from '@/utils/sentry/callBreadcrumbs';
import {
  captureCallError,
  captureCallWarning,
} from '@/utils/sentry/captureCallError';

/** ユーザーがautoplayブロックUIをタップするまでの待機時間 (ms) */
const USER_INTERACTION_TIMEOUT_MS = 10_000;
/** isPlaying確認までの待機時間 (ms) */
const PLAYBACK_CHECK_DELAY_MS = 2000;

interface UseAgoraPlaybackVerificationOptions {
  callType: CallType;
  partnerId: string;
  onLeave: (code?: number) => Promise<void>;
}

/**
 * Agora RTC の再生確認・リトライロジックを担うカスタムフック。
 *
 * useAgoraRTC.hook.ts から切り出し、以下を管理する:
 * - autoplay ブロッキング: AgoraRTC.onAutoplayFailed ハンドラの設定・解除
 * - 強制切断判定: stats タイムアウト（10s）時に isPlaying / DOM 可視性を確認し、
 *   必要に応じてリトライまたは onLeave を呼ぶ
 *
 * Step 0: user-published → subscribe → play() (useAgoraRTC.hook.ts 側)
 * Step 1: stats タイムアウト（10s）で checkForceDisconnectVideo / checkForceDisconnectAudio 呼び出し
 * Step 2: isPlaying=false の原因別分岐 (autoplay / DOM可視性)
 * Step 3: 1回だけ unsubscribe → subscribe → play リトライ → 失敗なら onLeave
 */
export const useAgoraPlaybackVerification = ({
  callType,
  partnerId,
  onLeave,
}: UseAgoraPlaybackVerificationOptions) => {
  /** autoplay-failed が発火済みかどうかのフラグ */
  const autoplayFailedRef = useRef(false);
  /** ユーザー操作待機タイムアウトのID */
  const userInteractionTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  /**
   * AgoraRTC.onAutoplayFailed を設定する。
   * autoplay がブロックされた場合にトーストを表示し、ユーザーのタップで再生再開を試みる。
   * 10秒以内にタップがなければ onLeave() を呼んで通話切断する。
   *
   * @param getVideoTrack - 現在の remoteVideoTrack を返すゲッター
   * @param getAudioTrack - 現在の remoteAudioTrack を返すゲッター
   */
  const setupAutoplayHandler = useCallback(
    (
      getVideoTrack: () => IRemoteVideoTrack | null | undefined,
      getAudioTrack: () => IRemoteAudioTrack | null | undefined,
    ) => {
      AgoraRTC.onAutoplayFailed = async () => {
        autoplayFailedRef.current = true;

        addCallBreadcrumb(
          'Autoplay blocked by browser policy',
          'media',
          { callType, partnerId },
          'warning',
        );
        captureCallWarning(
          'Autoplay blocked by browser policy',
          CALL_ERROR_CATEGORY.AUDIO_AUTOPLAY_BLOCKED,
          { callType, partnerId },
        );

        toast.warn(
          '音声・映像が再生できませんでした。画面をタップして再生を開始してください。',
          {
            toastId: 'autoplay-blocked',
            autoClose: false,
            closeButton: false,
          },
        );

        const handleUserInteraction = async () => {
          if (userInteractionTimeoutRef.current) {
            clearTimeout(userInteractionTimeoutRef.current);
            userInteractionTimeoutRef.current = null;
          }
          // once: true のため手動削除は不要
          toast.dismiss('autoplay-blocked');

          try {
            // WKWebView では明示的な resumeAudioContext() が必要
            await AgoraRTC.resumeAudioContext();
            const videoTrack = getVideoTrack();
            const audioTrack = getAudioTrack();
            if (videoTrack) {
              await videoTrack.play('remote_video');
            }
            if (audioTrack) {
              await audioTrack.play();
            }
            autoplayFailedRef.current = false;
            addCallBreadcrumb(
              'Autoplay resumed after user interaction',
              'media',
              { callType, partnerId },
              'info',
            );
          } catch (error) {
            addCallBreadcrumb(
              'Failed to resume playback after user interaction',
              'media',
              { callType, partnerId, error: String(error) },
              'error',
            );
            captureCallError(
              error instanceof Error ? error : new Error(String(error)),
              CALL_ERROR_CATEGORY.AUDIO_PLAY_FAILURE,
              { callType, partnerId },
            );
          }
        };

        document.addEventListener('click', handleUserInteraction, {
          once: true,
        });
        document.addEventListener('touchstart', handleUserInteraction, {
          once: true,
        });

        // 10秒以内にタップがなければ切断
        userInteractionTimeoutRef.current = setTimeout(async () => {
          // once: true のため手動削除は不要
          toast.dismiss('autoplay-blocked');
          addCallBreadcrumb(
            'Autoplay user interaction timeout',
            'media',
            { callType, partnerId, timeoutMs: USER_INTERACTION_TIMEOUT_MS },
            'warning',
          );
          await onLeave();
        }, USER_INTERACTION_TIMEOUT_MS);
      };
    },
    [callType, partnerId, onLeave],
  );

  /**
   * stats タイムアウト（10s）時に映像の isPlaying と DOM 可視性を確認し、
   * 必要に応じてリトライまたは onLeave を呼ぶ。
   *
   * - autoplay ブロック中: autoplay ハンドラに委ねる（何もしない）
   * - isPlaying=true: 再生中なのに stats 未確認は異常（ログのみ・継続）
   * - DOM 非表示（ビューポート外）: 継続
   * - その他: toast エラー表示 → 1回リトライ → 失敗なら onLeave(998)
   *
   * @param track - play() 済みの RemoteVideoTrack
   * @param retrySubscribe - unsubscribe → subscribe → play を行うコールバック（1回のみ呼ばれる）
   * @param uid - リモートユーザーのUID（ログ用）
   */
  const checkForceDisconnectVideo = useCallback(
    async (
      track: IRemoteVideoTrack,
      retrySubscribe: () => Promise<void>,
      uid: number | string,
    ) => {
      // autoplay ハンドラが対処中の場合はスキップ
      if (autoplayFailedRef.current) {
        addCallBreadcrumb(
          'Video force disconnect skipped: autoplay handler active',
          'media',
          { uid, callType },
          'info',
        );
        return;
      }

      await new Promise<void>((resolve) =>
        setTimeout(resolve, PLAYBACK_CHECK_DELAY_MS),
      );

      if (track.isPlaying) {
        // 再生中なのに stats 未確認は異常状態（切断せず Sentry 記録のみ）
        captureCallWarning(
          'Video isPlaying true but stats not confirmed at timeout',
          CALL_ERROR_CATEGORY.VIDEO_STATS_TIMEOUT,
          { callType, partnerId, uid },
        );
        return;
      }

      addCallBreadcrumb(
        'Video not playing at stats timeout',
        'media',
        { uid, callType },
        'warning',
      );
      captureCallWarning(
        'Video not playing at stats startup timeout',
        CALL_ERROR_CATEGORY.PLAY_NOT_CALLED_VIDEO,
        { callType, partnerId, mediaType: 'video', uid },
      );

      // DOM可視性チェック（スクロールによるビューポート外は無害）
      const visibleStatus = track.getVideoElementVisibleStatus?.();
      if (
        visibleStatus &&
        !visibleStatus.visible &&
        visibleStatus.reason === 'POSITION'
      ) {
        addCallBreadcrumb(
          'Video not in viewport at timeout, skipping disconnect',
          'media',
          { uid, callType },
          'info',
        );
        return;
      }

      // toast エラー表示 → リトライ → 失敗なら切断
      toast.error('映像が受信できませんでした。再接続を試みます。', {
        toastId: 'video-stats-timeout',
        autoClose: 3000,
      });
      addCallBreadcrumb(
        'Video force disconnect retry attempt',
        'media',
        {
          uid,
          callType,
          visibleStatusReason:
            visibleStatus && !visibleStatus.visible
              ? visibleStatus.reason
              : 'unknown',
        },
        'warning',
      );
      try {
        await retrySubscribe();
      } catch (retryError) {
        toast.dismiss('video-stats-timeout');
        toast.error('映像が受信できないため通話を終了します。');
        addCallBreadcrumb(
          'Video force disconnect retry failed',
          'media',
          { uid, callType, error: String(retryError) },
          'error',
        );
        captureCallError(
          retryError instanceof Error
            ? retryError
            : new Error(String(retryError)),
          CALL_ERROR_CATEGORY.VIDEO_PLAY_FAILURE,
          { callType, partnerId, mediaType: 'video', uid },
        );
        await onLeave(998);
      }
    },
    [callType, partnerId, onLeave],
  );

  /**
   * stats タイムアウト（10s）時に音声の isPlaying を確認し、
   * 必要に応じてリトライまたは onLeave を呼ぶ。
   *
   * - autoplay ブロック中: autoplay ハンドラに委ねる（何もしない）
   * - isPlaying=true: ログのみ・継続
   * - その他: toast エラー表示 → 1回リトライ → 失敗なら onLeave(999)
   *
   * @param track - play() 済みの RemoteAudioTrack
   * @param retrySubscribe - unsubscribe → subscribe → play を行うコールバック（1回のみ呼ばれる）
   * @param uid - リモートユーザーのUID（ログ用）
   */
  const checkForceDisconnectAudio = useCallback(
    async (
      track: IRemoteAudioTrack,
      retrySubscribe: () => Promise<void>,
      uid: number | string,
    ) => {
      // autoplay ハンドラが対処中の場合はスキップ
      if (autoplayFailedRef.current) {
        addCallBreadcrumb(
          'Audio force disconnect skipped: autoplay handler active',
          'media',
          { uid, callType },
          'info',
        );
        return;
      }

      await new Promise<void>((resolve) =>
        setTimeout(resolve, PLAYBACK_CHECK_DELAY_MS),
      );

      if (track.isPlaying) {
        captureCallWarning(
          'Audio isPlaying true but stats not confirmed at timeout',
          CALL_ERROR_CATEGORY.AUDIO_STATS_TIMEOUT,
          { callType, partnerId, uid },
        );
        return;
      }

      addCallBreadcrumb(
        'Audio not playing at stats timeout',
        'media',
        { uid, callType },
        'warning',
      );
      captureCallWarning(
        'Audio not playing at stats startup timeout',
        CALL_ERROR_CATEGORY.PLAY_NOT_CALLED_AUDIO,
        { callType, partnerId, mediaType: 'audio', uid },
      );

      toast.error('音声が受信できませんでした。再接続を試みます。', {
        toastId: 'audio-stats-timeout',
        autoClose: 3000,
      });
      addCallBreadcrumb(
        'Audio force disconnect retry attempt',
        'media',
        { uid, callType },
        'warning',
      );
      try {
        await retrySubscribe();
      } catch (retryError) {
        toast.dismiss('audio-stats-timeout');
        toast.error('音声が受信できないため通話を終了します。');
        addCallBreadcrumb(
          'Audio force disconnect retry failed',
          'media',
          { uid, callType, error: String(retryError) },
          'error',
        );
        captureCallError(
          retryError instanceof Error
            ? retryError
            : new Error(String(retryError)),
          CALL_ERROR_CATEGORY.AUDIO_PLAY_FAILURE,
          { callType, partnerId, mediaType: 'audio', uid },
        );
        await onLeave(999);
      }
    },
    [callType, partnerId, onLeave],
  );

  /**
   * AgoraRTC.onAutoplayFailed ハンドラの解除と関連リソースのクリーンアップ。
   * useAgoraRTC.hook.ts の onLeave / useEffect cleanup で呼ぶこと。
   */
  const cleanupAutoplayHandler = useCallback(() => {
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
      userInteractionTimeoutRef.current = null;
    }
    autoplayFailedRef.current = false;
    // Agora SDKの型定義が undefined を許容しないため型キャストで解除（null より undefined が確実）
    (AgoraRTC as any).onAutoplayFailed = undefined;
    toast.dismiss('autoplay-blocked');
  }, []);

  return {
    setupAutoplayHandler,
    checkForceDisconnectVideo,
    checkForceDisconnectAudio,
    cleanupAutoplayHandler,
  };
};
