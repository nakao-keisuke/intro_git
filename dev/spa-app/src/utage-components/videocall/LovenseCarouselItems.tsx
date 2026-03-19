import { IconClock, IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import { type Dispatch, Fragment, type SetStateAction, useState } from 'react';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import { event } from '@/constants/ga4Event';
import type { MessageWithType } from '@/types/MessageWithType';
import { trackEvent } from '@/utils/eventTracker';
import { showPointAwareErrorToast } from '@/utils/pointShortageToast';
import { sendPostMenu } from '@/utils/sendLovenseMenu';

const ticketPic = '/page/ic_lovense_ticket.webp';
const lovenseIcon = '/lovense_pink.webp';

type LovenseMenuComponentProps = {
  lovenseMenuItems: LovenseMenuItem[];
  receiverId: string;
  callType: 'live' | 'side_watch' | 'video';
  onClose: () => void;
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  setLiveMessages: Dispatch<SetStateAction<MessageWithType[]>>;
  setCurrentPoint: (point: number) => void;
  onTicketUsed?: (() => void | Promise<void>) | undefined;
};

const LovenseCarouselItems: React.FC<LovenseMenuComponentProps> = ({
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

  type StrengthLevel = {
    type: string;
    borderClass: string;
    labelClass?: string;
    topMargin?: string;
  };

  const strengthLevels: StrengthLevel[] = [
    {
      type: 'weak',
      borderClass: 'border-emerald-300/70',
    },
    {
      type: 'medium',
      borderClass: 'border-amber-300/70',
    },
    {
      type: 'strong',
      borderClass: 'border-rose-300/70',
    },
    {
      type: 'pulse',
      borderClass: 'border-purple-300/70',
    },
    {
      type: 'wave',
      borderClass: 'border-sky-300/70',
      labelClass: 'text-[13px]',
    },
    {
      type: 'fireworks',
      borderClass: 'border-orange-300/70',
      labelClass: 'text-[12px]',
    },
    {
      type: 'earthquake',
      borderClass: 'border-violet-300/70',
      labelClass: 'text-[12px]',
    },
    {
      type: 'サイクロン',
      borderClass: 'border-pink-300/70',
      labelClass: 'text-[13px]',
    },
    {
      type: 'トルネード',
      borderClass: 'border-indigo-300/70',
      labelClass: 'text-[13px]',
    },
    {
      type: 'メテオ',
      borderClass: 'border-red-300/70',
    },
    {
      type: 'full_control',
      borderClass: 'border-fuchsia-300/70',
      labelClass: 'text-[12px]',
    },
  ];

  const renderStrengthLabel = (label?: string, type?: string) => {
    if (!label) return null;

    // 特定のタイプに対して特別な処理
    if (type === 'fireworks') {
      return (
        <>
          ファイアー
          <br />
          ワークス
        </>
      );
    }

    if (type === 'earthquake') {
      return (
        <>
          アース
          <br />
          クエイク
        </>
      );
    }

    // 通常の処理
    const lines = label.split(/\n|\\n/);
    return lines.map((line, index) => (
      <Fragment key={`${line}-${index}`}>
        {index > 0 && <br />}
        {line}
      </Fragment>
    ));
  };

  const handleSendPostMenu = async (item: LovenseMenuItem) => {
    if (isSending) return;
    setIsSending(true);
    onClose();

    try {
      const hasTicket = item.ticketCount && item.ticketCount > 0;
      const pointDisplay = hasTicket
        ? 'チケット使用'
        : `${item.consumePoint}pt`;
      const messageText = `Lovense:${item.duration}秒の${item.displayName}(${pointDisplay}) `;

      const success = await sendPostMenu({
        item,
        receiverId,
        callType,
        session,
        onSendMessageToChannel,
        setLiveMessages,
        setCurrentPoint,
        onTicketUsed,
        messageText,
        source: 'carousel',
        skipTracking: true,
        rethrowOnException: true,
      });

      if (!success) return;

      // GA4・Reproイベント送信（既存フォーマットを維持）
      if (callType === 'live' || callType === 'side_watch') {
        // ビデオチャット
        trackEvent(event.SEND_LOVENSE_IN_VIDEO_CHAT, {
          partner_id: receiverId,
          price: item.consumePoint,
          user_id: session?.user?.id,
          gift_name: item.displayName,
          call_type: callType,
        });
      } else if (callType === 'video') {
        // ビデオ通話
        trackEvent(event.SEND_LOVENSE_IN_VIDEO_CALL, {
          partner_id: receiverId,
          price: item.consumePoint,
          user_id: session?.user?.id,
          gift_name: item.displayName,
          call_type: callType,
        });
      }
    } catch (error) {
      console.error('投稿エラー:', error);
      if (callType === 'live' || callType === 'side_watch') {
        showPointAwareErrorToast('投稿エラーが発生しました');
      } else {
        alert('投稿エラーが発生しました');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-none">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src={lovenseIcon}
            alt="Lovense"
            width={17}
            height={17}
            className="h-6 w-6"
          />
          <h1 className="font-bold text-base text-white">Lovense メニュー</h1>
        </div>
        <button
          onClick={onClose}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700/50 transition hover:bg-gray-600/50"
        >
          <IconX className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Menu Grid  */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-4">
        {lovenseMenuItems.map((item) => {
          const strengthClass = strengthLevels.find(
            (level) => level.type === item.type,
          );
          const hasTicket = item.ticketCount === 1;
          const isFullControl = item.type === 'full_control';

          return (
            <div key={item.index} className="relative">
              <div className="w-full pb-[90%]" aria-hidden="true" />
              <button
                onClick={() => handleSendPostMenu(item)}
                disabled={isSending}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl border bg-white/12 px-0.5 py-0.5 text-white backdrop-blur transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  strengthClass?.borderClass || 'border-slate-500/60'
                } ${
                  isFullControl
                    ? 'shadow-[0_0_12px_rgba(236,72,153,0.35)] ring-2 ring-pink-400/70'
                    : ''
                } hover:border-white/50 hover:bg-white/16 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isFullControl && (
                  <span className="absolute -top-1.5 -right-5.5 rotate-45 rounded-full bg-pink-500 px-2 py-0.5 font-bold text-[10px] text-white shadow-md">
                    NEW
                  </span>
                )}
                {/* Level and Time combined */}
                <div
                  className={`flex flex-col items-center justify-center gap-0.5 text-center font-bold text-white leading-tight tracking-tight ${strengthClass?.labelClass || 'text-sm'} ${strengthClass?.topMargin || ''}`}
                >
                  <span className="break-words text-center">
                    {renderStrengthLabel(item.displayName, item.type)}
                  </span>
                  <div className="flex items-center text-[10px] text-gray-100/90">
                    <IconClock className="h-3 w-3" />
                    <span>{item.duration}秒</span>
                  </div>
                </div>

                {/* Cost */}
                <div className="flex items-center gap-1 text-sm">
                  {hasTicket ? (
                    <div className="flex items-center gap-1">
                      <Image
                        src={ticketPic}
                        alt="ticket"
                        width={16}
                        height={10}
                      />
                      <span className="text-white text-xs">×1</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/80 font-bold text-slate-900 text-xs">
                        P
                      </div>
                      <span className="font-semibold text-amber-300 text-sm">
                        {item.consumePoint}
                      </span>
                    </>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LovenseCarouselItems;
