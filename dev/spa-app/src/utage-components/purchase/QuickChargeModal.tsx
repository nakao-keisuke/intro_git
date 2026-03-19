// Image component removed (use <img> directly);
import styles from '@/styles/purchase/QuickChargeModal.module.css';

const pointPic = '/situation.icon/hover_p.webp';

type Props = {
  point: number;
  money: number;
  onClose: () => void;
  onClick: () => void;
  addedMessage?: string;
  isBonusExist: false;
  onAnotherCardClick?: () => void;
};

const QuickChargeModal = ({
  point,
  money,
  onClose,
  onClick,
  addedMessage,
  isBonusExist,
  onAnotherCardClick,
}: Props) => {
  const onClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const totalPoint = point;

  return (
    <div className={styles.modalBackdrop} onClick={onClickOutside}>
      <div className={styles.modalContent}>
        <div className={styles.shadow}>
          <div className={styles.title}>ワンタップでポイント追加</div>
          {addedMessage && <div className={styles.p}>{addedMessage}</div>}
          <div className={styles.purchase}>
            <center>
              <Image
                src={pointPic}
                alt="goBack"
                width={50}
                height={50}
                className={styles.mark}
              />
            </center>
            <div className={styles.totalpoint}>
              {totalPoint}
              <span className={styles.pt}>pt</span>
            </div>
            {isBonusExist && (
              <div className={styles.point}>
                {point}
                <span className={styles.spt}>pt</span>
              </div>
            )}
            <div className={styles.price}>
              <span className={styles.yen}>￥</span>
              {money}
            </div>
          </div>
          <center>
            <button className={styles.btn} onClick={onClick}>
              購入する
            </button>
            <div className={styles.p}>前回と同じカードでの購入となります</div>
            <div className={styles.p}>ボタンをタップすると購入が完了します</div>
            {onAnotherCardClick && (
              <div className={styles.anotherCard} onClick={onAnotherCardClick}>
                別のカードで購入する
              </div>
            )}
          </center>
        </div>
      </div>
    </div>
  );
};

export default QuickChargeModal;
