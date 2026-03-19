import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import CallPointShortageModal from '@/components/purchase/CallPointShortageModal';
import {
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';
import { useMyPoint } from '@/hooks/usePollingData';
import { useRequest } from '@/hooks/useRequest';
import styles from '@/styles/videocall/VideoTwoModal.module.css';
import { getOutgoingCallPath } from '@/utils/callView';
import { regionText } from '@/utils/region';
import RoundedThumbnail from '../RoundedThumbnail';

export type CallSelectModalData = {
  onClose: () => void;
  partnerId: string;
  userName: string;
  age: number;
  region: number | string;
  avatarId: string;
  about: string;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isLive?: boolean | undefined;
  liveScreenshotThumbnailId?: string | undefined;
  hasLovense?: boolean;
  bustSize?: string;
};

const formatPricingInfo = (pricing: PricingInfo) => {
  const { price, unit } = pricing;
  const priceText = typeof price === 'number' ? `${price}` : price;

  return unit ? `${priceText}${unit}` : priceText;
};

const formatPricingText = (label: PricingLabel, fallback: string) => {
  const pricing = PRICING_INFO.find((info) => info.label === label);
  if (!pricing) return fallback;

  return formatPricingInfo(pricing);
};

const VideoTwoModal = ({
  userName,
  age,
  region,
  avatarId,
  partnerId,
  onClose,
  about,
  videoCallWaiting = true,
  voiceCallWaiting = true,
  hasLovense,
  bustSize,
}: CallSelectModalData) => {
  const videoCallPointText = formatPricingText('ビデオ通話', '230pt/分');
  const voiceCallPointText = formatPricingText('音声通話', '160pt/分');

  // 表示用の地域名に変換
  const regionName = regionText(region);

  const showModalClose = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const [showShortageModal, setShowShortageModal] = useState(false);
  const myPointData = useMyPoint();
  const myPoint: number | undefined = myPointData?.data?.point;
  const router = useRouter();

  const [showOkModal, setShowOkModal] = useState(false);
  const handleOkModalClose = () => {
    setShowOkModal(false);
    window.location.reload();
  };

  const { requestCall } = useRequest();

  const aboutText =
    about && about.length <= 30
      ? about
      : about
        ? `${about.slice(0, 30)}...`
        : '';

  const callRequestSend = async () => {
    const result = await requestCall(partnerId, 'videoCallFromOutgoing');
    if (!result.success) {
      alert(result.error);
      return;
    }
    setShowOkModal(true);
  };

  const onClick = () => {
    if (myPoint !== undefined && myPoint < 200) {
      setShowShortageModal(true);
      return;
    }

    handleJoin();
  };

  const handleJoin = async () => {
    // fromパラメータで現在のパスを保持し、replaceで履歴に残さない
    const fromPath = encodeURIComponent(window.location.pathname);
    router.replace(
      getOutgoingCallPath('videoCallFromOutgoing') +
        '/' +
        partnerId +
        `?from=${fromPath}`,
    );
  };

  const onClickVoice = () => {
    if (myPoint !== undefined && myPoint < 140) {
      setShowShortageModal(true);
      return;
    }
    handleVoiceJoin();
  };

  const handleVoiceJoin = () => {
    // fromパラメータで現在のパスを保持し、replaceで履歴に残さない
    const fromPath = encodeURIComponent(window.location.pathname);
    router.replace(
      getOutgoingCallPath('voiceCallFromOutgoing') +
        '/' +
        partnerId +
        `?from=${fromPath}`,
    );
  };

  const voiceRequestSend = async () => {
    const result = await requestCall(partnerId, 'voiceCallFromOutgoing');
    if (!result.success) {
      alert(result.error);
      return;
    }
    setShowOkModal(true);
  };

  const closeVideoChatModal = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseShortageModal = () => {
    setShowShortageModal(false);
  };

  return (
    <div>
      {showShortageModal && (
        <CallPointShortageModal
          onClose={handleCloseShortageModal}
          onPurchaseAndCall={handleCloseShortageModal}
          callType={'both'}
          partnerId={partnerId}
          userName={userName}
          avatarId={avatarId}
          age={age}
          region={region}
          hasLovense={hasLovense}
          bustSize={bustSize}
        />
      )}
      {showOkModal && (
        <div className={styles.okoverlay} onClick={handleOkModalClose}>
          <div className={styles.okmodal}>
            {userName}さんに通話リクエストをしました
            <br />
            返事が来たら、こちらから発信しましょう♪
            <br />
            <center>
              <button onClick={handleOkModalClose} className={styles.okok}>
                OK
              </button>
            </center>
          </div>
        </div>
      )}
      <div
        className={styles.overlay}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => showModalClose(e)}
      >
        <div className={styles.modal}>
          <div className={styles.icon}>
            <RoundedThumbnail avatarId={avatarId} deviceCategory="mobile" />
          </div>
          <div className={styles.name}>{userName} </div>
          <div className={styles.region}>
            {regionName}　{age}歳
          </div>
          <div className={styles.about}>{aboutText}</div>

          {videoCallWaiting && (
            <>
              <div onClick={onClick}>
                <div className={styles.videocallbutton}>
                  <div>
                    <div className={styles.videomo}>
                      ビデオ通話発信
                      <br />
                      <span className={styles.pt}>{videoCallPointText}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.videocallbutton} onClick={callRequestSend}>
                <div>
                  <div className={styles.videomo}>
                    ビデオ通話リクエスト
                    <br />
                    <span className={styles.pt}>(無料)</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {voiceCallWaiting && (
            <>
              <div className={styles.callbutton} onClick={onClickVoice}>
                <div>
                  <div className={styles.mo}>
                    音声通話発信
                    <br />
                    <span className={styles.pt}>{voiceCallPointText}</span>
                  </div>
                </div>
              </div>

              <div className={styles.callbutton} onClick={voiceRequestSend}>
                <div>
                  <div className={styles.mo}>
                    音声通話リクエスト <br />
                    <span className={styles.pt}>(無料)</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div style={{ marginTop: '30px' }}>
            <a onClick={closeVideoChatModal} className={styles.close}>
              キャンセル
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoTwoModal;
