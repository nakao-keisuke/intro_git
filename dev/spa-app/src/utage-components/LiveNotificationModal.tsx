import { IconPlayerPlay, IconX } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
// Image component removed (use <img> directly);
import { usePathname, useSearchParams } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
// TODO: i18n - import { useTranslations } from '#/i18n';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactModal from 'react-modal';
import StreamPointShortageModal from '@/components/purchase/StreamPointShortageModal';
import { isNativeApplication } from '@/constants/applicationId';
import { event } from '@/constants/ga4Event';
import { MIN_POINT_FOR_VIDEO_CHAT_VIEWING } from '@/constants/pricing';
import { useMyPoint } from '@/hooks/usePollingData';
import { useUIStore } from '@/stores/uiStore';
import { trackEvent } from '@/utils/eventTracker';
import {
  getBuzzLiveRecordingUrl,
  getLiveRecordingUrl,
  imageUrl,
} from '@/utils/image';
import { region } from '@/utils/region';
import { sendMessageToWebView } from '@/utils/webview';

const lovensePic = '/lovense_pink.webp';
const pointIcon = '/g_point.webp';
const EXCLUDED_PATHS = ['/profile/live-broadcaster', '/purchase'] as const;

function LiveNotificationModalInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const session = useSession();
  const token = session.data?.user.token || '';
  const t = useTranslations('liveNotification');

  const notification = useUIStore((s) => s.liveNotificationModalData);
  const closeLiveNotificationModal = useUIStore(
    (s) => s.closeLiveNotificationModal,
  );
  const isOpen = notification !== null;

  // バイブレーション制御用 refs
  const vibrationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const callEndedSentRef = useRef(false);

  // バイブレーション停止関数
  const stopVibration = useCallback(() => {
    if (isNativeApplication()) {
      // Native アプリ: CALL_ENDED を送信して振動停止（重複防止）
      if (!callEndedSentRef.current) {
        callEndedSentRef.current = true;
        sendMessageToWebView({ type: 'CALL_ENDED' });
      }
    } else {
      // ブラウザ: setInterval をクリアし、navigator.vibrate(0) で停止
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }
  }, []);

  const broadcaster = notification?.broadcaster ?? undefined;
  const channelInfo = notification?.channelInfo ?? undefined;
  // Android と同じ優先順位: recording_id (現在配信中) → buzz_live_recording_id (過去配信)
  const recordingId = channelInfo?.recordingId;
  const buzzLiveRecordingId = broadcaster?.buzzLiveRecordingId;
  const isCurrentRecording = !!recordingId;
  const effectiveRecordingId = recordingId || buzzLiveRecordingId;

  // 入室フロー制御
  const myPointData = useMyPoint();
  const myPoint: number | undefined = myPointData?.data?.point;
  const [isJoining, setIsJoining] = useState(false);
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);

  // 映像状態
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const QuickJoinHandler = useMemo(
    () =>
      dynamic(
        () =>
          import(
            '@/app/[locale]/(tab-layout)/girls/all/components/QuickJoinHandler'
          ).then((mod) => mod.QuickJoinHandler),
        { ssr: false },
      ),
    [],
  );

  const handleClose = () => {
    stopVibration();
    closeLiveNotificationModal();
  };

  const [quickJoinData, setQuickJoinData] = useState<{
    broadcaster: NonNullable<typeof broadcaster>;
    channelInfo: NonNullable<typeof channelInfo>;
  } | null>(null);

  const handleJoinClick = useCallback(() => {
    if (!broadcaster || !channelInfo) return;
    trackEvent(event.TAP_JOIN_VIDEO_CHAT_FROM_BOOKMARK_MODAL, {
      broadcaster_id: broadcaster.userId,
    });
    if (myPoint !== undefined && myPoint < MIN_POINT_FOR_VIDEO_CHAT_VIEWING) {
      setNotEnoughPointModalOpen(true);
      return;
    }
    stopVibration();
    setQuickJoinData({ broadcaster, channelInfo });
    setIsJoining(true);
    closeLiveNotificationModal();
  }, [
    broadcaster,
    channelInfo,
    myPoint,
    closeLiveNotificationModal,
    stopVibration,
  ]);

  // ===== バイブレーション =====
  useEffect(() => {
    if (!isOpen) return;

    // ref をリセット
    callEndedSentRef.current = false;

    if (isNativeApplication()) {
      // Native アプリ (72, 76, 83, 84, 85): Native に委譲
      sendMessageToWebView({ type: 'INCOMING_CALL_VIBRATE' });
    } else {
      // Utage ブラウザ/PWA: navigator.vibrate (Android のみ動作、iOS は無視される)
      // 注意: Chrome ではユーザージェスチャー後でないと振動しない場合がある
      // モーダルは自動表示のため、初回表示時は振動しない可能性があるが、
      // ユーザーがページ操作後に表示された場合は振動する
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        // 振動パターン: 1000ms振動 → 500ms停止 → 1000ms振動 → 1500ms停止
        const pattern = [1000, 500, 1000, 1500];
        navigator.vibrate(pattern);
        // パターン1回分の長さ後に繰り返し
        const duration = pattern.reduce((a, b) => a + b, 0); // 4000ms
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate(pattern);
        }, duration);
      }
    }

    // cleanup: コンポーネントアンマウントや isOpen が false になった場合の安全策
    return () => {
      stopVibration();
    };
  }, [isOpen, stopVibration]);

  // ===== 映像リソースクリーンアップ =====
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, []);

  // ===== 映像状態リセット（通知が変わるたびに） =====
  // biome-ignore lint/correctness/useExhaustiveDependencies: effectiveRecordingIdの変化に応じて映像状態をリセットする意図的な依存
  useEffect(() => {
    setIsVideoLoaded(false);
    setIsBuffering(false);
    setVideoFailed(false);
  }, [effectiveRecordingId]);

  // 除外ページ判定
  const isEmbedded = useMemo(
    () => searchParams?.get('embedded') === 'true',
    [searchParams],
  );
  const shouldHideInEmbeddedMode =
    pathname?.startsWith('/profile/unbroadcaster') && isEmbedded;
  const shouldHide = useMemo(
    () =>
      EXCLUDED_PATHS.some((path) => pathname?.startsWith(path)) ||
      shouldHideInEmbeddedMode,
    [pathname, shouldHideInEmbeddedMode],
  );
  if (shouldHide) return null;

  const showVideo = effectiveRecordingId && token && !videoFailed;

  return (
    <>
      {/* ===== フルスクリーン着信風オーバーレイ ===== */}
      <ReactModal
        isOpen={isOpen}
        onRequestClose={handleClose}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
        contentLabel="Live Notification"
        overlayClassName="fixed inset-0 z-[100000]"
        className="absolute inset-0 flex h-dvh w-dvw touch-none flex-col items-center overflow-hidden outline-none"
      >
        {/* --- 背景レイヤー --- */}
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
          {showVideo ? (
            <>
              {(!isVideoLoaded || isBuffering) && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}
              <video
                ref={videoRef}
                src={
                  isCurrentRecording
                    ? getLiveRecordingUrl(effectiveRecordingId, token)
                    : getBuzzLiveRecordingUrl(effectiveRecordingId, token)
                }
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                  isVideoLoaded && !isBuffering ? 'opacity-100' : 'opacity-0'
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                onCanPlayThrough={() => {
                  setIsVideoLoaded(true);
                }}
                onWaiting={() => {
                  setIsBuffering(true);
                }}
                onPlaying={() => {
                  setIsBuffering(false);
                }}
                onCanPlay={() => {
                  setIsBuffering(false);
                }}
                onError={() => {
                  setVideoFailed(true);
                }}
              />
            </>
          ) : (
            broadcaster?.avaId && (
              <Image
                src={imageUrl(broadcaster.avaId)}
                alt={t('backgroundImageAlt')}
                fill
                className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover blur-[3px] brightness-[0.6]"
                priority
              />
            )
          )}
          {/* 暗めオーバーレイ（映像の上に情報を読みやすくする） */}
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* --- 右上: ポイント表示 --- */}
        {myPoint !== undefined && (
          <div className="absolute top-6 right-4 z-[2] flex h-11 min-w-[100px] items-center rounded-[10px] bg-white/95 pr-4 pl-2 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <Image
              src={pointIcon}
              alt={t('coinIconAlt')}
              className="mr-2 block h-8 w-8"
              width={32}
              height={32}
            />
            <span className="font-bold text-[#444] text-xl leading-none tracking-[1px]">
              {myPoint.toLocaleString()}
            </span>
          </div>
        )}

        {/* --- 上部テキスト --- */}
        <div className="absolute top-[100px] z-[2] flex w-full flex-col items-center">
          <p className="text-center text-white text-lg drop-shadow-lg">
            {t('favoriteBroadcasting', { name: broadcaster?.userName ?? '' })}
          </p>
          <div className="mt-2 flex items-center gap-1 rounded bg-red-500 px-3 py-1 font-bold text-white text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            {t('broadcasting')}
          </div>
        </div>

        {/* --- 下部エリア: アバター + 配信者情報 + ボタン --- */}
        <div className="absolute bottom-0 z-[2] flex w-full flex-col items-center pb-6">
          {/* アバター */}
          <div className="relative mb-2">
            {broadcaster?.hasLovense && (
              <div className="absolute -top-1 -left-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
                <Image src={lovensePic} alt="Lovense" width={24} height={24} />
              </div>
            )}
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-md">
              <Image
                src={imageUrl(broadcaster?.avaId || '')}
                alt={broadcaster?.userName || ''}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* 配信者情報 */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-white">
            <span className="font-bold text-lg tracking-wide">
              {broadcaster?.userName}
            </span>
            {broadcaster?.age && (
              <span className="font-semibold">
                {t('ageSuffix', { age: broadcaster.age })}
              </span>
            )}
            {broadcaster?.region !== undefined && (
              <span className="font-semibold">
                {region(broadcaster.region)}
              </span>
            )}
            {broadcaster?.bustSize && broadcaster.bustSize !== '未設定' && (
              <span className="font-semibold">{broadcaster.bustSize}</span>
            )}
          </div>

          {/* ボタンエリア */}
          <div className="mb-4 flex items-center justify-center gap-[80px]">
            {/* 閉じるボタン（赤） */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-full bg-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.13)] transition duration-150 hover:brightness-95"
                onClick={handleClose}
              >
                <IconX size={32} className="text-white" />
              </div>
              <span className="font-medium text-white text-sm">
                {t('close')}
              </span>
            </div>
            {/* 配信を見にいくボタン（緑・再生アイコン） */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-[72px] w-[72px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#5010d2] via-[#ef3275] to-[#ffd480] shadow-[0_2px_8px_rgba(0,0,0,0.13)] transition duration-150 hover:brightness-95"
                onClick={handleJoinClick}
              >
                <IconPlayerPlay size={36} className="text-white" fill="white" />
              </div>
              <span className="font-medium text-white text-sm">
                {t('watch')}
              </span>
            </div>
          </div>
        </div>
      </ReactModal>

      {/* 直接入室ハンドラ */}
      {isJoining && quickJoinData && (
        <QuickJoinHandler
          broadcaster={quickJoinData.broadcaster}
          channelInfo={quickJoinData.channelInfo}
          onClose={() => setIsJoining(false)}
        />
      )}

      {/* ポイント不足モーダル */}
      {notEnoughPointModalOpen && broadcaster && channelInfo && (
        <StreamPointShortageModal
          onClose={() => setNotEnoughPointModalOpen(false)}
          onPurchaseAndWatch={() => {
            setNotEnoughPointModalOpen(false);
            stopVibration();
            if (broadcaster && channelInfo) {
              setQuickJoinData({ broadcaster, channelInfo });
              setIsJoining(true);
              closeLiveNotificationModal();
            }
          }}
          userName={broadcaster.userName}
          avatarId={broadcaster.avaId}
          thumbnailImageId={channelInfo.thumbnailImageId || undefined}
          viewerCount={
            channelInfo.userCount
              ? Math.max(0, channelInfo.userCount - 1)
              : undefined
          }
          age={broadcaster.age}
          region={broadcaster.region}
          bustSize={broadcaster.bustSize}
          hasLovense={broadcaster.hasLovense}
        />
      )}
    </>
  );
}

export function LiveNotificationModal() {
  return (
    <Suspense fallback={null}>
      <LiveNotificationModalInner />
    </Suspense>
  );
}
