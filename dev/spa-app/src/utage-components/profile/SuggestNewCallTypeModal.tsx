// Image component removed (use <img> directly);
import { memo } from 'react';
import styles from '@/styles/profile/SuggestNewCallTypeModal.module.css';
import type { LiveCallView } from '@/utils/callView';

type Props = {
  newCallView: LiveCallView;
  onClickAction: () => void;
  onClickCancel: () => void;
};

const SuggestNewCallTypeModal = memo(
  ({ newCallView, onClickAction, onClickCancel }: Props) => {
    return (
      <div className={styles.overlay} onClick={onClickCancel}>
        <div className={styles.modal}>
          <div className={styles.title}>
            お相手は{newCallView.statusText}です。{newCallView.promptText}
          </div>
          <center className={styles.img}>
            <Image
              src="/character/p16.webp"
              width={120}
              height={100}
              alt="error"
            />
          </center>
          <div
            onClick={onClickAction}
            className={`${styles.ok} ${styles[newCallView.type]}`}
          >
            <div>
              <Image
                src="/point_white.webp"
                width="24"
                height="24"
                alt="通話アイコン"
              />
              {newCallView.actionButtonText}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
export default SuggestNewCallTypeModal;

SuggestNewCallTypeModal.displayName = 'SuggestNewCallTypeModal';
