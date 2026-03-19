import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from '@/styles/profile/ProfileModal.module.css';
import type { PartnerInfo } from '@/types/PartnerInfo';

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partnerInfo: PartnerInfo;
};

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  partnerInfo,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !mounted) {
    return null;
  }

  const modalContent = (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <iframe
          src={`/profile/unbroadcaster/${partnerInfo.userId}?embedded=true`}
          title="プロフィール詳細"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

ProfileModal.displayName = 'ProfileModal';

export default ProfileModal;
