import styles from '@/styles/UtanoServiceEndModal.module.css';

type UtanoServiceEndModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const UtanoServiceEndModal: React.FC<UtanoServiceEndModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleClickOutside = (_e: React.MouseEvent<HTMLDivElement>) => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.modal_overlay}
      style={{ zIndex: 9999 }}
      onClick={handleClickOutside}
    >
      <div className={styles.modal_window}>
        <div className={styles.modal_close} onClick={() => onClose()}>
          ×
        </div>
        <div className={styles.success_message}>
          <h3>サービス移行のお知らせ</h3>
          <p>
            いつもUtanoをご利用いただき、誠にありがとうございます。
            この度、Utanoのサービスを
            <span>2025年6月16日(月)</span>
            をもちまして終了させていただく事となりました。
            <br />
            <br />
            今後は後継webブラウザサービスのUtageにてご利用が可能となります。
            <br />
            お手数ですが、下記ボタンより引き続きご利用いただけますと幸いです。
          </p>
          <a
            href="https://utage-web.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            Utageでログイン
          </a>
        </div>
      </div>
    </div>
  );
};

UtanoServiceEndModal.displayName = 'UtanoServiceEndModal';

export default UtanoServiceEndModal;
