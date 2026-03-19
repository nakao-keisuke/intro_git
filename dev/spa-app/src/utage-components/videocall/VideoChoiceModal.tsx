import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import CallPointShortageModal from '@/components/purchase/CallPointShortageModal';
import { event } from '@/constants/ga4Event';
import {
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';
import { useMyPoint } from '@/hooks/usePollingData';
import { useRequest } from '@/hooks/useRequest';
import styles from '@/styles/videocall/VideoChatModal.module.css';
import { getOutgoingCallPath } from '@/utils/callView';
import { trackEvent } from '@/utils/eventTracker';
import { region } from '@/utils/region';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  onClose: () => void;
  partnerId: string;
  userName: string;
  age: number;
  region: number;
  avatarId: string;
  about: string;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
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

  return `(${formatPricingInfo(pricing)})`;
};

/**
 * モバイル版ビデオ・音声通話選択モーダルコンポーネント
 * 相手の通話許可設定に基づいて、適切な通話オプションを表示
 *
 * @param props
 */
const VideoChoiseModal = ({
  userName,
  age,
  region: regionCode,
  avatarId,
  partnerId,
  onClose,
  about,
  videoCallWaiting,
  voiceCallWaiting,
  hasLovense,
  bustSize,
}: Props) => {
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const videoCallPointText = formatPricingText('ビデオ通話', '(230pt/分)');
  const voiceCallPointText = formatPricingText('音声通話', '(160pt/分)');
  const _nocallModal = () => {
    setActiveModal('no');
  };
  const closeNoModal = () => {
    setActiveModal(null);
  };

  const [showOkModal, setShowOkModal] = useState(false);
  const handleOkModalClose = () => {
    setShowOkModal(false);
    router.refresh();
  };

  const { requestCall } = useRequest();

  const aboutText =
    about && about.length <= 30
      ? about
      : about
        ? `${about.slice(0, 30)}...`
        : '';

  const videoRequestSend = async () => {
    const result = await requestCall(partnerId, 'videoCallFromOutgoing');
    if (!result.success) {
      alert(result.error);
      return;
    }
    setShowOkModal(true);
    // GA4イベント送信
    trackEvent(event.SEND_VIDEO_CALL_REQUEST, {
      partner_id: partnerId,
      from: window.location.pathname,
    });
  };

  const onClickVideo = () => {
    if (myPoint !== undefined && myPoint < 200) {
      setShowShortageModal(true);
      return;
    }

    handleVideoJoin();
  };
  const handleVideoJoin = async () => {
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

  const handleVoiceJoin = async () => {
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
    // GA4イベント送信
    trackEvent(event.SEND_VOICE_CALL_REQUEST, {
      partner_id: partnerId,
      from: window.location.pathname,
    });
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
          region={regionCode}
          hasLovense={hasLovense}
          bustSize={bustSize}
        />
      )}
      {showOkModal && (
        <div className={styles.okoverlay} onClick={handleOkModalClose}>
          <div className={styles.okmodal}>
            {userName}さんに通話リクエストをしました
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
            {region(regionCode)}　{age}歳
          </div>
          <div className={styles.about}>{aboutText}</div>

          <div className={styles.container}>
            {/* ビデオ通話が許可されている場合 */}
            {videoCallWaiting && (
              <>
                <div onClick={onClickVideo}>
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
                <div>
                  <div className={styles.request} onClick={videoRequestSend}>
                    <div>
                      <div className={styles.videomo}>
                        ビデオ通話リクエスト
                        <br />
                        <span className={styles.pt}>(無料)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 音声通話が許可されている場合 */}
            {voiceCallWaiting && (
              <>
                <div onClick={onClickVoice}>
                  <div
                    className={
                      videoCallWaiting
                        ? styles.voicecallbutton
                        : styles.callbutton
                    }
                  >
                    <div>
                      <div className={styles.mo}>
                        音声通話発信
                        <br />
                        <span className={styles.pt}>{voiceCallPointText}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    className={
                      videoCallWaiting
                        ? styles.voicecallbutton
                        : styles.callbutton
                    }
                    onClick={voiceRequestSend}
                  >
                    <div>
                      <div className={styles.mo}>
                        音声通話リクエスト <br />
                        <span className={styles.pt}>(無料)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <a onClick={showModalClose} className={styles.close}>
            キャンセル
          </a>
        </div>
      </div>

      {activeModal === 'no' && (
        <div className={styles.modalBackdrop} onClick={closeNoModal}>
          <div className={styles.modal}>
            {userName}
            さんは、許可設定をoffにしています。
            <br />
            <br />
            メッセージで許可設定をonにしてもらうようお願いしてみましょう♪
            <br />
            <button onClick={closeNoModal} className={styles.ok}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChoiseModal;
