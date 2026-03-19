import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import CallPointShortageModal from '@/components/purchase/CallPointShortageModal';
import { event } from '@/constants/ga4Event';
import {
  PRICING_INFO,
  type PricingInfo,
  type PricingLabel,
} from '@/constants/pricing';
import { useNativeMediaPermission } from '@/hooks/useNativeMediaPermission';
import { useMyPoint } from '@/hooks/usePollingData';
import { useRequest } from '@/hooks/useRequest';
import { useUIStore } from '@/stores/uiStore';
import styles from '@/styles/videocall/VideoTwoModal.module.css';
import { getOutgoingCallPath } from '@/utils/callView';
import { trackEvent } from '@/utils/eventTracker';
import { regionText } from '@/utils/region';
import RoundedThumbnail from '../RoundedThumbnail';

const formatPricingInfo = (pricing: PricingInfo) => {
  const { price, unit } = pricing;
  if (typeof price === 'number') {
    return unit ? `(${price}${unit})` : `(${price})`;
  }

  return unit ? `(${price}${unit})` : `(${price})`;
};

const formatPricingText = (label: PricingLabel, fallback: string) => {
  const pricing = PRICING_INFO.find((info) => info.label === label);
  if (!pricing) return fallback;

  return formatPricingInfo(pricing);
};

export default function CallSelectModal() {
  // Zustand store
  const isCallSelectModalOpen = useUIStore((s) => s.isCallSelectModalOpen);
  const callSelectModalData = useUIStore((s) => s.callSelectModalData);
  const closeCallSelectModal = useUIStore((s) => s.closeCallSelectModal);

  const handleClose = useCallback(() => {
    closeCallSelectModal();
    callSelectModalData?.onClose();
  }, [closeCallSelectModal, callSelectModalData]);

  const [showShortageModal, setShowShortageModal] = useState(false);
  const myPointData = useMyPoint();
  const myPoint: number | undefined = myPointData?.data?.point;
  const router = useRouter();

  const [showOkModal, setShowOkModal] = useState(false);
  const handleOkModalClose = () => {
    setShowOkModal(false);
    router.refresh();
  };

  const { checkAndRequestPermission } = useNativeMediaPermission();

  const { requestCall } = useRequest();

  if (!isCallSelectModalOpen || !callSelectModalData) return null;

  const videoCallPointText = formatPricingText('ビデオ通話', '(230pt/分)');
  const voiceCallPointText = formatPricingText('音声通話', '(160pt/分)');

  const {
    partnerId,
    userName,
    age,
    region,
    avatarId,
    about,
    onClose,
    isPurchased,
    isBonusCourseExist,
    videoCallWaiting,
    voiceCallWaiting,
    hasLovense,
    bustSize,
  } = callSelectModalData;

  const regionName = regionText(region);

  const showModalClose = (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const callRequestSend = async () => {
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

  const onClick = async () => {
    // Native環境の場合、許可チェック
    const hasPermission = await checkAndRequestPermission('video');
    if (!hasPermission) return;

    if (myPoint !== undefined && myPoint < 200) {
      setShowShortageModal(true);
      return;
    }

    handleJoin();
  };

  const handleJoin = async () => {
    // 発信時に選択モーダルを閉じる（画面遷移後に残らないように）
    handleClose();
    // fromパラメータで現在のパスを保持し、replaceで履歴に残さない
    const fromPath = encodeURIComponent(window.location.pathname);
    router.replace(
      getOutgoingCallPath('videoCallFromOutgoing') +
        '/' +
        partnerId +
        `?from=${fromPath}`,
    );
  };

  const onClickVoice = async () => {
    // Native環境の場合、許可チェック
    const hasPermission = await checkAndRequestPermission('voice');
    if (!hasPermission) return;

    if (myPoint !== undefined && myPoint < 140) {
      setShowShortageModal(true);
      return;
    }
    handleVoiceJoin();
  };

  const handleVoiceJoin = () => {
    // 発信時に選択モーダルを閉じる（音声通話で残る不具合対策）
    handleClose();
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
            <div className="flex justify-center">
              <button onClick={handleOkModalClose} className={styles.okok}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className={styles.overlay}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => showModalClose(e)}
      >
        <div className={`${styles.modal} md:max-w-md`}>
          <div className={`${styles.icon} relative`}>
            <RoundedThumbnail avatarId={avatarId} deviceCategory="mobile" />
          </div>
          <div className={styles.name}>{userName} </div>
          <div className={styles.region}>
            {regionName}　{age}歳
          </div>

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

          {/* 通話許可が両方オフの場合の処理を追加 */}
          {!videoCallWaiting && !voiceCallWaiting && (
            <div className={styles.noCallModal}>
              <p className={styles.modalMessage}>
                {userName}さんは、通話の許可設定をoffにしています。
              </p>
              <p className={styles.modalMessage}>
                メッセージでアピールしてみましょう♪
              </p>
            </div>
          )}
          <div style={{ marginTop: '30px' }}>
            <a onClick={handleClose} className={styles.close}>
              キャンセル
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
