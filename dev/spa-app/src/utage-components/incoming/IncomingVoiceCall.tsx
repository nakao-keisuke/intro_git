// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useSession } from '#/hooks/useSession';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DynamicVoiceComponent } from '@/app/[locale]/profile/components/DynamicComponents';
import { RTM_LOGIN_TIMEOUT_MS } from '@/constants/agora/errorCodes';
import { callEventKeys } from '@/constants/callEventKeys';
import { event } from '@/constants/ga4Event';
import { rtmMessageType } from '@/constants/RtmMessageType';
import { useAgoraRTM } from '@/hooks/useAgoraRTM.hook';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';
import callEventEmitter from '@/libs/callEventEmitter';
import { useCallStore } from '@/stores/callStore';
import styles from '@/styles/incoming/IncomingVoiceCall.module.css';
import type { ChannelInfo } from '@/types/ChannelInfo';
import type { MediaInfo } from '@/types/MediaInfo';
import type { PartnerInfo } from '@/types/PartnerInfo';
import { beforeCall, inCall } from '@/utils/callState';
import { trackEvent } from '@/utils/eventTracker';
import { getProfileStoryMovieUrl } from '@/utils/image';
import { clearMediaSession } from '@/utils/mediaSession';
import { sendMessageToWebView } from '@/utils/webview';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  channelInfo: ChannelInfo;
  partnerInfo: PartnerInfo;
  thumbnailList?: MediaInfo[];
};

const IncomingVoiceCall = ({
  channelInfo,
  partnerInfo,
  thumbnailList = [],
}: Props) => {
  const router = useRouter();
  const callState = useCallStore((s) => s.callState);
  const setCallState = useCallStore((s) => s.setCallState);
  const session = useSession();
  const token = session.data?.user.token || '';

  const { checkAndRequestPermission } = useNativeMediaPermission();
  const storyVideoRef = useRef<HTMLVideoElement | null>(null);
  const callEndedSentRef = useRef(false);
  const callStateRef = useRef(callState);

  const [volume, _setVolume] = useState(0.2); // 初期値の音量

  // callStateの最新値をrefに保持（クリーンアップ関数で参照するため）
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  // ストーリー動画があるかどうかを判定
  const storyMovie = thumbnailList.find((item) => item.type === 'movie');
  const hasStoryMovie = !!storyMovie && !!token;

  // GA4イベント送信
  useEffect(() => {
    trackEvent(event.INCOMING_VOICE_CALL, {
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

    if (callState === beforeCall) {
      // 着信中はストーリー動画を再生
      if (bgVideo) {
        bgVideo.play().catch((error) => {
          console.error('Background story video play failed:', error);
        });
      }
    } else {
      // 着信終了または通話開始時は動画を停止
      if (bgVideo) {
        bgVideo.pause();
        bgVideo.currentTime = 0;
      }
    }
  }, [callState, hasStoryMovie]);

  // unmount時のみのクリーンアップ
  useEffect(() => {
    return () => {
      const bgVideo = storyVideoRef.current;

      if (bgVideo) {
        bgVideo.pause();
        bgVideo.src = '';
        bgVideo.load();
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

  // useAgoraRTMからの戻り値を受け取る
  const [
    _rtmOnJoin,
    rtmSendMessageToPeer,
    onSendMessageToChannel,
    _viewCount,
    _onEnd,
    _setUserCancelled,
    isRtmReady,
  ] = useAgoraRTM(channelInfo, 'voiceCall');

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
    // マイクの許可チェック（Native/ブラウザ両対応）
    const hasPermission = await checkAndRequestPermission('voice');
    if (!hasPermission) return;

    try {
      if (channelInfo.isPartnerInSecondApps) {
        // RTMでメッセージを送信
        await onSendMessageToChannel({
          message_type: 'videoCallReply',
          is_answer: true,
        });
      } else {
        // 第一世界線用にピアメッセージを送信する
        await rtmSendMessageToPeer({
          message_type: rtmMessageType.voiceCallReply,
          isAccepted_call: true,
        });
      }

      trackEvent('COMPLETE_VOICE_CALL_BY_INCOMING');
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
          message_type: 'videoCallReply',
          is_answer: false,
        });
      } else {
        // 第一世界線用にピアメッセージを送信する
        await rtmSendMessageToPeer({
          message_type: rtmMessageType.voiceCallReply,
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

  return (
    <div className={styles.voice_screen}>
      {/* 背景レイヤー */}
      <div className={styles.bgLayer}>
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
              className={styles.bgVideo}
              style={{ objectFit: 'cover', zIndex: 0 }}
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
            className={styles.bgBlur}
            style={{ objectFit: 'cover', zIndex: 0 }}
            priority
          />
        )}
        <div
          className={
            hasStoryMovie ? styles.bgVideoOverlay : styles.bgWhiteOverlay
          }
        />
      </div>

      {callState === beforeCall && (
        <div className={styles.contentLayer}>
          <div className={styles.title}>音声通話着信中...</div>
          <div className={styles.icon}>
            <RoundedThumbnail
              avatarId={partnerInfo.avatarId}
              deviceCategory="mobile"
            />
          </div>
          <div className={styles.name}>{partnerInfo.userName}</div>

          <div className={styles.loader3}>
            <div className={styles.circle1}></div>
            <div className={styles.circle1}></div>
            <div className={styles.circle1}></div>
            <div className={styles.circle1}></div>
            <div className={styles.circle1}></div>
          </div>

          <div className={styles.stop_call_btn}>
            <div className={styles.rejectButton} onClick={handleRejectCall}>
              <Image
                src="/call/reject.webp"
                width={120}
                height={120}
                alt="reject"
              />
            </div>
            <div
              className={`${styles.acceptButton} ${!isRtmReady ? styles.disabled : ''}`}
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

      {callState === inCall && (
        <DynamicVoiceComponent
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
          onSendMessageToChannel={onSendMessageToChannel}
          onSendMessageToPeer={rtmSendMessageToPeer}
        />
      )}
    </div>
  );
};
export default IncomingVoiceCall;
