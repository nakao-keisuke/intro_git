import type React from 'react';
import styles from '@/styles/PermissionModal.module.css';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'mic' | 'camera';
  permissionState: 'prompt' | 'granted' | 'denied';
}

const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  permissionState,
}) => {
  if (!isOpen) return null;

  const deviceName = type === 'mic' ? 'マイク' : 'カメラ';

  const getMessage = () => {
    switch (permissionState) {
      case 'granted':
        return `現在通話ができる状態です。通話をお楽しみください。`;
      case 'denied':
        return `${deviceName}の使用が拒否されています。通話機能を使用するには許可が必要です。`;
      default:
        return `通話機能を使用するために${deviceName}の使用を許可してください。`;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent}>
        {permissionState === 'granted' ? (
          <h3>{deviceName}の使用が許可されています。</h3>
        ) : (
          <h3>{deviceName}の使用許可が必要です</h3>
        )}
        <p>{getMessage()}</p>
        {permissionState === 'granted' ? (
          <div className={styles.buttonContainer}>
            <button onClick={onClose}>閉じる</button>
          </div>
        ) : (
          <div className={styles.buttonContainer}>
            <button onClick={onClose}>キャンセル</button>
            <button onClick={onConfirm}>設定する</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionModal;
