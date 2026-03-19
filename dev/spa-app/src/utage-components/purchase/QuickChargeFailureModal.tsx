import styles from '@/styles/mypage/ContactModal.module.css';
import type { ErrorData } from '@/types/NextApi';

type Props = {
  errorData: ErrorData;
  userId: string;
  onClose: () => void;
};
const QuickChargeFailureModal = ({ errorData, userId, onClose }: Props) => {
  return (
    <div
      className={styles.modalBackdrop}
      onClick={() => {
        if (!errorData.isNeedToShowAxesCustomerSupportInfo) {
          onClose;
        }
      }}
    >
      <div className={styles.modalContent}>
        <center>
          <p className={styles.title}>ポイント購入に失敗しました</p>
          <div>{errorData.message}</div>
          {errorData.isNeedToShowAxesCustomerSupportInfo && (
            <>
              <br />
              <div>axes paymentカスタマーサポート</div>
              <div>(年中無休)</div>
              <div>
                電話番号:　
                <a
                  href="tel:0570036000"
                  style={{
                    textDecoration: 'underline',
                    color: 'blue',
                    cursor: 'pointer',
                  }}
                >
                  0570-03-6000
                </a>
              </div>
              <div>
                E-mail:　
                <a
                  href={`mailto:creditinfo@axes-payment.co.jp?subject=Miyabi(1014001647)でのクイックチャージ失敗について&body=Miyabi(1014001647)でのクイックチャージに失敗しました。%0d%0A決済失敗の理由と、決済するための方法について教えていただきたいです。%0d%0A ID(sendid): ${userId} %0d%0A　`}
                  style={{
                    textDecoration: 'underline',
                    color: 'blue',
                    cursor: 'pointer',
                  }}
                >
                  creditinfo@axes-payment.co.jp
                </a>
              </div>
            </>
          )}
        </center>

        <center>
          <button onClick={onClose} className={styles.closeButton}>
            閉じる
          </button>
        </center>
      </div>
    </div>
  );
};

export default QuickChargeFailureModal;
