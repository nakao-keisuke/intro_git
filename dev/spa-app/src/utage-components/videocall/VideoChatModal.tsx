import { useRouter } from 'next/router';
import { useState } from 'react';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import {
  MIN_POINT_FOR_VIDEO_CHAT_VIEWING,
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';
import { useMyPoint } from '@/hooks/usePollingData';
import { useRequest } from '@/hooks/useRequest';
import styles from '@/styles/videocall/VideoChatModal.module.css';
import { getOutgoingCallPath } from '@/utils/callView';
import RoundedThumbnail from '../RoundedThumbnail';

type Props = {
  onClose: () => void;
  partnerId: string;
  userName: string;
  age: number;
  region: string;
  avatarId: string;
  about: string;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
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

const VideoChatModal = ({
  userName,
  age,
  region,
  avatarId,
  partnerId,
  onClose,
  about,
  videoCallWaiting,
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

  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const myPointData = useMyPoint();
  const myPoint: number | undefined = myPointData?.data?.point;
  const router = useRouter();
  const [showOkModal, setShowOkModal] = useState(false);
  const handleOkModalClose = () => {
    setShowOkModal(false);
    router.reload();
  };

  const videoChatPointText = formatPricingText(
    'ビデオチャット視聴',
    `${MIN_POINT_FOR_VIDEO_CHAT_VIEWING}pt/分`,
  );

  const { requestCall } = useRequest();

  const aboutText =
    about && about.length <= 30
      ? about
      : about
        ? `${about.slice(0, 30)}...`
        : '';

  const callRequestSend = async () => {
    const result = await requestCall(partnerId, 'videoChatFromOutgoing');
    if (!result.success) {
      alert(result.error);
      return;
    }
    setShowOkModal(true);
  };

  const openVideoChatModal = () => {
    if (myPoint !== undefined && myPoint < 200) {
      setNotEnoughPointModalOpen(true);
      return;
    }
    handleVideochatJoin();
  };

  const handleVideochatJoin = () => {
    // fromパラメータで現在のパスを保持し、replaceで履歴に残さない
    const fromPath = encodeURIComponent(window.location.pathname);
    router.replace(
      getOutgoingCallPath('videoChatFromOutgoing') +
        '/' +
        partnerId +
        `?from=${fromPath}`,
    );
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
  return (
    <div>
      {notEnoughPointModalOpen && (
        <AppPayNoModal onClose={() => setNotEnoughPointModalOpen(false)} />
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
            {region}　{age}歳
          </div>
          <div className={styles.about}>{aboutText}</div>
          <div className={styles.container}>
            <div>
              <div
                className={
                  videoCallWaiting ? styles.callbutton : styles.nobutton
                }
                onClick={openVideoChatModal}
              >
                <div>
                  <div className={styles.mo}>
                    ビデオチャット発信({videoChatPointText})
                    <br />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div
                className={
                  videoCallWaiting ? styles.videochatrequest : styles.norequest
                }
                onClick={callRequestSend}
              >
                <div>
                  <div className={styles.momo}>
                    ビデオチャットリクエスト(無料) <br />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a onClick={closeVideoChatModal} className={styles.close}>
            キャンセル
          </a>
        </div>
      </div>
    </div>
  );
};
export default VideoChatModal;
