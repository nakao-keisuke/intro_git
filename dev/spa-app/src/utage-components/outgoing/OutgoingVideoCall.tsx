// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { DynamicVideoComponent } from '@/app/[locale]/profile/components/DynamicComponents';
import StopCallModal from '@/components/videocall/StopCallModal';
import { callEventKeys } from '@/constants/callEventKeys';
import { event } from '@/constants/ga4Event';
import { rtmMessageType } from '@/constants/RtmMessageType';
import { useAgoraRTM } from '@/hooks/useAgoraRTM.hook';
import callEventEmitter from '@/libs/callEventEmitter';
import { useCallStore } from '@/stores/callStore';
import { useUIStore } from '@/stores/uiStore';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import { beforeCall, inCall } from '@/utils/callState';
import { trackEvent } from '@/utils/eventTracker';
import { imageUrl } from '@/utils/image';
import LocalCameraPreview from './LocalCameraPreview';
import OutgoingCallPartnerProfile from './OutgoingCallPartnerProfile';

const swapPic = '/call/swap.webp';

type Props = {
  channelInfo: ChannelInfo;
  partnerInfo: PartnerInfo;
  isBookmarked: boolean;
};

const OutgoingVideoCall = ({
  channelInfo,
  partnerInfo,
  isBookmarked,
}: Props) => {
  const videoScreenRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const openStopCallModal = useUIStore((s) => s.openStopCallModal);
  const openNativePermissionModal = useUIStore(
    (s) => s.openNativePermissionModal,
  );
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 300); // 30秒で100%まで増やすには300msごとに1%増やす

    return () => clearInterval(interval); // クリーンアップ関数
  }, []);

  const callState = useCallStore((s) => s.callState);
  const _setCallState = useCallStore((s) => s.setCallState);
  const [volume, _setVolume] = useState(0.2); // 初期値の音量

  useEffect(() => {
    const showFullScreen = async () => {
      if (videoScreenRef.current?.requestFullscreen) {
        await videoScreenRef.current?.requestFullscreen();
        sessionStorage.setItem('isFullScreen', 'true');
      }
    };
    showFullScreen();
  }, []);

  // GA4イベント送信
  useEffect(() => {
    trackEvent(event.OUTGOING_VIDEO_CALL, {
      partner_id: channelInfo.peerId,
    });
  }, []);

  useEffect(() => {
    if (callState !== beforeCall) {
      return;
    }
    const ringtone = new Audio('/sound/call.mp3');

    ringtone.loop = true;

    ringtone.volume = volume;

    ringtone.play();

    return () => {
      if (callState !== beforeCall) {
        return;
      }
      ringtone.pause();
      ringtone.currentTime = 0; // 再生位置を初期位置にリセット
    };
  }, [callState, volume]);

  const [
    _onJoin,
    onSendMessageToPeer,
    onSendMessageToChannel,
    viewCount,
    onEnd,
  ] = useAgoraRTM(channelInfo, 'videoCallFromOutgoing');

  // カメラプレビューのgetUserMedia失敗時ハンドラ
  // Note: OutgoingCallPermissionGuard が事前に権限チェックするため NotAllowedError は通常到達しないが、
  // 権限チェック後にブラウザ設定で取り消された場合などのエッジケースに備えた二重防御
  const handleCameraError = useCallback(
    async (error: unknown) => {
      const isPermissionError =
        error instanceof DOMException && error.name === 'NotAllowedError';

      if (isPermissionError) {
        // 権限拒否 → 権限モーダルを表示
        openNativePermissionModal(['camera', 'microphone']);
      } else {
        // デバイスエラー等 → toast で通知
        toast.error(
          'カメラを起動できませんでした。時間をおいてもう一度お試しください。',
        );
      }

      // 通話を終了して前の画面に戻す
      await onEnd?.();
      callEventEmitter.emit(callEventKeys.callEnd);
    },
    [onEnd, openNativePermissionModal],
  );

  // カメラ切替関数
  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // 通話終了時の画面遷移処理（callEventEmitter経由で処理）
  useEffect(() => {
    const handleCallEnd = () => {
      // fromパラメータから戻り先を取得
      const searchParams = new URLSearchParams(window.location.search);
      const fromPath = searchParams.get('from') || '/girls/all';

      // 埋め込みモードから開始された通話の場合
      const fromEmbedded = sessionStorage.getItem('callStartedFromEmbedded');
      sessionStorage.removeItem('callStartedFromEmbedded');

      if (
        fromEmbedded === 'true' &&
        typeof window !== 'undefined' &&
        window.parent !== window
      ) {
        // replaceを使用して履歴に残さない（戻るボタンで通話ページに戻らないようにする）
        window.parent.location.replace(fromPath);
      } else {
        router.replace(fromPath);
      }
    };

    callEventEmitter.on(callEventKeys.callEnd, handleCallEnd);

    return () => {
      callEventEmitter.off(callEventKeys.callEnd, handleCallEnd);
    };
  }, [router]);

  const showOutgoingUI = callState === beforeCall;

  return (
    <div
      className="prevent-pull-to-refresh fixed inset-0 z-[1] flex h-screen w-screen touch-none flex-col items-center justify-start overflow-hidden"
      ref={videoScreenRef}
    >
      {/* 最背面: 背景画像（アバター）と暗いオーバーレイ */}
      {showOutgoingUI && partnerInfo.avatarId && (
        <div className="pointer-events-none absolute inset-0 z-0 h-screen w-screen">
          <Image
            src={imageUrl(partnerInfo.avatarId)}
            alt="背景画像"
            fill
            className="pointer-events-none absolute inset-0 z-0 h-screen w-screen object-cover blur-[3px] brightness-[0.6]"
            priority
          />
        </div>
      )}

      {/* 左上の小窓: 自分の映像（発信中） */}
      {showOutgoingUI && (
        <LocalCameraPreview
          facingMode={facingMode}
          className="absolute top-[80px] left-[15px] z-[1002] h-[160px] w-[100px] overflow-hidden rounded-lg object-cover"
          onError={handleCameraError}
        />
      )}

      {/* 中央エリア: 発信中テキスト・プロフィール情報 */}
      {showOutgoingUI && (
        <div className="z-[2] flex w-screen shrink-0 flex-col items-center justify-center">
          <div className="mt-10 mb-[18px] text-center font-bold text-[1.25rem] text-white tracking-[0.12em] max-[320px]:mt-6 max-[320px]:text-[1.1rem] max-[768px]:text-[1.2rem]">
            ビデオ通話　発信中...
          </div>

          {/* パートナープロフィール */}
          <OutgoingCallPartnerProfile partnerInfo={partnerInfo} />

          {/* プログレスバー */}
          <div className="mt-10 flex justify-center">
            <div
              className="progress-container"
              style={{
                width: '50vw',
                maxWidth: '200px',
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: '30px',
              }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                  height: '10px',
                  backgroundColor: '#4cc2e6',
                  borderRadius: '30px 0 0 30px',
                }}
              ></div>
            </div>
          </div>

          <div className="mt-3 text-center text-sm text-white/80">
            相手の応答を待っています...
          </div>
        </div>
      )}

      {/* 下部エリア: カメラ切り替えボタンと停止ボタン */}
      {showOutgoingUI && (
        <div className="relative z-[2] mt-auto mb-[60px] flex w-screen flex-col items-center">
          {/* 停止ボタン（中央） */}
          <button
            type="button"
            id="leave"
            onClick={() => {
              openStopCallModal();
            }}
            style={{
              backgroundImage: `url(/call/stop_call_btn.webp)`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 100%',
              backgroundColor: 'transparent',
              width: '70px',
              height: '70px',
              cursor: 'pointer',
              border: 'none',
              display: 'block',
            }}
          >
            &nbsp;
          </button>

          {/* カメラ切り替えボタン（右寄り） */}
          <div className="absolute bottom-0 left-[60px] flex flex-col items-center">
            <button
              type="button"
              onClick={switchCamera}
              className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-none bg-black/30"
            >
              <Image src={swapPic} alt="カメラ切替" width={30} height={30} />
            </button>
            <span className="mt-[2px] text-[10px] text-white">カメラ切替</span>
          </div>
        </div>
      )}

      {/* 通話画面（通話開始後のみ） */}
      {callState === inCall && (
        <DynamicVideoComponent
          liveChannel={{
            channelInfo,
            broadcaster: {
              ...partnerInfo,
              about: partnerInfo.about ?? '',
              isNewUser: false,
              isLive: false,
              hasLovense: false,
            },
          }}
          onSendMessageToPeer={onSendMessageToPeer}
          onSendMessageToChannel={onSendMessageToChannel}
          callType={'videoCallFromOutgoing'}
          viewCount={viewCount}
          receiverId={channelInfo.peerId ?? ''}
          isBookmarked={isBookmarked}
        />
      )}

      {/* 停止確認モーダル */}
      <StopCallModal
        onLeave={async () => {
          onSendMessageToPeer?.({
            message_type: rtmMessageType.videoCallReply,
            isAccepted_call: false,
          });
          await onEnd?.();
          callEventEmitter.emit(callEventKeys.callEnd);
        }}
        callType="videoCallFromOutgoing"
      />
    </div>
  );
};
export default OutgoingVideoCall;
