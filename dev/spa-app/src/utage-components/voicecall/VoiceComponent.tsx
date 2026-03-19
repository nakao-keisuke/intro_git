// Image component removed (use <img> directly);
import { memo, useCallback, useEffect, useState } from 'react';
import StopCallModal from '@/components/videocall/StopCallModal';
import { useAgoraRTC } from '@/hooks/useAgoraRTC.hook';
import { useCallTimer } from '@/hooks/useCallTimer.hook';
import styles from '@/styles/voicecall/VoiceComponent.module.css';
import CallTimeCard from '../videocall/CallTimeCard';
import PointCard from '../videocall/PointCard';
import StopCallButton from '../videocall/StopCallButton';

const micPic = '/mic/mic.webp';
const micOffPic = '/mic/mic_off.webp';

import { useSession } from '#/hooks/useSession';
import { toast } from 'react-toastify';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { rtmMessageType } from '@/constants/RtmMessageType';
import { useQuickCharge } from '@/hooks/requests/useQuickCharge';
import { useInCallPurchaseTracking } from '@/hooks/useInCallPurchaseTracking';
import { usePaymentCustomerData } from '@/hooks/usePaymentCustomerData.hook';
import { useCallStore } from '@/stores/callStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { usePointStore } from '@/stores/pointStore';
import type { LiveChannel } from '@/types/LiveChannel';
import { inCall } from '@/utils/callState';
import AlvionPaymentModal from '../purchase/AlvionPaymentModal';
import AlvionQuickChargeModal from '../purchase/AlvionQuickChargeModal';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  onSendMessageToPeer: ((message: any) => Promise<void>) | undefined;
  onSendMessageToChannel: ((message: any) => Promise<void>) | undefined;
  liveChannel: LiveChannel;
};

export const VoiceComponent = memo<Props>(
  ({
    liveChannel: { channelInfo, broadcaster },
    onSendMessageToPeer,
    onSendMessageToChannel,
  }: Props) => {
    const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
    const [isConnecting, setIsConnecting] = useState(true);
    const callState = useCallStore((s) => s.callState);
    const [micMutedPicState, setMicMutedPicState] = useState<
      'notmuted' | 'muted'
    >('notmuted');

    // 決済顧客データを取得（クイックチャージ可否判定のため）
    usePaymentCustomerData();

    // 通話中であることを body に設定（ヘッダー・サイドバー非表示用）
    useEffect(() => {
      document.body.setAttribute('data-in-call', 'true');
      return () => {
        document.body.removeAttribute('data-in-call');
      };
    }, []);

    const [isAlvionPaymentModalOpen, setAlvionPaymentModalOpen] =
      useState(false);
    const [isQuickChargeModalOpen, setIsQuickChargeModalOpen] = useState(false);
    // クイックチャージ可否をZustandから取得
    const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);
    const { data: session } = useSession();

    // 通話中課金のトラッキング用（音声通話）
    const { trackInCallCharge, clearInCallChargeAttribution } =
      useInCallPurchaseTracking(canQuickCharge, 'voicecall');
    const [selectedCourse, setSelectedCourse] = useState<{
      point: number;
      money: number;
      isBonusExist: boolean;
    } | null>(null);
    const {
      isSuccess,
      errorData,
      response,
      isPurchasing,
      startPurchase,
      onEnd,
    } = useQuickCharge();
    const [_isQuickMessageModalOpen, _setIsQuickMessageModalOpen] =
      useState(false);

    const [onLeave, _, changeMicState, isMicMuted, isPartnerMicMuted] =
      useAgoraRTC(channelInfo, 'voiceCall', 'mobile');

    const cancel = useCallback(async () => {
      await onLeave();
      onSendMessageToPeer?.({
        message_type: rtmMessageType.voiceCallReply,
        isAccepted_call: false,
      });
    }, [onLeave, onSendMessageToPeer]);

    const callTime = useCallTimer(
      channelInfo.peerId!,
      onLeave,
      onSendMessageToPeer,
      onSendMessageToChannel,
      'voiceCall',
      (isSecondCourseBonusExist: boolean) => {
        setSelectedCourse({
          point: 800,
          money: 980,
          isBonusExist: isSecondCourseBonusExist,
        });
      },
      (point: number, money: number, isBonusExist: boolean) => {
        setSelectedCourse({ point, money, isBonusExist });

        // 自動表示時にはcanQuickChargeに基づいてモーダルを表示
        if (canQuickCharge) {
          setIsQuickChargeModalOpen(true);
        } else {
          setAlvionPaymentModalOpen(true);
        }
      },
    );
    const handleProfileButtonClick = (event: {
      stopPropagation: () => void;
    }) => {
      event.stopPropagation();
      setIsProfileModalOpen(true);
    };

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // ポイント購入ボタンクリック時の条件分岐処理
    const handlePointPurchaseClick = () => {
      trackInCallCharge();

      if (canQuickCharge) {
        setIsQuickChargeModalOpen(true);
      } else {
        setAlvionPaymentModalOpen(true);
      }
    };

    // 課金モーダルを閉じる時の処理（購入せずに閉じた場合、attributionをクリア）
    const handleClosePaymentModal = () => {
      setIsQuickChargeModalOpen(false);
      setAlvionPaymentModalOpen(false);
      clearInCallChargeAttribution();
    };

    const handlePurchaseSuccess = (updatedPoint: number) => {
      setCurrentPoint(updatedPoint);
      setAlvionPaymentModalOpen(false);
      setIsQuickChargeModalOpen(false);
      toast(
        <div
          className="inline-flex items-center"
          style={{ verticalAlign: 'middle' }}
        >
          <img
            src="/images/purchase_check_icon.webp"
            alt="購入完了"
            className="h-8 w-8"
            style={{ marginRight: '0.5em', verticalAlign: 'middle' }}
          />
          <span style={{ verticalAlign: 'middle', lineHeight: '32px' }}>
            {updatedPoint}ポイントを購入しました。
          </span>
        </div>,
        {
          theme: 'light',
          className: 'bg-white',
          hideProgressBar: false,
          autoClose: 3000,
        },
      );
    };

    useEffect(() => {
      setIsConnecting(isPurchasing);
    }, [isPurchasing]);

    useEffect(() => {
      if (isSuccess) {
        toast('ポイント購入に成功しました');
        setSelectedCourse({ point: 800, money: 980, isBonusExist: false });
        if (response?.point !== undefined) {
          setCurrentPoint(response.point);
        }
      }
      if (isSuccess === false && errorData) {
        toast(errorData.message);
      }
      onEnd();
    }, [isSuccess, errorData]);

    useEffect(() => {
      if (isMicMuted === undefined || isMicMuted === 'switching') return;
      setMicMutedPicState(isMicMuted ? 'muted' : 'notmuted');
    }, [isMicMuted]);

    const _onClickQuickCharge = () => {
      if (!selectedCourse) return;
      if (isPurchasing) return;
      startPurchase(selectedCourse.point, selectedCourse.money);
      setAlvionPaymentModalOpen(true);
    };

    return (
      <div className={styles.voice_wrapper}>
        {isConnecting && callState === inCall && (
          <div className={styles.loader}></div>
        )}
        {callState === inCall &&
          isAlvionPaymentModalOpen &&
          (canQuickCharge ? (
            <AlvionQuickChargeModal
              token={session?.user.token || ''}
              onClose={handleClosePaymentModal}
              onSuccess={handlePurchaseSuccess}
              onOpenPaymentModal={() => {
                setIsQuickChargeModalOpen(false);
                setAlvionPaymentModalOpen(true);
              }}
              title={
                selectedCourse?.isBonusExist
                  ? '残り1分で通話が終了します！'
                  : ''
              }
              hideLowestPackage={true}
              source="live"
            />
          ) : (
            <AlvionPaymentModal
              token={channelInfo.rtcChannelToken}
              onClose={handleClosePaymentModal}
              onSuccess={handlePurchaseSuccess}
              title={
                selectedCourse?.isBonusExist
                  ? '残り1分で通話が終了します！'
                  : ''
              }
              isPC={false}
              hideLowestPackage={true}
              source="live"
            />
          ))}
        {isMicMuted !== undefined && (
          <button
            className={styles.mute_mic_button}
            onClick={() => {
              changeMicState();
            }}
          >
            <Image
              src={micMutedPicState === 'muted' ? micOffPic : micPic}
              alt="Utage"
              width={30}
              height={30}
            />
          </button>
        )}
        <div className={styles.voice_screen}>
          {callState === inCall && (
            <>
              <CallTimeCard callTime={callTime ?? 0} />
              <div
                className={styles.point_card}
                onClick={(event) => {
                  event.stopPropagation();
                  handlePointPurchaseClick();
                }}
              >
                <PointCard />
              </div>
              <button className={styles.prf} onClick={handleProfileButtonClick}>
                <RoundedThumbnail
                  avatarId={broadcaster.avatarId}
                  deviceCategory="mobile"
                  customSize={{ width: 210, height: 210 }}
                  customQuality={90}
                />
              </button>
              <div className={styles.name2}>
                {broadcaster.age}
                <span className={styles.sai}>歳</span>　{broadcaster.userName}
                {isPartnerMicMuted && (
                  <Image alt={'mute'} src={micOffPic} width={15} height={15} />
                )}
              </div>
            </>
          )}
        </div>
        {callState === inCall && (
          <div className={styles.stop_call_btn}>
            <StopCallButton />
          </div>
        )}
        <StopCallModal onLeave={cancel} callType={'voiceCall'} />
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          partnerInfo={{
            ...broadcaster,
            isNewUser: false,
          }}
        />

        {isQuickChargeModalOpen && (
          <AlvionQuickChargeModal
            token={session?.user.token || ''}
            onClose={handleClosePaymentModal}
            onSuccess={handlePurchaseSuccess}
            onOpenPaymentModal={() => {
              setIsQuickChargeModalOpen(false);
              setAlvionPaymentModalOpen(true);
            }}
            hideLowestPackage={true}
            source="live"
          />
        )}
      </div>
    );
  },
);

VoiceComponent.displayName = 'VoiceComponent';
