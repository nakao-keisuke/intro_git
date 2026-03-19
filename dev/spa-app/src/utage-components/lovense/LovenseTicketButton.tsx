// Lovenseチケット使用ボタンコンポーネント

// Image component removed (use <img> directly);
import type React from 'react';
import { memo, useState } from 'react';
import styles from '@/styles/LovenseTicketButton.module.css';

const ticketIcon = '/page/ic_lovense_ticket.webp';

interface LovenseTicketButtonProps {
  receiverId: string;
  callType: 'video' | 'live';
  ticketCount: number;
  onTicketUsed: () => void;
  onSendMessageToChannel?: ((message: any) => Promise<void>) | undefined;
  onError?: (error: string) => void;
}

const LovenseTicketButton = memo<LovenseTicketButtonProps>(
  ({
    receiverId,
    callType,
    ticketCount,
    onTicketUsed,
    onSendMessageToChannel,
    onError,
  }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // チケットがない場合は表示しない
    if (ticketCount <= 0) {
      return null;
    }

    const handleTicketClick = async (event: React.MouseEvent) => {
      event.stopPropagation(); // イベント伝播を停止
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        // チケット使用処理をトリガー
        onTicketUsed();
        // チャットメッセージを送信（オプション）
        if (onSendMessageToChannel) {
          await onSendMessageToChannel({
            type: 'lovense_ticket_used',
            message: 'Lovense無料チケットを使用しました！',
          });
        }
      } catch (error) {
        console.error('Failed to use ticket:', error);
        if (onError) {
          onError('チケットの使用に失敗しました。再度お試しください。');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div
        className={styles.ticketButtonContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`${styles.ticketButton} ${
            isProcessing ? styles.processing : ''
          }`}
          onClick={handleTicketClick}
          disabled={isProcessing}
          aria-label={`Lovense無料チケット（残り${ticketCount}枚）`}
          title={`クリックして無料チケットを使用（残り${ticketCount}枚）`}
        >
          <div className={styles.ticketIconWrapper}>
            <Image
              src={ticketIcon}
              alt="チケット"
              width={35}
              height={35}
              className={styles.ticketIcon}
            />
            {ticketCount > 1 && (
              <span className={styles.ticketCount}>{ticketCount}</span>
            )}
          </div>
        </button>
      </div>
    );
  },
);

LovenseTicketButton.displayName = 'LovenseTicketButton';

export default LovenseTicketButton;
