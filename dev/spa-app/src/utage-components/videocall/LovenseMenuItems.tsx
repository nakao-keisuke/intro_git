import { IconBolt } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import { type Dispatch, type SetStateAction, useState } from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import styles from '@/styles/videocall/ModalItem.module.css';

const ticketPic = '/page/ic_lovense_ticket.webp';

import type { MessageWithType } from '@/types/MessageWithType';
import { sendPostMenu } from '@/utils/sendLovenseMenu';

type LovenseMenuComponentProps = {
  lovenseMenuItems: LovenseMenuItem[];
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  onClose: () => void;
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: Dispatch<SetStateAction<number>>;
  onTicketUsed?: (() => void) | undefined;
};

const LovenseMenuComponent: React.FC<LovenseMenuComponentProps> = ({
  lovenseMenuItems,
  receiverId,
  callType,
  onSendMessageToChannel,
  setLiveMessages,
  setCurrentPoint,
  onClose,
  onTicketUsed,
}) => {
  const [isSending, setIsSending] = useState(false);
  const { data: session } = useSession();

  const strengthLevels = [
    { type: 'weak' },
    { type: 'medium', className: styles.medium },
    { type: 'strong', className: styles.high },
    { type: 'pulse', className: styles.special },
    { type: 'wave', className: styles.special },
    { type: 'fireworks', className: styles.special },
    { type: 'earthquake', className: styles.special },
    { type: 'サイクロン', className: styles.special },
    { type: 'トルネード', className: styles.special },
    { type: 'メテオ', className: styles.special },
  ];

  const handleSendPostMenu = async (item: LovenseMenuItem) => {
    if (isSending) {
      return;
    }
    setIsSending(true);

    try {
      const _success = await sendPostMenu({
        item,
        receiverId,
        callType,
        session,
        onSendMessageToChannel,
        setLiveMessages,
        setCurrentPoint,
        onTicketUsed,
        source: 'menu_items',
        rethrowOnException: true,
      });

      // sendPostMenu内でイベント送信済み
    } catch (error) {
      console.error('[ラブンスメニューデバッグ] 投稿エラー:', error);
      alert('投稿エラーが発生しました');
    } finally {
      onClose();
      setIsSending(false);
    }
  };

  return (
    <center>
      <div className={styles.carouselWrapper}>
        <ul>
          {lovenseMenuItems.map((item) => {
            const strengthClass = strengthLevels.find(
              (level) => level.type === item.type,
            )?.className;
            const hasTicket = item.ticketCount === 1;
            return (
              <li key={item.index} className={styles.list}>
                <button
                  onClick={() => handleSendPostMenu(item)}
                  disabled={isSending}
                  className={styles.button}
                >
                  <div className={styles.flex}>
                    <div className={styles.left}>
                      {item.duration}秒 <span className={styles.bou}>|</span>
                      <span className={strengthClass}>
                        {item.displayName}
                        {item.type === 'strong' && (
                          <IconBolt size={16} style={{ marginLeft: '4px' }} />
                        )}
                      </span>
                    </div>
                    <div className={styles.pt}>
                      {item.consumePoint}
                      <span className={styles.smallPt}>pt</span>
                    </div>
                    {hasTicket && (
                      <div className={styles.ticket}>
                        <Image
                          src={ticketPic}
                          alt="ticket"
                          width={40}
                          height={25}
                        />
                        <span className={styles.ticketCount}>×1</span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </center>
  );
};

export default LovenseMenuComponent;
