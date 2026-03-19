import type {
  IAgoraRTCClient,
  RemoteAudioTrackStats,
  RemoteVideoTrackStats,
} from 'agora-rtc-sdk-ng';
import { useCallback, useRef } from 'react';
import { CALL_ERROR_CATEGORY } from '@/types/callErrorCategory';
import type { CallType } from '@/utils/callView';
import { addCallBreadcrumb } from '@/utils/sentry/callBreadcrumbs';
import { captureCallWarning } from '@/utils/sentry/captureCallError';

/** stats ポーリング間隔（ミリ秒） */
const STATS_POLLING_INTERVAL_MS = 5000;
/** タイムアウト判定を行うポーリング回数（2回 = 10s） */
const STATS_STARTUP_POLL_COUNT = 2;

interface VideoStatsPollingCallbacks {
  /** 初回確認時（ポイント消費開始）に呼ぶ */
  onConfirmed: () => void;
  /** 2回目（10s）で未確認の場合に呼ぶ */
  onTimeout: () => void;
  /** 確認済み後に stats が取得できなくなった場合に呼ぶ（Sentry 記録） */
  onQualityDegraded: () => void;
}

interface AudioStatsPollingCallbacks {
  onConfirmed: () => void;
  onTimeout: () => void;
  onQualityDegraded: () => void;
}

interface UseAgoraStatsPollingOptions {
  getClient: () => IAgoraRTCClient | null | undefined;
  callType: CallType;
  partnerId: string;
}

/**
 * Agora RTC の stats ポーリングロジックを担うカスタムフック。
 *
 * useAgoraRTC.hook.ts から切り出し、以下を管理する:
 * - 映像 stats ポーリング: getRemoteVideoStats() で decodeFrameRate/renderFrameRate を確認
 * - 音声 stats ポーリング: getRemoteAudioStats() で receiveBitrate/receiveLevel を確認
 *
 * フェーズ:
 * 1. スタートアップ（0〜10s）: 5s・10s の2回で確認 → onConfirmed / onTimeout
 * 2. モニタリング（確認済み後）: 5s間隔で継続 → 品質劣化時に onQualityDegraded
 *
 * 使い方:
 * - play() 後に startVideoStatsPolling / startAudioStatsPolling を呼ぶ
 * - first-frame-decoded 発火時に markVideoConfirmed / markAudioConfirmed を呼ぶ
 * - onLeave / useEffect cleanup で cleanup() を呼ぶ（ポーリングは通話終了まで継続）
 */
export const useAgoraStatsPolling = ({
  getClient,
  callType,
  partnerId,
}: UseAgoraStatsPollingOptions) => {
  const videoStatsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioStatsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoConfirmedRef = useRef(false);
  const audioConfirmedRef = useRef(false);
  const videoPollCountRef = useRef(0);
  const audioPollCountRef = useRef(0);

  const stopVideoStatsPolling = useCallback(() => {
    if (videoStatsIntervalRef.current) {
      clearInterval(videoStatsIntervalRef.current);
      videoStatsIntervalRef.current = null;
    }
  }, []);

  const stopAudioStatsPolling = useCallback(() => {
    if (audioStatsIntervalRef.current) {
      clearInterval(audioStatsIntervalRef.current);
      audioStatsIntervalRef.current = null;
    }
  }, []);

  /**
   * 映像の確認済み状態を外部からマークする（first-frame-decoded 発火時に呼ぶ）。
   * 以降のポーリングはモニタリングモードに切り替わる。
   */
  const markVideoConfirmed = useCallback(() => {
    videoConfirmedRef.current = true;
  }, []);

  /**
   * 音声の確認済み状態を外部からマークする（first-frame-decoded 発火時に呼ぶ）。
   */
  const markAudioConfirmed = useCallback(() => {
    audioConfirmedRef.current = true;
  }, []);

  /**
   * 映像 stats ポーリングを開始する（通話終了まで継続）。
   *
   * - 5s・10s で decodeFrameRate/renderFrameRate を確認 → onConfirmed
   * - 10s 時点で未確認 → onTimeout（isPlaying確認→リトライ→切断判定）
   * - 確認済み後に stats が取れなくなったら → onQualityDegraded（Sentry 記録）
   *
   * @param uid - リモートユーザーのUID
   * @param callbacks - onConfirmed / onTimeout / onQualityDegraded
   */
  const startVideoStatsPolling = useCallback(
    (uid: number | string, callbacks: VideoStatsPollingCallbacks) => {
      if (videoStatsIntervalRef.current) return; // 既に実行中
      videoConfirmedRef.current = false;
      videoPollCountRef.current = 0;

      videoStatsIntervalRef.current = setInterval(() => {
        videoPollCountRef.current += 1;
        const client = getClient();
        if (!client) {
          addCallBreadcrumb(
            'Client not available for video stats',
            'media',
            { uid },
            'warning',
          );
          return;
        }
        const statsMap = client.getRemoteVideoStats();
        const stats: RemoteVideoTrackStats | undefined =
          statsMap?.[String(uid)];
        const hasMedia =
          !!stats &&
          ((stats.decodeFrameRate ?? 0) > 0 ||
            (stats.renderFrameRate ?? 0) > 0);

        if (!videoConfirmedRef.current) {
          // スタートアップフェーズ
          if (hasMedia) {
            videoConfirmedRef.current = true;
            addCallBreadcrumb(
              'Video receiving confirmed via stats',
              'media',
              {
                decodeFrameRate: stats.decodeFrameRate,
                renderFrameRate: stats.renderFrameRate,
                pollCount: videoPollCountRef.current,
              },
              'info',
            );
            callbacks.onConfirmed();
          } else if (videoPollCountRef.current >= STATS_STARTUP_POLL_COUNT) {
            addCallBreadcrumb(
              'Video stats startup timeout',
              'media',
              {
                decodeFrameRate: stats?.decodeFrameRate,
                renderFrameRate: stats?.renderFrameRate,
                pollCount: videoPollCountRef.current,
              },
              'warning',
            );
            captureCallWarning(
              'Video stats not confirmed within startup window',
              CALL_ERROR_CATEGORY.VIDEO_STATS_TIMEOUT,
              { callType, partnerId },
            );
            callbacks.onTimeout();
          }
        } else {
          // モニタリングフェーズ（確認済み後）
          if (!hasMedia) {
            addCallBreadcrumb(
              'Video quality degraded after confirmation',
              'media',
              {
                decodeFrameRate: stats?.decodeFrameRate,
                renderFrameRate: stats?.renderFrameRate,
                pollCount: videoPollCountRef.current,
              },
              'warning',
            );
            callbacks.onQualityDegraded();
          }
        }
      }, STATS_POLLING_INTERVAL_MS);
    },
    [callType, getClient, partnerId],
  );

  /**
   * 音声 stats ポーリングを開始する（通話終了まで継続）。
   * 全通話タイプで使用。voiceCall は切断判定も行う。videoCall・videoChat は品質監視のみ。
   *
   * @param uid - リモートユーザーのUID
   * @param callbacks - onConfirmed / onTimeout / onQualityDegraded
   */
  const startAudioStatsPolling = useCallback(
    (uid: number | string, callbacks: AudioStatsPollingCallbacks) => {
      if (audioStatsIntervalRef.current) return; // 既に実行中
      audioConfirmedRef.current = false;
      audioPollCountRef.current = 0;

      audioStatsIntervalRef.current = setInterval(() => {
        audioPollCountRef.current += 1;
        const client = getClient();
        if (!client) {
          addCallBreadcrumb(
            'Client not available for audio stats',
            'media',
            { uid },
            'warning',
          );
          return;
        }
        const statsMap = client.getRemoteAudioStats();
        const stats: RemoteAudioTrackStats | undefined =
          statsMap?.[String(uid)];
        const hasMedia =
          !!stats && (stats.receiveBitrate > 0 || stats.receiveLevel > 0);

        if (!audioConfirmedRef.current) {
          // スタートアップフェーズ
          if (hasMedia) {
            audioConfirmedRef.current = true;
            addCallBreadcrumb(
              'Audio receiving confirmed via stats',
              'media',
              {
                receiveBitrate: stats.receiveBitrate,
                receiveLevel: stats.receiveLevel,
                pollCount: audioPollCountRef.current,
              },
              'info',
            );
            callbacks.onConfirmed();
          } else if (audioPollCountRef.current >= STATS_STARTUP_POLL_COUNT) {
            addCallBreadcrumb(
              'Audio stats startup timeout',
              'media',
              {
                receiveBitrate: stats?.receiveBitrate,
                receiveLevel: stats?.receiveLevel,
                pollCount: audioPollCountRef.current,
              },
              'warning',
            );
            captureCallWarning(
              'Audio stats not confirmed within startup window',
              CALL_ERROR_CATEGORY.AUDIO_STATS_TIMEOUT,
              { callType, partnerId },
            );
            callbacks.onTimeout();
          }
        } else {
          // モニタリングフェーズ（確認済み後）
          if (!hasMedia) {
            addCallBreadcrumb(
              'Audio quality degraded after confirmation',
              'media',
              {
                receiveBitrate: stats?.receiveBitrate,
                receiveLevel: stats?.receiveLevel,
                pollCount: audioPollCountRef.current,
              },
              'warning',
            );
            callbacks.onQualityDegraded();
          }
        }
      }, STATS_POLLING_INTERVAL_MS);
    },
    [callType, getClient, partnerId],
  );

  /** 映像・音声ポーリングを両方停止する（通話終了時に呼ぶ） */
  const cleanup = useCallback(() => {
    stopVideoStatsPolling();
    stopAudioStatsPolling();
    videoConfirmedRef.current = false;
    audioConfirmedRef.current = false;
    videoPollCountRef.current = 0;
    audioPollCountRef.current = 0;
  }, [stopVideoStatsPolling, stopAudioStatsPolling]);

  return {
    startVideoStatsPolling,
    startAudioStatsPolling,
    markVideoConfirmed,
    markAudioConfirmed,
    cleanup,
  };
};
