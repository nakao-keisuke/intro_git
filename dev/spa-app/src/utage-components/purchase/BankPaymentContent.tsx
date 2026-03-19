import { useState } from 'react';
import Modal from '@/components/mypage/ContactModal';
import styles from '@/styles/Bank.module.css';

type Props = {
  userId: string;
  userName: string;
};

const BankPaymentContent = ({ userId, userName }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedCourseAmount, setSelectedCourseAmount] = useState('');

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const bankopen = (amount: any) => {
    setSelectedCourseAmount(amount);
    setIsBankModalOpen(true);
  };

  const bankClose = () => {
    setIsBankModalOpen(false);
  };

  return (
    <div className={styles.back}>
      <div className={styles.infoContainer}>
        <div className={styles.box1}>
          <h2 className={styles.h2}>銀行振り込み</h2>
          <p>
            <span className={styles.top}>
              最寄りの銀行・ATM、ネットバンクからのお振込でポイントを追加できる決済方法です。
            </span>
          </p>
          <h3 className={styles.howto}>チャージコース</h3>
          <div className={styles.otoku}>いつでもポイント最大40%お得！</div>

          <div
            className={`${styles.a} ${styles.animateContainer}`}
            onClick={() => bankopen('10,000')}
          >
            <p className={`${styles.ninki} ${styles.animateText}`}>
              一番おトク
            </p>
            <div className={styles.priceContainer}>
              <p className={styles.yen0}>￥</p>
              <p className={styles.number0}>10,000</p>
            </div>
            <div className={styles.text}>
              <div className={styles.special}>
                <p className={styles.specialPrice}>
                  8,000
                  <span className={styles.pt}>pt</span>
                </p>
              </div>
            </div>
          </div>

          <div className={styles.c} onClick={() => bankopen('4,900')}>
            <div className={styles.priceContainer}>
              <p className={styles.yen0}>￥</p>
              <p className={styles.number0}>4,900</p>
            </div>
            <div className={styles.text}>
              <div className={styles.special}>
                <p className={styles.specialPrice}>
                  3,600
                  <span className={styles.pt}>pt</span>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.e} onClick={() => bankopen('2,900')}>
            <div className={styles.priceContainer}>
              <p className={styles.yen0}>￥</p>
              <p className={styles.number0}>2,900</p>
            </div>
            <div className={styles.text}>
              <div className={styles.special}>
                <p className={styles.specialPrice}>
                  2,000
                  <span className={styles.pt}>pt</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.box2}>
        <h2 className={styles.h2}>決済手順</h2>
        <ul className={styles.ul}>
          <li>
            <span className={styles.dot}>1.</span>
            希望コースをタップします。
          </li>
          <li>
            <span className={styles.dot}>2.</span>
            「振り込み口座を確認する」ボタンより問い合わせ画面に進み、自動挿入される文章をそのまま送信してください。
          </li>

          <li>
            <span className={styles.dot}>3.</span>
            指定の振込口座が案内されますので、購入したいコースに応じた金額をお振り込み下さい。
          </li>
          <li>
            <span className={styles.dot}>4.</span>
            お振込完了後に、ご自身の口座名義を記載の上、再度ご連絡をお願いします。確認後、ポイントに反映されます。
          </li>
        </ul>
      </div>
      <div className={styles.box3}>
        <h2 className={styles.h2}>注意事項</h2>
        <ul className={styles.ul}>
          <li>
            <span className={styles.dot}>●</span>
            お振込手数料はお客様負担となります。
          </li>
          <li>
            <span className={styles.dot}>●</span>
            銀行からデータが届くまでお時間をいただく場合がございます。
          </li>
          <li>
            <span className={styles.dot}>●</span>
            お振込完了後のご連絡をもってポイント追加となりますのでご注意ください。
          </li>
        </ul>
      </div>
      {isModalOpen && (
        <Modal
          onClose={handleModalClose}
          userId={userId || ''}
          userName={userName || ''}
          courseAmount={selectedCourseAmount}
        ></Modal>
      )}
      {isBankModalOpen && (
        <div className={styles.modalBackdrop} onClick={bankClose}>
          <div className={styles.modalContent}>
            <div className={styles.close} onClick={bankClose}>
              ×
            </div>
            {selectedCourseAmount}円コースの銀行振り込み購入をご希望ですか？
            <br /> <br />
            LINEかメールより、自動挿入される文言をそのまま送信し返信をお待ちください。
            <div onClick={handleModalOpen} className={styles.button}>
              振り込み口座を確認する
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankPaymentContent;
