// Image component removed (use <img> directly);
import type React from 'react';
import { useEffect } from 'react';
import styles from '@/styles/TicketWonModal.module.css';

const ticketPic = '/page/ic_lovense_ticket.webp';

interface TicketWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: string;
  duration: number;
}

const TicketWonModal: React.FC<TicketWonModalProps> = ({
  isOpen,
  onClose,
  ticketType,
  duration,
}) => {
  // 5秒で自動的に閉じる
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.title}>
            <div className={styles.ticket}>
              <Image src={ticketPic} alt="ticket" width={40} height={25} />
              <span className={styles.ticketCount}>×1</span>
            </div>
            遠隔バイブチケットを
            <br />
            獲得しました！
          </div>

          <div className={styles.ticketInfo}>
            下記のメニューより使用できます。
          </div>

          <button className={styles.closeButton} onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketWonModal;
