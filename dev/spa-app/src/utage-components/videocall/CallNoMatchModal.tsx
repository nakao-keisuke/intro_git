// Image component removed (use <img> directly);
import { memo } from 'react';
import { useUIStore } from '@/stores/uiStore';
import styles from '@/styles/videocall/CallNomatchModal.module.css';

const CallNoMatchModal = memo(() => {
  const isDeclined = useUIStore((s) => s.isDeclinedLiveCall);
  const setIsDeclinedLiveCall = useUIStore((s) => s.setIsDeclinedLiveCall);
  const closeModal = () => {
    setIsDeclinedLiveCall(false);
  };
  if (!isDeclined) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.modal}>
        <div className={styles.title}>お相手は通話中です</div>
        <center className={styles.img}>
          <Image
            src="/character/p16.webp"
            width={120}
            height={100}
            alt="error"
          />
        </center>
        <button type="button" onClick={closeModal} className={styles.ok}>
          OK
        </button>
      </div>
    </div>
  );
});
export default CallNoMatchModal;

CallNoMatchModal.displayName = 'CallNoMatchModal';
