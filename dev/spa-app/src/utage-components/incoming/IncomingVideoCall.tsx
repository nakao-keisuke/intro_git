// Image component removed (use <img> directly);
import { useCallback, useEffect, useRef, useState } from 'react';
import { DynamicVideoComponent } from '@/app/[locale]/profile/components/DynamicComponents';
import { useAgoraRTM } from '@/hooks/useAgoraRTM.hook';
import { useCallStore } from '@/stores/callStore';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { MediaInfo } from '@/types/MediaInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import { beforeCall, inCall } from '@/utils/callState';
import { getProfileStoryMovieUrl } from '@/utils/image';
import RoundedThumbnail from '../RoundedThumbnail';

const pointIcon = '/g_point.webp';
const lovensePic = '/lovense_pink.webp';

import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { RTM_LOGIN_TIMEOUT_MS } from '@/constants/agora/errorCodes';
import { callEventKeys } from '@/constants/callEventKeys';
import { event } from '@/constants/ga4Event';
import { VIDEO_CALL_PRICE_TEXT } from '@/constants/pricing';
import { rtmMessageType } from '@/constants/RtmMessageType';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';
import callEventEmitter from '@/libs/callEventEmitter';
import { trackEvent } from '@/utils/eventTracker';
import { clearMediaSession } from '@/utils/mediaSession';
import { sendMessageToWebView } from '@/utils/webview';

type Props = {
  channelInfo: ChannelInfo;
  partnerInfo: PartnerInfo;
  isBookmarked: boolean;
  point: number;
  thumbnailList?: MediaInfo[];
};

type PartnerHeaderInfoProps = {
  userName: string;
  age?: number;
  region: string;
  about?: string;
  bustSize?: string;
  hasLovense?: boolean;
};

const PartnerHeaderInfo = ({
  userName,
  age,
  region,
  about,
  bustSize,
  hasLovense,
}: PartnerHeaderInfoProps) => {
  return (
    <div className="mt-3 w-[min(90vw,360px)] rounded-2xl bg-white/25 px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.12)]">
      {/* 1行目: 名前 / 年齢 / 地域 を横並び */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[#fff]">
        <span className="font-bold text-[1.1rem] tracking-[0.04em] max-[320px]:text-[1rem] max-[768px]:text-[1.1rem]">
          {userName}
        </span>
        {typeof age === 'number' && (
          <span className="font-semibold text-[1rem] leading-6 opacity-90 max-[768px]:text-[0.95rem]">
            ({age})
          </span>
        )}
        <span className="font-semibold text-[0.95rem] leading-6 opacity-90 max-[768px]:text-[0.9rem]">
          📍 {region}
        </span>
      </div>
      {/* 2行目: バッジ */}
      <div className="mt-2 flex items-center justify-center gap-2">
        {hasLovense && (
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#ff4fa0] to-[#ff92d5] px-2 py-1 text-white shadow-[0_1px_5px_0_rgba(0,0,0,0.4)]">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95">
              <Image src={lovensePic} alt="Lovense" width={18} height={18} />
            </div>
            <span className="font-bold text-[11px] tracking-[0.08em]">
              遠隔バイブ対応
            </span>
          </span>
        )}
        {bustSize && (
          <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-[0.8rem] text-rose-500 shadow-[0_1px_5px_0_rgba(0,0,0,0.4)]">
            👙 {bustSize}
          </span>
        )}
      </div>
      {/* 3行目: 自己紹介 */}
      {about && (
        <div className="mt-3 overflow-hidden whitespace-pre-wrap break-words text-center text-[#fff] text-[0.95rem] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] [display:-webkit-box] max-[768px]:text-[0.9rem]">
          {about}
        </div>
      )}
    </div>
  );
};

const IncomingVideoCall = ({
  channelInfo,
  partnerInfo,
  isBookmarked,
  point,
  thumbnailList = [],
}: Props) => {
  const router = useRouter();
  const session = useSession();
  const token = session.data?.user.token || '';

  const { checkAndRequestPermission } = useNativeMediaPermission();
  const videoScreenRef = useRef<HTMLDivElement | null>(null);
  const storyVideoRef = useRef<HTMLVideoElement | null>(null);
  const centerStoryVideoRef = useRef<HTMLVideoElement | null>(null);
  const callEndedSentRef = useRef(false);

  const callState = useCallStore((s) => s.callState);
  const setCallState = useCallStore((s) => s.setCallState);
  const callStateRef = useRef(callState);

  // callStateの最新値をrefに保持（クリーンアップ関数で参照するため）
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const [volume, _setVolume] = useState(0.2); // 初期値の音量

  // ストーリー動画があるかどうかを判定
  const storyMovie = thumbnailList.find((item) => item.type === 'movie');
  const hasStoryMovie = !!storyMovie && !!token;

  useEffect(() => {
    const showFullScreen = async () => {
      try {
        if (videoScreenRef.current?.requestFullscreen) {
          await videoScreenRef.current?.requestFullscreen();
          sessionStorage.setItem('isFullScreen', 'true');
        }
      } catch (e) {
        // WebView環境ではfullscreenがサポートされていない場合がある
        console.debug('Fullscreen not supported:', e);
      }
    };
    showFullScreen();
  }, []);

  // GA4イベント送信
  useEffect(() => {
    trackEvent(event.INCOMING_VIDEO_CALL, {
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

  // ストーリー動画の再生制御
  // callState変化時の再生/停止制御
  useEffect(() => {
    if (!hasStoryMovie) {
      return;
    }

    const bgVideo = storyVideoRef.current;
    const centerVideo = centerStoryVideoRef.current;

    if (callState === beforeCall) {
      // 着信中はストーリー動画を再生
      if (bgVideo) {
        bgVideo.play().catch((error) => {
          console.error('Background story video play failed:', error);
        });
      }
      if (centerVideo) {
        centerVideo.play().catch((error) => {
          console.error('Center story video play failed:', error);
        });
      }
    } else {
      // 着信終了または通話開始時は動画を停止
      if (bgVideo) {
        bgVideo.pause();
        bgVideo.currentTime = 0;
      }
      if (centerVideo) {
        centerVideo.pause();
        centerVideo.currentTime = 0;
      }
    }
  }, [callState, hasStoryMovie]);

  // unmount時のみのクリーンアップ
  useEffect(() => {
    return () => {
      const bgVideo = storyVideoRef.current;
      const centerVideo = centerStoryVideoRef.current;

      if (bgVideo) {
        bgVideo.pause();
        bgVideo.src = '';
        bgVideo.load();
      }
      if (centerVideo) {
        centerVideo.pause();
        centerVideo.src = '';
        centerVideo.load();
      }

      clearMediaSession();
    };
  }, []);

  // CALL_ENDED送信の共通関数（重複防止）
  const sendCallEnded = useCallback(() => {
    if (!callEndedSentRef.current) {
      callEndedSentRef.current = true;
      sendMessageToWebView({
        type: 'CALL_ENDED',
      });
    }
  }, []);

  // 通話終了後は相手のメッセージ画面に遷移
  const safeNavigateBack = useCallback(() => {
    router.replace(`/message/${channelInfo.peerId}`);
  }, [router, channelInfo.peerId]);

  useEffect(() => {
    const handleCallEnd = () => {
      safeNavigateBack();
    };

    callEventEmitter.on(callEventKeys.callEnd, handleCallEnd);

    return () => {
      callEventEmitter.off(callEventKeys.callEnd, handleCallEnd);

      // 通話接続前のアンマウント時のみバイブを止める
      // 通話接続後は useAgoraRTC.hook.ts 側で CALL_ENDED が送信される
      if (callStateRef.current === beforeCall) {
        sendCallEnded();
      }
    };
  }, [sendCallEnded, safeNavigateBack]);

  // useAgoraRTM
  const [
    _rtmOnJoin,
    onSendMessageToPeer,
    onSendMessageToChannel,
    viewCount,
    _onEnd,
    _setUserCancelled,
    isRtmReady,
  ] = useAgoraRTM(channelInfo, 'videoCallFromIncoming');

  // RTMログインが一定時間内に完了しなかった場合、着信画面を閉じる
  useEffect(() => {
    if (isRtmReady) return;

    const timeout = setTimeout(() => {
      sendCallEnded();
      safeNavigateBack();
    }, RTM_LOGIN_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [isRtmReady, sendCallEnded, safeNavigateBack]);

  const handleAcceptCall = async () => {
    // カメラ・マイクの許可チェック（Native/ブラウザ両対応）
    const hasPermission = await checkAndRequestPermission('video');
    if (!hasPermission) return;

    try {
      if (channelInfo.isPartnerInSecondApps) {
        // RTMでメッセージを送信
        await onSendMessageToChannel({
          message_type: rtmMessageType.videoCallReply,
          is_answer: true,
        });
      } else {
        // 第一世界線用にピアメッセージを送信する
        await onSendMessageToPeer({
          message_type: rtmMessageType.videoCallReply,
          isAccepted_call: true,
        });
      }

      trackEvent('COMPLETE_VIDEO_CALL_BY_INCOMING');
      setCallState(inCall);
    } catch (error) {
      console.error('Error accepting call:', error);

      // エラー時はバイブを止める（重複防止）
      sendCallEnded();

      safeNavigateBack();
    }
  };

  const handleRejectCall = async () => {
    // 拒否ボタンが反応しない問題の対策として、3秒後に必ず着信画面を閉じる
    // このタイムアウトは正常時・エラー時にクリアされ、3秒経過時のバックアップとして機能する
    const emergencyExit = setTimeout(() => {
      sendCallEnded();
      safeNavigateBack();
    }, 3000);

    try {
      if (channelInfo.isPartnerInSecondApps) {
        // RTMでメッセージを送信
        await onSendMessageToChannel({
          message_type: rtmMessageType.videoCallReply,
          is_answer: false,
        });
      } else {
        // 第一世界線用にピアメッセージを送信する
        await onSendMessageToPeer({
          message_type: rtmMessageType.videoCallReply,
          isAccepted_call: false,
        });
      }

      clearTimeout(emergencyExit);
      // Nativeアプリに通話終了を通知（重複防止）
      sendCallEnded();
      safeNavigateBack();
    } catch (error) {
      clearTimeout(emergencyExit);
      console.error('Error rejecting call:', error);
      // エラー時もNativeに通知（重複防止）
      sendCallEnded();
      safeNavigateBack();
    }
  };

  const showIncomingUI = callState === beforeCall;

  const _videoCallChargingMessage = VIDEO_CALL_PRICE_TEXT
    ? `通話中は1分ごとに${VIDEO_CALL_PRICE_TEXT}消費します。`
    : '';

  return (
    <div
      className="fixed inset-0 z-[1] flex h-screen w-screen touch-none flex-col items-center overflow-hidden"
      ref={videoScreenRef}
    >
      {/* 最背面: 背景画像/ストーリー動画と白いオーバーレイ */}
      <div className="pointer-events-none absolute inset-0 z-0 h-screen w-screen">
        {showIncomingUI &&
          hasStoryMovie &&
          storyMovie &&
          storyMovie.type === 'movie' && (
            <video
              ref={storyVideoRef}
              src={getProfileStoryMovieUrl({
                fileId: storyMovie.movieId,
                token,
                applicationId: partnerInfo.applicationId ?? '',
              })}
              className="pointer-events-none absolute inset-0 z-0 h-screen w-screen object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          )}
        {showIncomingUI && !hasStoryMovie && partnerInfo.avatarId && (
          <Image
            src={require('@/utils/image').imageUrl(partnerInfo.avatarId)}
            alt="背景画像"
            fill
            className="pointer-events-none absolute inset-0 z-0 h-screen w-screen object-cover blur-[3px] brightness-[0.6]"
            priority
          />
        )}
      </div>
      {/* 上部エリア: コイン残高バーのみ */}
      {showIncomingUI && (
        <div className="absolute top-6 left-1/2 z-[2] flex h-11 min-w-[120px] -translate-x-1/2 items-center rounded-[10px] bg-white/95 pr-[22px] pl-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] max-[320px]:h-7 max-[768px]:h-8 max-[320px]:pr-2 max-[768px]:pr-[10px] max-[320px]:pl-1 max-[768px]:pl-1">
          <Image
            src={pointIcon}
            alt="coin"
            className="mr-2 block h-8 w-8 max-[320px]:h-[18px] max-[768px]:h-5 max-[320px]:w-[18px] max-[768px]:w-5"
            width={32}
            height={32}
          />
          <span className="mt-[2px] font-bold text-[#444] text-[1.7rem] leading-none tracking-[1px] max-[320px]:text-[0.9rem] max-[768px]:text-[1.1rem]">
            {point}pt
          </span>
        </div>
      )}
      {/* 中央エリア: 着信中テキスト・アイコン・名前年齢 */}
      {showIncomingUI && (
        <div className="z-[2] flex w-screen flex-grow flex-col items-center">
          <div className="mt-20 mb-[18px] text-center font-bold text-[#ffff] text-[1.25rem] tracking-[0.12em] max-[320px]:mt-6 max-[320px]:text-[1.1rem] max-[768px]:text-[1.2rem]">
            ビデオ通話　着信中...
          </div>
          {/* 動画がある場合は丸い枠を非表示にする */}
          {!hasStoryMovie && (
            <div className="mb-[18px] flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] max-[320px]:h-[180px] max-[320px]:w-[180px]">
              <RoundedThumbnail
                avatarId={partnerInfo.avatarId}
                deviceCategory="mobile"
                customSize={{ width: 240, height: 240 }}
              />
            </div>
          )}
          <PartnerHeaderInfo
            userName={partnerInfo.userName}
            age={partnerInfo.age}
            region={partnerInfo.region}
            about={partnerInfo.about ?? ''}
            bustSize={partnerInfo.bustSize ?? ''}
            hasLovense={partnerInfo.hasLovense ?? false}
          />
        </div>
      )}
      {/* 下部エリア: 挨拶・WiFi注意・ボタン・消費pt */}
      {showIncomingUI && (
        <div className="absolute bottom-[50px] z-[2] flex w-screen flex-col items-center bg-transparent max-[320px]:bottom-8 max-[768px]:bottom-[60px]">
          <div className="mb-[10px] flex items-center justify-center gap-[80px] max-[320px]:gap-[60px]">
            <div
              className="flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full bg-[#ff4d4f] shadow-[0_2px_8px_rgba(0,0,0,0.13)] transition duration-150 hover:brightness-95 max-[320px]:h-[96px] max-[768px]:h-[72px] max-[320px]:w-[96px] max-[768px]:w-[72px]"
              onClick={handleRejectCall}
            >
              <Image
                src="/call/reject.webp"
                width={120}
                height={120}
                alt="reject"
              />
            </div>
            <div
              className={`flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#4caf50] shadow-[0_2px_8px_rgba(0,0,0,0.13)] transition duration-150 max-[320px]:h-[96px] max-[768px]:h-[72px] max-[320px]:w-[96px] max-[768px]:w-[72px] ${isRtmReady ? 'cursor-pointer hover:brightness-95' : 'cursor-not-allowed opacity-50'}`}
              onClick={isRtmReady ? handleAcceptCall : undefined}
            >
              <Image
                src="/call/accept.webp"
                width={120}
                height={120}
                alt="accept"
              />
            </div>
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
              hasLovense: partnerInfo.hasLovense ?? false,
            },
          }}
          onSendMessageToPeer={onSendMessageToPeer}
          onSendMessageToChannel={onSendMessageToChannel}
          viewCount={viewCount}
          callType={'videoCallFromIncoming'}
          receiverId={channelInfo.peerId ?? ''}
          isBookmarked={isBookmarked}
        />
      )}
    </div>
  );
};
export default IncomingVideoCall;
