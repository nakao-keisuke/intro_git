// TODO: i18n - import { useTranslations } from '#/i18n';
import styles from '@/styles/ErrorMessageModal.module.css';

type Props = {
  message: string;
  onClose: () => void;
};

const ErrorMessageModal = ({ message, onClose }: Props) => {
  const t = useTranslations('auth');

  return (
    <div>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.title}>{t('error')}</h3>

          <div className={styles.messageContainer}>
            <p className={styles.message}>{message}</p>
          </div>

          <div className={styles.buttonContainer}>
            <button onClick={onClose} className={styles.okButton}>
              {t('ok')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessageModal;
