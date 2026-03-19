import styles from '@/styles/purchase/QuickChargeSuccessModal.module.css';

const homePic = '/banner/home_app_.webp';

// Image component removed (use <img> directly);

const successPic = '/situation.icon/success.webp';

import router from 'next/router';

type Props = {
  userName: string;
  point: number;
  onClose: () => void;
  isRegisteredEmail: boolean;
  isCall?: boolean;
};
const QuickChargeSuccessModal = ({
  userName,
  point,
  onClose,
  isRegisteredEmail,
  isCall,
}: Props) => {
  const onClickMail = () => {
    router.push('/setting/register-mail');
  };

  const onClickHomeApp = () => {
    router.push('/setting/iphone');
  };

  // モーダル外をクリックした時にモーダルを閉じる関数
  const handleBackdropClick = (event: { target: any; currentTarget: any }) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // モーダルコンテンツのクリックイベントがバブリングしないようにする
  const handleModalContentClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={handleModalContentClick}>
        <div className={styles.shadow}>
          <button className={styles.closeIcon} onClick={onClose}>
            ×
          </button>
          <center>
            <div className={styles.title}>ポイントの購入が完了しました</div>
            <Image
              src={successPic}
              alt="goBack"
              width={50}
              height={50}
              className={styles.mark}
            />
            {!isCall && (
              <div className={styles.point}>
                {userName}
                <span className={styles.sama}>様</span> <br />
                保有ポイント: <span className={styles.pt}>{point}</span>
                <span className={styles.sama}>pt</span>
              </div>
            )}
            {!isCall && !isRegisteredEmail && (
              <>
                <div className={styles.attention}>
                  メールアドレス未登録の場合、
                  <br />
                  保有ポイントが消失する可能性があります。
                </div>
                <button onClick={onClickMail} className={styles.closeButton}>
                  登録する
                </button>
              </>
            )}
            {!isCall && isRegisteredEmail && (
              <>
                <Image
                  src={homePic}
                  alt="メールアドレス未登録"
                  quality="100"
                  style={{
                    objectFit: 'contain',
                    width: '90%',
                    height: 'auto',
                    borderRadius: '3px',
                    maxWidth: '400px',
                  }}
                />
                <div className={styles.attention}>
                  Utageをホーム画面に追加して、
                  <br />
                  ログインをスムーズにしよう♪
                </div>
                <button onClick={onClickHomeApp} className={styles.closeButton}>
                  詳しく見る
                </button>
              </>
            )}
          </center>
        </div>
      </div>
    </div>
  );
};

export default QuickChargeSuccessModal;
