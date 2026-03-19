// Image component removed (use <img> directly);
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import styles from '@/styles/profile/FixedPartnerButtonCard.module.css';
import type { PartnerInfo } from '@/types/PartnerInfo';
import { regionNumber } from '@/utils/region';
import VideoChoiceModal from '../videocall/VideoChoiceModal';
import VoiceChoiceModal from '../voicecall/VoiceChoiceModal';

type Props = {
  onClick: () => void;
  partnerId: string;
  partnerInfo: PartnerInfo;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  onClose: () => void;
  canSendOneTapMessage: boolean;
  isPurchased: boolean;
  isBonusCourseExist: boolean;
};

const FixedPartnerButtonCard = ({
  partnerInfo,
  partnerId,
  videoCallWaiting,
  isPurchased,
  isBonusCourseExist,
}: Props) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();
  const handleChoiceModalOpen = () => {
    setActiveModal('choice');
  };

  const handleVideoCallModalOpen = () => {
    setActiveModal('videoCall');
  };

  const closeChoiseModal = () => {
    setActiveModal(null);
  };

  const _nocallModal = () => {
    setActiveModal('no');
  };

  const normalMessage = () => {
    router.push(`/message/${partnerId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.btn}>
        <div>
          <div className={styles.button} onClick={normalMessage}>
            <div>
              <Image
                src="/situation.icon/chat.webp"
                width="20"
                height="20"
                alt="メッセージアイコン"
                style={{ marginLeft: '-5px' }}
              />
              メッセージ
            </div>
          </div>
        </div>

        {activeModal === 'choice' && (
          <VoiceChoiceModal
            partnerId={partnerInfo.userId}
            userName={partnerInfo.userName}
            age={partnerInfo.age}
            region={regionNumber(partnerInfo.region)}
            avatarId={partnerInfo.avatarId}
            about={partnerInfo.about || ''}
            onClose={closeChoiseModal}
            isPurchased={isPurchased}
            isBonusCourseExist={isBonusCourseExist}
            voiceCallWaiting={!!partnerInfo.voiceCallWaiting}
            videoCallWaiting={!!partnerInfo.videoCallWaiting}
          />
        )}

        {activeModal === 'videoCall' && (
          <VideoChoiceModal
            partnerId={partnerInfo.userId}
            userName={partnerInfo.userName}
            age={partnerInfo.age}
            region={regionNumber(partnerInfo.region)}
            avatarId={partnerInfo.avatarId}
            about={partnerInfo.about || ''}
            onClose={closeChoiseModal}
            isPurchased={isPurchased}
            isBonusCourseExist={isBonusCourseExist}
            voiceCallWaiting={false}
            videoCallWaiting={!!partnerInfo.videoCallWaiting}
          />
        )}

        {partnerInfo.voiceCallWaiting ? (
          <div>
            <div className={styles.voicebutton} onClick={handleChoiceModalOpen}>
              <div>
                <Image
                  src="/chat/call.webp"
                  width="19"
                  height="19"
                  alt="音声通話アイコン"
                  style={{ position: 'relative', marginLeft: '-20px' }}
                />
                <div className={styles.videomo}>
                  音声通話
                  <div className={styles.pt}>リクエスト無料</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginLeft: '8%' }} className={styles.nobutton}>
              <div>
                <Image
                  src="/chat/call_no.webp"
                  width="19"
                  height="19"
                  alt="音声通話アイコン"
                  style={{ position: 'relative', marginLeft: '-20px' }}
                />
                <div className={styles.videomo}>
                  音声通話
                  <div className={styles.pt}>リクエスト無料</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {videoCallWaiting ? (
          <div>
            <div
              className={styles.videobutton}
              onClick={handleVideoCallModalOpen}
            >
              <div>
                <Image
                  src="/chat/video.webp"
                  width="19"
                  height="19"
                  alt="ビデオ通話アイコン"
                  style={{ position: 'relative', marginLeft: '-20px' }}
                />
                <div className={styles.videomo}>
                  ビデオ通話
                  <div className={styles.pt}>リクエスト無料</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginLeft: '16%' }} className={styles.nobutton}>
              <div>
                <Image
                  src="/chat/video_no.webp"
                  width="19"
                  height="19"
                  alt="ビデオ通話アイコン"
                  style={{ position: 'relative', marginLeft: '-20px' }}
                />
                <div className={styles.videomo}>
                  ビデオ通話
                  <div className={styles.pt}>リクエスト無料</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedPartnerButtonCard;
