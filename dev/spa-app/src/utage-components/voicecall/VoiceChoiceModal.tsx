import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import AppPayNoModal from '@/app/components/AppPayNoModal';
import { event } from '@/constants/ga4Event';
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
};

const VoiceChoiseModal = ({
  userName,
  age,
  region: regionCode,
  avatarId,
  partnerId,
  onClose,
  about,
  voiceCallWaiting,
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
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const nocallModal = () => {
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

  const callRequestSend = async () => {
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

  const onClick = () => {
    if (myPoint !== undefined && myPoint < 140) {
      setNotEnoughPointModalOpen(true);
      return;
    }

    handleJoin();
  };

  const handleJoin = async () => {
    // fromパラメータで現在のパスを保持し、replaceで履歴に残さない
    const fromPath = encodeURIComponent(window.location.pathname);
    router.replace(
      getOutgoingCallPath('voiceCallFromOutgoing') +
        '/' +
        partnerId +
        `?from=${fromPath}`,
    );
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
            {region(regionCode)}　{age}歳
          </div>
          <div className={styles.about}>{aboutText}</div>

          <div className={styles.container}>
            <div onClick={voiceCallWaiting ? onClick : nocallModal}>
              <div
                className={
                  voiceCallWaiting ? styles.voicebutton : styles.nobutton
                }
              >
                <div>
                  <div className={styles.mo}>
                    音声通話
                    <br />
                    <span className={styles.pt}>(160pt/分)</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div
                className={
                  voiceCallWaiting ? styles.voicebutton : styles.norequest
                }
                onClick={voiceCallWaiting ? callRequestSend : nocallModal}
              >
                <div>
                  <div className={styles.mo}>
                    音声通話リクエスト <br />
                    <span className={styles.pt}>(無料)</span>
                  </div>
                </div>
              </div>
            </div>
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

export default VoiceChoiseModal;
