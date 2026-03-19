import type React from 'react';
import { memo, useEffect, useState } from 'react';
import styles from '@/styles/EmailConfirmationModal.module.css';

export const emailConfirmationModalMessageKey = 'emailConfirmationMessage';

const EmailConfirmationModal: React.FC<{}> = memo(({}) => {
  const [message, setMessage] = useState<string>('');
  useEffect(() => {
    const message = sessionStorage.getItem(emailConfirmationModalMessageKey);
    if (message) {
      sessionStorage.removeItem(emailConfirmationModalMessageKey);
      setMessage(message);
    }
  }, []);
  const onClose = () => {
    setMessage('');
  };
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  if (!message) return null;
  return (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <center>
          <p className={styles.title}>{message}</p>
          <span onClick={onClose} className={styles.close}>
            閉じる
          </span>
        </center>
      </div>
    </div>
  );
});

EmailConfirmationModal.displayName = 'EmailConfirmationModal';

export default EmailConfirmationModal;
