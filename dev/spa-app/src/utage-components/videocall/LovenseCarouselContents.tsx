import type { Dispatch, SetStateAction } from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import { usePointStore } from '@/stores/pointStore';
import styles from '@/styles/videocall/LovenseCarouselContents.module.css';
import type { MessageWithType } from '@/types/MessageWithType';
import LovenseCarouselItems from './LovenseCarouselItems';

type Props = {
  lovenseMenuItems?: LovenseMenuItem[];
  onClose: () => void;
  receiverId: string;
  onSendMessageToChannel: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  callType: 'live' | 'side_watch' | 'video';
  isPCView: boolean;
  onTicketUsed?: (() => void | Promise<void>) | undefined;
};

const LovenseCarouselContents = ({
  lovenseMenuItems,
  onClose,
  receiverId,
  onSendMessageToChannel,
  setLiveMessages,
  callType,
  isPCView,
  onTicketUsed,
}: Props) => {
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);

  // PC版ではbackdropなしで中身だけをレンダリング
  if (isPCView) {
    return (
      <>
        <div className={styles.label}>
          <img src="/lovense_pink.webp" alt="lovense" className={styles.img} />↓
          Lovense（遠隔バイブ）を使ってみよう！
        </div>
        <div className="w-full">
          <LovenseCarouselItems
            lovenseMenuItems={lovenseMenuItems || []}
            receiverId={receiverId}
            callType={callType}
            onClose={onClose}
            onSendMessageToChannel={onSendMessageToChannel}
            setLiveMessages={setLiveMessages}
            setCurrentPoint={setCurrentPoint}
            onTicketUsed={onTicketUsed}
          />
        </div>
      </>
    );
  }

  // モバイル版は既存の実装
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.label}>
        <img src="/lovense_pink.webp" alt="lovense" className={styles.img} />↓
        Lovense（遠隔バイブ）を使ってみよう！
      </div>
      <div
        className={styles.onetapmodal}
        onClick={(event) => event.stopPropagation()}
      >
        <LovenseCarouselItems
          lovenseMenuItems={lovenseMenuItems || []}
          receiverId={receiverId}
          callType={callType}
          onClose={onClose}
          onSendMessageToChannel={onSendMessageToChannel}
          setLiveMessages={setLiveMessages}
          setCurrentPoint={setCurrentPoint}
          onTicketUsed={onTicketUsed}
        />
      </div>
    </div>
  );
};

export default LovenseCarouselContents;
