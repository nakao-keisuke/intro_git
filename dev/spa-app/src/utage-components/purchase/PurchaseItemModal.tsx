import { useRouter } from 'next/router';
import styles from '@/styles/PurchaseSuccessModal.module.css';

type Props = {
  onClose: () => void;
  transactionId?: string | undefined;
  partnerId?: string | undefined;
};

const PurchaseSuccessModal = ({ onClose, transactionId, partnerId }: Props) => {
  const router = useRouter();

  const onClickChat = () => {
    if (partnerId) {
      router.push(`/message/${partnerId}`);
      onClose();
    }
  };

  return (
    <div>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <h3 className={styles.title}>購入しました！</h3>
          <div className={styles.content}>
            取引詳細ページから
            <br />
            いつでも確認できます♪
          </div>
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClickChat}
              className={styles.chatButton}
              disabled={!partnerId}
            >
              メッセージを送る
            </button>
            <button onClick={onClose} className={styles.charge}>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessModal;
