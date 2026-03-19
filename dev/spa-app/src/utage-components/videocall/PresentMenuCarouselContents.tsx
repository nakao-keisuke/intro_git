import type { Dispatch, SetStateAction } from 'react';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import { usePointStore } from '@/stores/pointStore';
import styles from '@/styles/videocall/LovenseCarouselContents.module.css';
import type { MessageWithType } from '@/types/MessageWithType';
import PresentCarouselItems from './PresentCarouselItems';

type Props = {
  presentMenuItems?: GetPresentMenuListResponseElementData[];
  onClose: () => void;
  receiverId: string;
  onSendMessageToChannel: ((message: any) => Promise<void>) | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  callType: 'live' | 'side_watch' | 'video';
  isPCView: boolean;
};

const LovenseCarouselContents = ({
  presentMenuItems,
  onClose,
  receiverId,
  onSendMessageToChannel,
  setLiveMessages,
  callType,
  isPCView,
}: Props) => {
  const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);

  return (
    <div>
      <div className={styles.label}>↓ プレゼントメニューを送ってみよう！</div>
      <div
        className={
          isPCView
            ? `${styles.PConetapmodal} relative z-[10001] max-h-[70vh] w-[90%] max-w-[600px] overflow-y-scroll rounded-[10px] bg-[rgba(39,39,39,0.88)] p-4 text-center`
            : styles.onetapmodal
        }
        onClick={(event) => event.stopPropagation()}
      >
        <PresentCarouselItems
          presentMenuItems={presentMenuItems || []}
          receiverId={receiverId}
          callType={callType}
          onClose={onClose}
          onSendMessageToChannel={onSendMessageToChannel}
          setLiveMessages={setLiveMessages}
          setCurrentPoint={setCurrentPoint}
        />
      </div>
    </div>
  );
};

export default LovenseCarouselContents;
