// Image component removed (use <img> directly);
import ReactModal from 'react-modal';

const notificationPermissionImage = '/pwa/pwa_notification_permission.webp';

type Props = {
  onClose: (requestPermission: boolean) => void;
};

const NotificationModal = ({ onClose }: Props) => {
  const handleImageClick = () => {
    onClose(true);
  };

  return (
    <ReactModal
      isOpen
      onRequestClose={() => onClose(false)}
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      ariaHideApp={false}
      contentLabel="通知許可"
      overlayClassName="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      className="max-w-[90%]"
    >
      <Image
        src={notificationPermissionImage}
        alt="通知許可用モーダル画像"
        onClick={handleImageClick}
        className="aspect-square cursor-pointer rounded-[10px]"
        priority
      />
    </ReactModal>
  );
};

export default NotificationModal;
