import { useNavigate } from '@tanstack/react-router';
import styles from '@/styles/PurchaseSuccessModal.module.css';

type Props = {
  onClose: () => void;
  mediaType: 'video' | 'image';
  transactionId?: string | undefined;
};

const PurchaseSuccessModal = ({ onClose, mediaType, transactionId }: Props) => {
  const router = useRouter();

  return (
    <div>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal}>
          <h3 className={styles.title}>購入しました！</h3>
          <div className={styles.content}>
            動画・画像の「開封済み」から
            <br />
            いつでも確認できます♪
          </div>
          <div className={styles.buttonContainer}>
            {transactionId && (
              <button
                onClick={() => {
                  onClose();
                  router.push(
                    `/fleamarket/purchase-confirmation/${transactionId}`,
                  );
                }}
                className={styles.viewDetails}
              >
                詳細を見る
              </button>
            )}
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
