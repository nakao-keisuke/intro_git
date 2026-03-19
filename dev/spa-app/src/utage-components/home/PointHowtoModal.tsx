import { memo, type ReactNode } from 'react';
import {
  isStreamingPricingInfo,
  PRICING_ADDITIONAL_INFO,
  PRICING_DISPLAY_NAMES,
  PRICING_INFO,
  STREAMING_PRICING_SORT_ORDER,
} from '@/constants/pricing';
import styles from '@/styles/home/PointHowtoModal.module.css';

type Props = {
  onClose: () => void;
  children?: ReactNode;
};

const ExplainModal: React.FC<Props> = memo(({ onClose }) => {
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleClickOutside}>
      <div className={styles.modalContent}>
        <p className={styles.title}>
          ポイント説明<span className={styles.sai}>業界最安値！</span>
        </p>
        <div className={styles.container}>
          <br />
          {PRICING_INFO.filter((item) => !isStreamingPricingInfo(item)).map(
            (item, index) => (
              <div key={item.label}>
                {index > 0 && <hr color="#cccccc" />}
                {PRICING_DISPLAY_NAMES[item.label] || item.label}：
                <span className={item.price === '無料' ? styles.a : styles.b}>
                  {item.price === '無料' ? (
                    '無料'
                  ) : (
                    <>
                      {item.price}
                      <span className={styles.bc}>{item.unit}</span>
                    </>
                  )}
                </span>
                {PRICING_ADDITIONAL_INFO[item.label] && (
                  <span className={styles.sai}>
                    {PRICING_ADDITIONAL_INFO[item.label]}
                  </span>
                )}
              </div>
            ),
          )}

          <hr color="#cccccc" />
          {PRICING_INFO.filter(isStreamingPricingInfo)
            .sort((a, b) => {
              const order = STREAMING_PRICING_SORT_ORDER;
              return order.indexOf(a.label) - order.indexOf(b.label);
            })
            .map((item, index) => (
              <div key={item.label}>
                {index > 0 && <hr color="#cccccc" />}
                {PRICING_DISPLAY_NAMES[item.label] || item.label}：
                <span className={item.price === '無料' ? styles.a : styles.b}>
                  {item.price === '無料' ? (
                    '無料'
                  ) : (
                    <>
                      {item.price}
                      <span className={styles.bc}>{item.unit}</span>
                    </>
                  )}
                </span>
              </div>
            ))}

          <hr color="#cccccc" />
          <span className={styles.d}>
            <p>※登録ボーナスは二度以上ご登録されている方は対象外です。</p>
          </span>
        </div>
        <center>
          <button onClick={onClose} className={styles.closeButton}>
            閉じる
          </button>
        </center>
      </div>
    </div>
  );
});

ExplainModal.displayName = 'ExplainModal';

export default ExplainModal;
