import { memo } from 'react';
import { useCallStore } from '@/stores/callStore';
import { useUIStore } from '@/stores/uiStore';
import styles from '@/styles/videocall/StopCallModal.module.css';
import { type CallType, getCallView } from '@/utils/callView';

type Props = {
  onLeave: () => Promise<void>;
  callType: CallType;
};

const StopCallModal = memo(({ onLeave, callType }: Props) => {
  const callView = getCallView(callType);
  const isToShow = useUIStore((s) => s.isStopCallModalOpen);
  const closeStopCallModal = useUIStore((s) => s.closeStopCallModal);
  const callDurationSec = useCallStore((s) => s.callDurationSec);
  const stopModalText =
    callDurationSec === undefined && callView.type === 'videoCallFromOutgoing'
      ? '通話発信中です。終了しますか？'
      : callView.stopModalText;
  const onCancel = () => {
    closeStopCallModal();
  };
  const onStop = async () => {
    closeStopCallModal();
    await onLeave();
  };
  if (!isToShow) return null;
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal}>
        <div>{stopModalText}</div>
        <div className={styles.buttonContainer}>
          <button type="button" onClick={onCancel} className={styles.cansel}>
            キャンセル
          </button>
          <button type="button" onClick={onStop} className={styles.end}>
            終了する
          </button>
        </div>
      </div>
    </div>
  );
});

export default StopCallModal;

StopCallModal.displayName = 'StopCallModal';
