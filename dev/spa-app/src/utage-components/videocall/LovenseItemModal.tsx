import type { Dispatch, SetStateAction } from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import { usePointStore } from '@/stores/pointStore';
import styles from '@/styles/videocall/PresentMenuModal.module.css';
import type { MessageWithType } from '@/types/MessageWithType';
import LovenseCarouselContents from './LovenseCarouselContents';

type Props = {
  lovenseMenuItems?: LovenseMenuItem[];
  onClose: () => void;
  receiverId: string;
  onSendMessageToChannel: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  callType: 'live' | 'side_watch' | 'video';
  isPCView: boolean;
  onTicketUsed?: () => void;
};

const LovenseItemsModal = ({
  lovenseMenuItems,
  onClose,
  receiverId,
  onSendMessageToChannel,
  setLiveMessages,
  callType,
  isPCView,
  onTicketUsed,
}: Props) => {
  const _setCurrentPoint = usePointStore((s) => s.setCurrentPoint);

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      {lovenseMenuItems && lovenseMenuItems.length > 0 ? (
        <LovenseCarouselContents
          lovenseMenuItems={lovenseMenuItems}
          onClose={onClose}
          receiverId={receiverId}
          onSendMessageToChannel={onSendMessageToChannel}
          setLiveMessages={setLiveMessages}
          callType={callType}
          isPCView={isPCView}
          onTicketUsed={onTicketUsed}
        />
      ) : null}
    </div>
  );
};

export default LovenseItemsModal;
