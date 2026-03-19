// Image component removed (use <img> directly);
import styles from '@/styles/chat/chatcontent/ImageModal.module.css';

const closeIcon = '/chat/close_btn.webp';
const logoPic = '/header/utage_logo.webp';

import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isNativeApplication } from '@/constants/applicationId';

type Props = {
  imageSrc: string;
  modalOpen: boolean;
  closeModal: () => void;
  isReload?: boolean;
};

const ImageModal = ({ imageSrc, modalOpen, closeModal, isReload }: Props) => {
  const router = useRouter();
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onCloseModal = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal();
      if (isReload) {
        router.refresh();
      }
    }
  };

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  if (!modalOpen || !portalContainer) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay} onClick={onCloseModal}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div
          className={styles.closeButton}
          onClick={() => {
            closeModal();
            if (isReload) {
              router.refresh();
            }
          }}
        >
          <Image src={closeIcon} width={30} height={30} alt="閉じる" />
        </div>
        <img src={imageSrc} className={styles.modalImage} />
        {/* サイトロゴ（Renkaアプリでは非表示） */}
        {!isNativeApplication() && (
          <Image
            src={logoPic}
            alt="サイトロゴ"
            placeholder="empty"
            width={80}
            height={50}
            style={{
              position: 'absolute',
              top: 11,
              left: 10,
            }}
          />
        )}
      </div>
    </div>,
    portalContainer,
  );
};

export default ImageModal;
