import { IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import {
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-toastify';
import {
  type FleaMarketItemWithFavorites,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import type { LovenseMenuItem } from '@/apis/http/lovense';
import { LovenseFullControlModal } from '@/components/LovenseFullControlModal';
import {
  GET_FLEA_MARKET_ITEM_LIST,
  GET_USER_INF_FOR_WEB_WITH_USER_ID,
  HTTP_GET_LOVENSE_MENU_LIST,
  HTTP_GET_PRESENT_MENU_LIST,
} from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { useFleaMarketStore } from '@/features/fleamarket/store/fleaMarketStore';
import { useLiveStore } from '@/features/live/store/liveStore';
import type { LovenseRtmUpdateMessage } from '@/features/lovense/store/lovenseStore';
import { useLovenseStore } from '@/features/lovense/store/lovenseStore';
import { useDateChangeDetector } from '@/hooks/useDateChangeDetector.hook';
import { useFreeActionSequence } from '@/hooks/useFreeActionSequence.hook';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { useLiveChatService } from '@/hooks/useLiveChatService';
import { usePromotedFleaMarketItem } from '@/hooks/usePromotedFleaMarketItem';
import { useTranslate } from '@/hooks/useTranslate';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import { usePointStore } from '@/stores/pointStore';
import styles from '@/styles/videocall/LiveChatArea.module.css';
import type { MessageWithType } from '@/types/MessageWithType';
import type { ResponseData } from '@/types/NextApi';
import type { LiveCallType } from '@/utils/callView';
import { trackEvent } from '@/utils/eventTracker';
import { postToNext } from '@/utils/next';
import FleaMarketButton from './FleaMarketButton';
import type { ItemDataForPurchase } from './FleaMarketItemDetailCompact';
import FleaMarketItemOverlay from './FleaMarketItemOverlay';
import FleaMarketLatestItem from './FleaMarketLatestItem';
import FleaMarketModal from './FleaMarketModal';
import type { FleaMarketPurchaseCompleteData } from './FleaMarketPurchaseCompact';
import LovenseCarouselContents from './LovenseCarouselContents';
import { LovenseSequenceOverlay } from './LovenseSequenceOverlay';
import MenuItemsModal from './MenuItemsModal';

type Props = {
  onSendMessageToChannel?:
    | ((message: Record<string, unknown>) => Promise<void>)
    | undefined;
  receiverId: string;
  channelId: string;
  liveCallType: Exclude<LiveCallType, 'videoCallFromStandby'>;
  isVisible: boolean;
  isPCView?: boolean;
  broadcasterName?: string;
  broadcasterAbout?: string;
  onFullControlActiveChange?: (isActive: boolean) => void;
};

// キーボード対応の定数
const INPUT_BAR_HEIGHT = 80; // 入力バーの高さ
const FLEA_MARKET_LATEST_ITEM_HEIGHT = 93; // 最新商品カードの高さ（画像64px + padding）

// 正規表現を定数化（パフォーマンス改善）
const PREFIXED_TEXT_REGEX = /^[^\s:：]{1,32}\s*[:：]\s*/;
const LOVENSE_MESSAGE_REGEX =
  /\d+秒の(弱|中|強|パルス|ウェーブ|ファイヤーワークス|アースクエイク|サイクロン|トルネード|メテオ)/;
const LOVENSE_PARSE_REGEX =
  /^(.+?)[:：]\s*(?:Lovense[:：])?(\d+)秒の(.+?)(?:\(.*\))?\s*$/;

// Lovenseメッセージかどうかを判定するヘルパー関数
const isLovenseMessage = (text: string): boolean => {
  return LOVENSE_MESSAGE_REGEX.test(text);
};

// テキストが既に「名前: 本文」形式かどうかを判定
const isAlreadyPrefixed = (text: string): boolean => {
  return PREFIXED_TEXT_REGEX.test(text);
};

// Lovenseメッセージから短縮表示用のテキストを抽出
// 例: "ちょこ: Lovense:10秒の弱(100pt)" → { userName: "ちょこ", duration: "10秒", type: "弱" }
// 変更後 - 「Lovense:」なしでも対応
const parseLovenseMessage = (
  text: string,
): { userName: string; duration: string; type: string } | null => {
  const match = text.match(LOVENSE_PARSE_REGEX);
  if (match?.[1] && match[2] && match[3]) {
    return { userName: match[1], duration: `${match[2]}秒`, type: match[3] };
  }
  return null;
};

// メッセージの表示テキストをフォーマット
const formatDisplayText = (msg: MessageWithType): string => {
  const text = msg.text ?? '';
  const senderName = msg.sender_name;
  // 入室メッセージ（送信側で名前未埋め込みの場合に対応）
  if (text.includes('さんが入室しました！')) {
    if (text.startsWith('さんが入室しました！') && senderName) {
      return `${senderName}${text}`;
    }
    return text;
  }
  // 既に「名前: 本文」形式ならそのまま
  if (isAlreadyPrefixed(text)) return text;
  // sender_name があれば付与
  if (senderName) return `${senderName}: ${text}`;
  return text;
};

const getMessageKey = (message: MessageWithType): string => {
  const senderKey = message.sender_id ?? message.sender_name ?? 'system';
  return `${message.type}:${senderKey}:${message.text}`;
};

// 自動メッセージの遅延時間
const AUTO_MESSAGE_DELAY = 1800;

// プロフィールメッセージの最大行数
const MAX_PROFILE_LINES = 6;

// プロフィールテキストを最大行数に制限
const truncateToMaxLines = (text: string, maxLines: number): string => {
  const lines = text.split('\n');
  if (lines.length <= maxLines) {
    return text;
  }
  return `${lines.slice(0, maxLines).join('\n')}...`;
};

// サブコンポーネント: メッセージリスト
type MessageListProps = {
  liveMessages: MessageWithType[];
  messagesEndRef: React.RefObject<HTMLLIElement | null>;
};

const MessageList = memo<MessageListProps>(
  ({ liveMessages, messagesEndRef }) => {
    return (
      <ul className={styles.messageList}>
        {liveMessages.map((message) => (
          <li key={getMessageKey(message)} className={styles.messageItem}>
            {message.type === 'divider' ? (
              <div className={styles.divider}>{message.text}</div>
            ) : (
              <span className={styles.messageContent}>
                {formatDisplayText(message)}
              </span>
            )}
          </li>
        ))}
        <li ref={messagesEndRef as React.RefObject<HTMLLIElement>} />
      </ul>
    );
  },
);
MessageList.displayName = 'MessageList';

// サブコンポーネント: 入力フィールド
type MessageInputProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
  onClick: () => void;
};

const MessageInput = memo<MessageInputProps>(
  ({
    inputValue,
    setInputValue,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    onClick,
  }) => (
    <div className={styles.commentContainer}>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="メッセージでやり取りしよう！（無料）"
        className={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      <div className={styles['send-button']} onClick={onClick}>
        <Image src="/chat/send.webp" alt="送信マーク" width="20" height="20" />
      </div>
    </div>
  ),
);
MessageInput.displayName = 'MessageInput';

// サブコンポーネント: プレゼントボタン（縦並び用）
type PresentButtonProps = {
  onClick: () => void;
};

const PresentButton = memo<PresentButtonProps>(({ onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={styles.onetap}
  >
    <Image
      src="/live/menu.webp"
      alt="プレゼントメニューマーク"
      width="40"
      height="40"
    />
    <span>おねだり</span>
  </button>
));
PresentButton.displayName = 'PresentButton';

// サブコンポーネント: Lovenseボタン（縦並び用）
type LovenseButtonProps = {
  onClick: () => void;
};

const LovenseButton = memo<LovenseButtonProps>(({ onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={styles.onetap}
  >
    <Image src="/lovense_new.webp" alt="ラブンス" width="40" height="40" />
    <span>Lovense</span>
  </button>
));
LovenseButton.displayName = 'LovenseButton';

// サブコンポーネント: モーダルラッパー
type ModalWrapperProps = {
  isOpen: boolean;
  onClose: () => void;
  isPCView: boolean;
  children: React.ReactNode;
};

const ModalWrapper = memo<ModalWrapperProps>(
  ({ isOpen, onClose, isPCView, children }) => {
    if (!isOpen) return null;

    if (isPCView) {
      // PC版: 背景オーバーレイ + コンテナ + Xボタン
      const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      };

      return (
        <div className={styles.pcModalOverlay} onClick={handleOverlayClick}>
          <div className={styles.pcModalContent}>
            <button onClick={onClose} className={styles.pcModalCloseButton}>
              <IconX className="h-4 w-4 text-white" />
            </button>
            {children}
          </div>
        </div>
      );
    }

    // モバイル版: 直接children表示
    return <>{children}</>;
  },
);
ModalWrapper.displayName = 'ModalWrapper';

const LiveChatArea = memo<Props>(
  ({
    onSendMessageToChannel,
    receiverId,
    channelId,
    liveCallType,
    isVisible,
    isPCView = false,
    broadcasterName,
    broadcasterAbout,
    onFullControlActiveChange,
  }: Props) => {
    const { data: session } = useSession();
    const latestIncomingLiveMessage = useLiveStore(
      (s) => s.latestLiveChatMessage,
    );
    const liveChatService = useLiveChatService();
    const { translateToJapanese } = useTranslate();
    const [liveMessages, setLiveMessages] = useState<MessageWithType[]>([]);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    const [isAutoMessageSent, setIsAutoMessageSent] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    // 他のコンポーネントとの互換性のためのラッパー関数
    const setLiveMessagesForCompat = (
      updater: SetStateAction<MessageWithType[]>,
    ) => {
      setLiveMessages(updater);
    };
    const [isTyping, setIsTyping] = useState(false);
    const [isCommentVisible, _setIsCommentVisible] = useState(true);
    const isInputFocused = useLiveStore((s) => s.isLiveChatInputFocused);
    const setIsInputFocused = useLiveStore((s) => s.setIsLiveChatInputFocused);
    const typingTimeoutRef = useRef<number | null>(null);
    const messagesEndRef = useRef<HTMLLIElement | null>(null);
    const viewportMetaRef = useRef<HTMLMetaElement | null>(null);
    const originalViewportContentRef = useRef<string | null>(null);
    const isZoomDisabledRef = useRef(false);
    const isComposingRef = useRef(false);
    const [_notEnoughPointModalOpen, _setNotEnoughPointModalOpen] =
      useState(false);
    const [presentMenuItems, setPresentMenuItems] = useState<
      GetPresentMenuListResponseElementData[]
    >([]);
    const [lovenseMenuItems, setLovenseMenuItems] = useState<LovenseMenuItem[]>(
      [],
    );
    const [fullControlSession, setFullControlSession] = useState<{
      partnerId: string;
      durationSec: number;
    } | null>(null);
    const [showLovenseHint, setShowLovenseHint] = useState(true);
    const handleSendRtmUpdate = useCallback(
      (payload: LovenseRtmUpdateMessage) => {
        if (!onSendMessageToChannel) return Promise.resolve();
        return onSendMessageToChannel(payload);
      },
      [onSendMessageToChannel],
    );

    useEffect(() => {
      onFullControlActiveChange?.(fullControlSession !== null);
    }, [fullControlSession, onFullControlActiveChange]);

    // キーボード高さを取得（Visual Viewport API使用）
    const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

    // iOSかAndroidを判定（viewport zoom制御用）
    const userAgent =
      typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    // 入力コンテナのbottom位置
    const inputContainerBottom = isKeyboardVisible ? keyboardHeight : 0;

    // メッセージリスト表示領域のbottomオフセット
    const _contentAreaBottomOffset = isKeyboardVisible
      ? keyboardHeight + INPUT_BAR_HEIGHT
      : INPUT_BAR_HEIGHT;

    const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
    const updateLovenseState = useLovenseStore((s) => s.updateLovenseState);
    const partnerApplicationIdRef = useRef<string | null>(null);

    const fetchPartnerApplicationId = useCallback(async (): Promise<
      string | null
    > => {
      if (partnerApplicationIdRef.current !== null) {
        return partnerApplicationIdRef.current;
      }

      if (!session?.user?.id) {
        partnerApplicationIdRef.current = null;
        return null;
      }

      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<{ applicationId?: string }>
        >(GET_USER_INF_FOR_WEB_WITH_USER_ID, {
          myId: session.user.id,
          partnerId: receiverId,
        });

        if (response.type === 'error') {
          partnerApplicationIdRef.current = null;
          return null;
        }

        const appId = response.applicationId ?? null;
        partnerApplicationIdRef.current = appId;
        return appId;
      } catch {
        partnerApplicationIdRef.current = null;
        return null;
      }
    }, [receiverId, session?.user?.id]);

    const fetchLovenseMenuList = useCallback(async (): Promise<
      LovenseMenuItem[]
    > => {
      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<{
            menuList: LovenseMenuItem[];
            canGetTicket?: boolean;
            isOnCampaign?: boolean;
          }>
        >(HTTP_GET_LOVENSE_MENU_LIST, {
          partner_id: receiverId,
          call_type: 'live',
        });
        if (response.type === 'error') {
          console.error('Failed to fetch lovense menu list:', response.message);
          return [];
        }

        await fetchPartnerApplicationId();
        const menuList = response.menuList ?? [];

        // Zustand状態を更新
        const ticketMenu = menuList.find(
          (menu) => menu.ticketCount && menu.ticketCount > 0,
        );
        const ticketCount = ticketMenu?.ticketCount || 0;

        updateLovenseState({
          menuItems: menuList,
          ticketCount: ticketCount,
          // isPlayedTodayは更新しない（ルーレット回転時のみ更新）
          ...(response.isOnCampaign !== undefined && {
            isCampaignActive: response.isOnCampaign,
          }),
        });

        return menuList;
      } catch (error) {
        console.error('Failed to fetch lovense menu list:', error);
        return [];
      }
    }, [fetchPartnerApplicationId, receiverId, updateLovenseState]);

    const fetchPresentMenuList = useCallback(async (): Promise<
      GetPresentMenuListResponseElementData[]
    > => {
      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<{ menuList: GetPresentMenuListResponseElementData[] }>
        >(HTTP_GET_PRESENT_MENU_LIST, { partner_id: receiverId });

        if (response.type === 'error') {
          console.error('Failed to fetch menu list:', response.message);
          return [];
        }
        return response.menuList;
      } catch (error) {
        console.error('Failed to fetch menu list:', error);
        return [];
      }
    }, [receiverId]);

    // フリマ商品一覧取得
    const fetchFleaMarketItems = useCallback(async (): Promise<
      FleaMarketItemWithFavoritesCamel[]
    > => {
      try {
        const req = getFleaMarketItemListRequest(
          'all',
          20,
          1,
          'on_sale',
          receiverId,
        );
        const response = await postToNext<{
          code: number;
          data: FleaMarketItemWithFavorites[] | null;
        }>(GET_FLEA_MARKET_ITEM_LIST, req);

        if (
          response.type === 'error' ||
          response.code !== 0 ||
          !Array.isArray(response.data)
        ) {
          return [];
        }

        // snake_case → camelCase 変換
        return response.data.map((itemData) => ({
          item: {
            itemId: itemData.item.item_id,
            sellerId: itemData.item.seller_id,
            title: itemData.item.title,
            description: itemData.item.description,
            images: itemData.item.images,
            price: itemData.item.price,
            category: itemData.item.category,
            salesStatus: itemData.item.sales_status,
            createdAt: itemData.item.created_at,
            updatedAt: itemData.item.updated_at,
          },
          favCount: itemData.fav_count,
        }));
      } catch (error) {
        console.error('Failed to fetch flea market items:', error);
        return [];
      }
    }, [receiverId]);

    const [clickModalOpen, setClickModalOpen] = useState(false);
    const [clickLovenseModalOpen, setClickLovenseModalOpen] = useState(false);
    const [clickFleaMarketModalOpen, setClickFleaMarketModalOpen] =
      useState(false);
    const [fleaMarketItems, setFleaMarketItems] = useState<
      FleaMarketItemWithFavoritesCamel[]
    >([]);
    const [selectedFleaMarketItemId, setSelectedFleaMarketItemId] = useState<
      string | null
    >(null);
    const [fleaMarketPurchaseTarget, setFleaMarketPurchaseTarget] =
      useState<ItemDataForPurchase | null>(null);
    const [isFleaMarketOverlayOpen, setIsFleaMarketOverlayOpen] =
      useState(false);
    const [isLatestItemDismissed, setIsLatestItemDismissed] = useState(false);

    // ピックアップ商品（女性側からRTMで指定された商品）
    const { promotedItem, promotedItemId } = usePromotedFleaMarketItem();
    const setPromotedFleaMarketItemId = useFleaMarketStore(
      (s) => s.setPromotedItemId,
    );

    // 他の視聴者が購入した商品ID（RTM経由で受信）
    const purchasedFleaMarketItemIds = useFleaMarketStore(
      (s) => s.purchasedItemIds,
    );

    // 購入済み商品を除外したフリマ商品リスト
    const filteredFleaMarketItems = useMemo(() => {
      return fleaMarketItems.filter(
        (item) => !purchasedFleaMarketItemIds.has(item.item.itemId),
      );
    }, [fleaMarketItems, purchasedFleaMarketItemIds]);

    // 表示する商品を決定（女性がピックアップした商品のみ表示）
    const displayItem = promotedItem;
    const isPromotedItem = !!promotedItem;
    const [latestItemAnimationKey, setLatestItemAnimationKey] = useState(0);
    const latestItemIdRef = useRef<string | null>(null);
    const latestItemId = displayItem?.item.itemId ?? null;

    useEffect(() => {
      if (!latestItemId) {
        latestItemIdRef.current = null;
        return;
      }
      if (latestItemIdRef.current && latestItemIdRef.current !== latestItemId) {
        setLatestItemAnimationKey((prev) => prev + 1);
      }
      latestItemIdRef.current = latestItemId;
    }, [latestItemId]);

    // 最新商品カードの高さを考慮したオフセット計算
    const hasFleaMarketLatestItem =
      !!displayItem && !isInputFocused && !isLatestItemDismissed;
    const adjustedContentAreaBottomOffset = useMemo(() => {
      const baseOffset = isKeyboardVisible
        ? keyboardHeight + INPUT_BAR_HEIGHT
        : INPUT_BAR_HEIGHT;
      // 最新商品カードが表示される場合は追加のオフセットを加算
      return hasFleaMarketLatestItem
        ? baseOffset + FLEA_MARKET_LATEST_ITEM_HEIGHT
        : baseOffset;
    }, [isKeyboardVisible, keyboardHeight, hasFleaMarketLatestItem]);

    // ボタンの表示条件を明確化
    const shouldShowButtons = useMemo(() => {
      // PC版では常に表示
      if (isPCView) return true;

      // コメント入力中でない場合は表示
      if (!isInputFocused) return true;

      // コメント入力中でも、モーダルが開いている場合は表示
      if (clickModalOpen || clickLovenseModalOpen || clickFleaMarketModalOpen)
        return true;

      // その他の場合は非表示
      return false;
    }, [
      isPCView,
      isInputFocused,
      clickModalOpen,
      clickLovenseModalOpen,
      clickFleaMarketModalOpen,
    ]);

    // コメントリストの表示条件を明確化
    const shouldShowComments = useMemo(() => {
      return isCommentVisible && !isInputFocused;
    }, [isCommentVisible, isInputFocused]);

    const clickPresentMenu = () => {
      setClickModalOpen(true);
    };

    const clickLovenseMenu = () => {
      setClickLovenseModalOpen(true);
    };

    const clickFleaMarketMenu = () => {
      setClickFleaMarketModalOpen(true);
    };

    const handleViewFleaMarketItem = (itemId: string) => {
      setFleaMarketPurchaseTarget(null);
      setSelectedFleaMarketItemId(itemId);
      setIsFleaMarketOverlayOpen(true);
      setClickFleaMarketModalOpen(false); // モーダルを閉じる

      // GA4イベント発火
      trackEvent(event.OPEN_FLEA_MARKET_ITEM_DETAIL, {
        item_id: itemId,
        source: 'live_stream',
        broadcaster_id: receiverId,
      });
    };

    const handleOpenFleaMarketPurchase = (
      item: FleaMarketItemWithFavoritesCamel,
    ) => {
      setFleaMarketPurchaseTarget({
        itemId: item.item.itemId,
        title: item.item.title,
        price: item.item.price,
        images: item.item.images,
      });
      setSelectedFleaMarketItemId(item.item.itemId);
      setIsFleaMarketOverlayOpen(true);
    };

    const handleFleaMarketOverlayClose = () => {
      setIsFleaMarketOverlayOpen(false);
      setSelectedFleaMarketItemId(null);
      setFleaMarketPurchaseTarget(null);
    };

    const handleFleaMarketPurchaseComplete = async (
      data: FleaMarketPurchaseCompleteData,
    ) => {
      const { itemTitle, newPoint, itemId, price, transactionId } = data;

      // ポイント更新
      setCurrentPoint(newPoint);

      // 購入した商品がピックアップ商品の場合はクリア
      if (promotedItemId === itemId) {
        setPromotedFleaMarketItemId(null);
      }

      // 他の視聴者にも購入を通知（アイテム一覧の同期用）
      try {
        await onSendMessageToChannel?.({
          messageType: 'fleaMarketItemSold',
          itemId,
        });
      } catch (error) {
        console.error(
          'Failed to send flea market purchase notification:',
          error,
        );
      }

      // 購入完了トースト表示
      toast(
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
            <span className="text-xs">✓</span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="font-semibold text-[10px] text-gray-500">
              購入完了
            </span>
            <span className="line-clamp-2 font-bold text-gray-900 text-xs leading-tight">
              「{itemTitle}」を購入しました
            </span>
          </div>
        </div>,
        {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: false,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '10px 14px',
            maxWidth: '280px',
          },
        },
      );

      // GA4イベント発火（トースト表示後）
      trackEvent(event.COMPLETE_PURCHASE_FLEA_MARKET_ITEM, {
        item_id: itemId,
        price,
        transaction_id: transactionId,
        source: 'live_stream',
        broadcaster_id: receiverId,
      });

      // 購入コメント送信
      if (session?.user?.name && session?.user?.id) {
        const purchaseMessage = `「${itemTitle}」を購入しました🛒`;

        try {
          await onSendMessageToChannel?.({
            text: purchaseMessage,
            sender_name: session.user.name,
            sender_id: session.user.id,
            message_type: 'chat',
            receiver_id: receiverId,
            callType: liveCallType,
            fleaMarketItemPurchased: {
              messageType: 'fleaMarketItemPurchased',
              itemId,
              amount: price,
            },
          });
        } catch (err) {
          console.error('[LiveChatArea] Failed to send message:', err);
        }

        setLiveMessages((prev) => [
          ...prev,
          {
            text: `${session.user.name}: ${purchaseMessage}`,
            type: 'normal',
            sender_id: session.user.id,
          },
        ]);
      }

      // 商品リスト更新
      const updatedItems = await fetchFleaMarketItems();
      setFleaMarketItems(updatedItems);
    };

    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, []);

    // Loveenseメニューとプレゼントメニュー、フリマ商品のリストを取得
    useEffect(() => {
      const fetchLovenseMenu = async () => {
        try {
          const menuList = await fetchLovenseMenuList();
          setLovenseMenuItems(menuList);
        } catch (error) {
          console.error('Failed to fetch lovense menu list:', error);
        }
      };

      const fetchPresentMenu = async () => {
        try {
          const menuList = await fetchPresentMenuList();

          setPresentMenuItems(menuList);
        } catch (error) {
          console.error('Failed to fetch menu list:', error);
        }
      };

      const fetchFleaMarket = async () => {
        try {
          const items = await fetchFleaMarketItems();
          setFleaMarketItems(items);
        } catch (error) {
          console.error('Failed to fetch flea market items:', error);
        }
      };

      fetchLovenseMenu();
      fetchPresentMenu();
      fetchFleaMarket();
    }, [fetchFleaMarketItems, fetchLovenseMenuList, fetchPresentMenuList]);

    // RTMチャンネル参加後に過去メッセージを取得
    useEffect(() => {
      if (!session?.user || !receiverId || isHistoryLoaded) return;

      const fetchHistory = async () => {
        try {
          const messages =
            await liveChatService.getVideoChatMessages(receiverId);

          // タイムスタンプ順にソート（古い順）
          const sortedMessages = messages.sort(
            (a, b) => a.timestamp - b.timestamp,
          );

          // MessageWithType形式に変換
          const formattedMessages: MessageWithType[] = sortedMessages.map(
            (msg) => ({
              text: `${msg.userName}: ${msg.message}`,
              type: 'normal',
              sender_name: msg.userName,
            }),
          );

          // 区切り線を追加（Android版のinsertVideoChatHistory相当）
          const divider: MessageWithType = {
            text: '--- 過去のメッセージ ---',
            type: 'divider',
          };

          // 過去メッセージ + 区切り線をliveMessagesの先頭に追加
          setLiveMessages((prev) => [...formattedMessages, divider, ...prev]);
          setIsHistoryLoaded(true);
        } catch (error) {
          console.error('Failed to fetch video chat history:', error);
          // エラー時も再試行を防ぐためフラグを立てる
          setIsHistoryLoaded(true);
        }
      };

      fetchHistory();
    }, [session, receiverId, isHistoryLoaded, liveChatService]);

    useEffect(() => {
      if (!session?.user) return;
      // 過去メッセージ取得完了後に自動メッセージを送信
      if (!isHistoryLoaded) return;
      // 既に自動メッセージが送信されている場合はスキップ
      if (isAutoMessageSent) return;

      const autoMessageTimer = setTimeout(async () => {
        // 送信開始時にフラグを立てる（重複防止）
        setIsAutoMessageSent(true);
        try {
          const userName = session.user.name;
          const userId = session.user.id;
          if (!userName || !userId) return;

          // 入室メッセージを送信
          const enteringMessage = `${userName}さんが入室しました！`;
          await onSendMessageToChannel?.({
            text: enteringMessage,
            sender_name: userName,
            sender_id: userId,
            message_type: 'chat',
            receiver_id: receiverId,
            callType: liveCallType,
          });

          // 自分の画面に入室メッセージを表示
          setLiveMessages((prev) => [
            ...prev,
            {
              text: `${userName}: ${enteringMessage}`,
              type: 'normal',
              sender_id: userId,
            },
          ]);

          // 少し間を空けてこんにちはメッセージを送信
          await new Promise((resolve) => setTimeout(resolve, 500));

          await onSendMessageToChannel?.({
            text: 'こんにちは',
            sender_name: userName,
            sender_id: userId,
            message_type: 'chat',
            receiver_id: receiverId,
            callType: liveCallType,
          });

          // 自分の画面にこんにちはメッセージを表示
          setLiveMessages((prev) => [
            ...prev,
            {
              text: `${userName}: こんにちは`,
              type: 'normal',
              sender_id: userId,
            },
          ]);

          // 配信者のプロフィールメッセージを表示（相手からのメッセージとして）
          if (broadcasterAbout && broadcasterName) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 500));
              const truncatedAbout = truncateToMaxLines(
                broadcasterAbout,
                MAX_PROFILE_LINES,
              );
              setLiveMessages((prev) => [
                ...prev,
                {
                  text: `${broadcasterName}: ${truncatedAbout}`,
                  type: 'normal',
                  sender_id: receiverId,
                },
              ]);
            } catch (profileError) {
              console.warn('Failed to display profile message:', profileError);
              // プロフィールメッセージの表示失敗は非致命的なので、エラーログのみ
            }
          }
        } catch (error) {
          console.error('Failed to send auto messages:', error);
        }
      }, AUTO_MESSAGE_DELAY);

      return () => {
        clearTimeout(autoMessageTimer);
      };
    }, [
      session,
      isHistoryLoaded,
      isAutoMessageSent,
      onSendMessageToChannel,
      receiverId,
      liveCallType,
      broadcasterAbout,
      broadcasterName,
    ]);

    // 最新のメッセージが追加されたら表示
    useEffect(() => {
      if (!latestIncomingLiveMessage?.text) return;
      // 自分のメッセージは送信時に既にliveMessagesに追加しているので、エコーバックは無視
      if (
        latestIncomingLiveMessage.sender_id &&
        latestIncomingLiveMessage.sender_id === session?.user?.id
      )
        return;

      setLiveMessages((prev) => [
        ...prev,
        {
          text: latestIncomingLiveMessage.text,
          type: 'normal',
          ...(latestIncomingLiveMessage.sender_id && {
            sender_id: latestIncomingLiveMessage.sender_id,
          }),
          ...(latestIncomingLiveMessage.sender_name && {
            sender_name: latestIncomingLiveMessage.sender_name,
          }),
        },
      ]);
    }, [latestIncomingLiveMessage, session?.user?.id]);

    // メッセージが追加されたら一番下にスクロール
    useEffect(() => {
      const timerId = window.setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => window.clearTimeout(timerId);
    }, [liveMessages, scrollToBottom]);

    const _onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.length <= 100) {
        setInputValue(event.target.value);
      }

      if (!isTyping) {
        sendTypingStatus(true);
        setIsTyping(true);
      }

      if (typingTimeoutRef.current !== null) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = window.setTimeout(() => {
        sendTypingStatus(false);
        setIsTyping(false);
      }, 2000);
    };

    useEffect(() => {
      return () => {
        if (typingTimeoutRef.current !== null) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }, []);

    const onClick = () => {
      handleSendMessage();
    };

    // 日付変更検知フックを使用
    useDateChangeDetector();

    // Lovense自動発動シーケンスフック
    const {
      isRunning: isSequenceRunning,
      phase: sequencePhase,
      countdown: sequenceCountdown,
      currentActionNumber,
    } = useFreeActionSequence({
      lovenseMenuItems,
      receiverId,
      channelId,
      callType: liveCallType === 'sideWatch' ? 'side_watch' : 'live',
      onSendMessageToChannel,
      setLiveMessages,
      setCurrentPoint: (point: number) => setCurrentPoint(point),
    });

    const sendTypingStatus = async (isTyping: boolean) => {
      try {
        const message = {
          sender_name: session?.user?.name,
          sender_id: session?.user?.id,
          message_type: isTyping ? 'startTypingText' : 'endTypingText',
          receiver_id: receiverId,
        };
        await onSendMessageToChannel?.(message);
      } catch (error) {
        console.error('Failed to send typing status:', error);
      }
    };

    // Visual Viewport の管理は useKeyboardHeight フックに委譲
    const disableViewportZoom = useCallback(() => {
      if (isZoomDisabledRef.current) return;
      if (typeof document === 'undefined') return;
      const meta =
        viewportMetaRef.current ??
        (document.querySelector(
          'meta[name="viewport"]',
        ) as HTMLMetaElement | null);
      if (!meta) return;

      viewportMetaRef.current = meta;
      if (!originalViewportContentRef.current) {
        originalViewportContentRef.current = meta.getAttribute('content');
      }

      const currentContent = meta.getAttribute('content') ?? '';
      const contentParts = currentContent
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .filter(
          (part) =>
            !part.startsWith('maximum-scale') &&
            !part.startsWith('user-scalable'),
        );

      contentParts.push('maximum-scale=1');
      contentParts.push('user-scalable=no');

      meta.setAttribute('content', contentParts.join(', '));
      isZoomDisabledRef.current = true;
    }, []);

    const restoreViewportZoom = useCallback(() => {
      if (!isZoomDisabledRef.current) return;
      const meta = viewportMetaRef.current;
      if (!meta) return;

      if (originalViewportContentRef.current) {
        meta.setAttribute('content', originalViewportContentRef.current);
      }
      isZoomDisabledRef.current = false;
    }, []);

    useEffect(() => {
      if (typeof document === 'undefined') return;
      const meta = document.querySelector(
        'meta[name="viewport"]',
      ) as HTMLMetaElement | null;
      if (meta) {
        viewportMetaRef.current = meta;
        if (!originalViewportContentRef.current) {
          originalViewportContentRef.current = meta.getAttribute('content');
        }
      }

      return () => {
        restoreViewportZoom();
      };
    }, [restoreViewportZoom]);

    const handleFocus = () => {
      setIsInputFocused(true);

      // モーダル表示中の場合は閉じる
      if (clickLovenseModalOpen) {
        setClickLovenseModalOpen(false);
      }
      if (clickModalOpen) {
        setClickModalOpen(false);
      }
      if (clickFleaMarketModalOpen) {
        setClickFleaMarketModalOpen(false);
      }

      if (isIOS) {
        disableViewportZoom();
      }
      // キーボード高さの検出は useKeyboardHeight フックが自動的に処理
    };

    const handleBlur = () => {
      setIsInputFocused(false);

      if (isIOS) {
        restoreViewportZoom();
      }
      // キーボード高さの検出は useKeyboardHeight フックが自動的に処理
    };

    const handleSendMessage = async () => {
      if (!inputValue) return;
      if (!session?.user?.name || !session?.user?.id) return;
      if (isTranslating) return;

      const originalText = inputValue;

      try {
        setIsTranslating(true);

        // 外国語ユーザーの場合は日本語に翻訳
        const translatedText = await translateToJapanese(originalText);

        // 翻訳された場合は「原文 ── 翻訳」形式、そうでなければ原文のみ
        const messageText =
          translatedText !== originalText
            ? `${originalText} ── ${translatedText}`
            : originalText;

        await onSendMessageToChannel?.({
          text: messageText,
          sender_name: session.user.name,
          sender_id: session.user.id,
          message_type: 'chat',
          receiver_id: receiverId,
          callType: liveCallType,
        });

        // 送信成功後に入力欄をクリア
        setInputValue('');

        // GA4イベント送信
        trackEvent(event.SEND_MESSAGE_IN_VIDEO_CHAT, {
          partner_id: receiverId,
          user_id: session.user.id,
        });

        // 自分が送信したメッセージをliveMessagesに追加
        setLiveMessages((prev) => [
          ...prev,
          {
            text: `${session.user.name}: ${messageText}`,
            type: 'normal',
            sender_id: session.user.id,
          },
        ]);
      } catch {
        // エラー時は入力値を保持（クリアしない）
      } finally {
        setIsTranslating(false);
      }
    };

    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = () => {
      isComposingRef.current = false;
    };

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      // IME変換中（日本語入力など）の場合は送信しない
      if (isComposingRef.current) {
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    // PC版レイアウト
    if (isPCView) {
      return (
        <>
          {/* Lovense自動発動シーケンスオーバーレイ */}
          {isSequenceRunning && (
            <LovenseSequenceOverlay
              phase={sequencePhase}
              countdown={sequenceCountdown}
              currentActionNumber={currentActionNumber}
            />
          )}
          {/* 完全コントロールモーダル */}
          {fullControlSession && (
            <LovenseFullControlModal
              partnerId={fullControlSession.partnerId}
              sessionDurationSec={fullControlSession.durationSec}
              onSendRtmUpdate={handleSendRtmUpdate}
              onClose={() => setFullControlSession(null)}
            />
          )}
          {/* チャットエリア（右側30%内） */}
          <div ref={containerRef} className={styles.pcContainer}>
            {/* メッセージリスト表示エリア */}
            <div className={styles.pcMessageArea}>
              <MessageList
                liveMessages={liveMessages}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* 入力エリア */}
            <div
              className={styles.pcInputArea}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {/* PC版ボタングループ（入力欄の上） */}
              {shouldShowButtons && (
                <div className={styles.pcButtonGroup}>
                  {presentMenuItems.length > 0 && (
                    <PresentButton onClick={clickPresentMenu} />
                  )}
                  {lovenseMenuItems.length > 0 && (
                    <LovenseButton onClick={clickLovenseMenu} />
                  )}
                  {filteredFleaMarketItems.length > 0 && (
                    <FleaMarketButton
                      onClick={clickFleaMarketMenu}
                      itemCount={filteredFleaMarketItems.length}
                    />
                  )}
                </div>
              )}
              <MessageInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleFocus={handleFocus}
                handleBlur={handleBlur}
                handleKeyDown={handleKeyDown}
                handleCompositionStart={handleCompositionStart}
                handleCompositionEnd={handleCompositionEnd}
                onClick={onClick}
              />
            </div>
          </div>

          {/* モーダル（チャットエリア内、絶対配置） */}
          <ModalWrapper
            isOpen={clickModalOpen}
            onClose={() => setClickModalOpen(false)}
            isPCView={true}
          >
            <MenuItemsModal
              presentMenuItems={presentMenuItems}
              onClose={() => setClickModalOpen(false)}
              receiverId={receiverId}
              onSendMessageToChannel={onSendMessageToChannel}
              setLiveMessages={setLiveMessagesForCompat}
              callType="live"
              isPCView={true}
            />
          </ModalWrapper>

          <ModalWrapper
            isOpen={clickLovenseModalOpen}
            onClose={() => setClickLovenseModalOpen(false)}
            isPCView={true}
          >
            <LovenseCarouselContents
              lovenseMenuItems={lovenseMenuItems}
              onClose={() => setClickLovenseModalOpen(false)}
              receiverId={receiverId}
              onSendMessageToChannel={onSendMessageToChannel}
              setLiveMessages={setLiveMessagesForCompat}
              callType="live"
              isPCView={true}
              onTicketUsed={async () => {
                const updatedMenuList = await fetchLovenseMenuList();
                setLovenseMenuItems(updatedMenuList);
              }}
            />
          </ModalWrapper>

          <ModalWrapper
            isOpen={clickFleaMarketModalOpen}
            onClose={() => setClickFleaMarketModalOpen(false)}
            isPCView={true}
          >
            <FleaMarketModal
              items={filteredFleaMarketItems}
              onClose={() => setClickFleaMarketModalOpen(false)}
              isPCView={true}
              onViewItem={handleViewFleaMarketItem}
              onPurchase={(item) => {
                setClickFleaMarketModalOpen(false);
                handleOpenFleaMarketPurchase(item);
              }}
              userName={broadcasterName ?? ''}
            />
          </ModalWrapper>

          {/* フリマ商品詳細オーバーレイ */}
          {selectedFleaMarketItemId && (
            <FleaMarketItemOverlay
              itemId={selectedFleaMarketItemId}
              isOpen={isFleaMarketOverlayOpen}
              onClose={handleFleaMarketOverlayClose}
              onPurchaseComplete={handleFleaMarketPurchaseComplete}
              initialViewMode={fleaMarketPurchaseTarget ? 'purchase' : 'detail'}
              initialItemDataForPurchase={fleaMarketPurchaseTarget}
            />
          )}
        </>
      );
    }

    // モバイル版レイアウト（既存）
    return (
      <>
        {/* Lovense自動発動シーケンスオーバーレイ（Portalでdocument.bodyに直接レンダリング） */}
        {isSequenceRunning && (
          <LovenseSequenceOverlay
            phase={sequencePhase}
            countdown={sequenceCountdown}
            currentActionNumber={currentActionNumber}
          />
        )}
        {/* 完全コントロールモーダル */}
        {fullControlSession && (
          <LovenseFullControlModal
            partnerId={fullControlSession.partnerId}
            sessionDurationSec={fullControlSession.durationSec}
            onSendRtmUpdate={handleSendRtmUpdate}
            onClose={() => setFullControlSession(null)}
          />
        )}
        <div ref={containerRef} className={styles.container}>
          <div
            className={`${styles.contentArea} ${
              isVisible ? styles.contentAreaVisible : styles.contentAreaHidden
            }`}
            style={{
              bottom: `${adjustedContentAreaBottomOffset}px`,
              transition: 'bottom 0.2s ease-out',
            }}
          >
            {shouldShowComments && (
              <div className={styles.commentSection}>
                {/* Lovenseヒント表示（初回のみ） */}
                {showLovenseHint &&
                  liveMessages.some((msg) => isLovenseMessage(msg.text)) && (
                    <div className={styles.lovenseHint}>
                      タップでメニューを開く ▼
                    </div>
                  )}
                <ul className={styles.messageList}>
                  {liveMessages.map((message) => {
                    const isEnteringMessage = message.text.includes(
                      'さんが入室しました！',
                    );
                    const isMyMessage = message.sender_id === session?.user?.id;
                    const isBroadcasterMessage =
                      message.sender_id === receiverId && !isEnteringMessage;
                    const displayText = formatDisplayText(message);
                    const isLovense = isLovenseMessage(displayText);
                    const lovenseInfo = isLovense
                      ? parseLovenseMessage(displayText)
                      : null;

                    let messageClass = styles.messageContent;
                    if (isEnteringMessage) {
                      messageClass = styles.enteringMessage;
                    } else if (isLovense) {
                      messageClass = styles.lovenseMessage;
                    } else if (isBroadcasterMessage) {
                      messageClass = styles.broadcasterMessage;
                    } else if (isMyMessage) {
                      messageClass = styles.myMessageContent;
                    }

                    return (
                      <li
                        key={getMessageKey(message)}
                        className={styles.messageItem}
                      >
                        <span className={messageClass}>
                          {isLovense && lovenseInfo ? (
                            <>
                              <span className={styles.lovenseUserInfo}>
                                {lovenseInfo.userName}：{lovenseInfo.duration}
                                {lovenseInfo.type}
                              </span>
                              <span className={styles.lovenseDivider}>|</span>
                              <span
                                className={styles.lovensePlayButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowLovenseHint(false);
                                  setClickLovenseModalOpen(true);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setShowLovenseHint(false);
                                    setClickLovenseModalOpen(true);
                                  }
                                }}
                              >
                                <span className={styles.lovenseIconWrapper}>
                                  <Image
                                    src="/lovense_pink.webp"
                                    alt="Lovense"
                                    width={14}
                                    height={14}
                                  />
                                </span>
                                <span className={styles.lovenseAction}>
                                  おもちゃでプレイ
                                </span>
                              </span>
                            </>
                          ) : (
                            displayText
                          )}
                        </span>
                      </li>
                    );
                  })}
                  <li ref={messagesEndRef as React.RefObject<HTMLLIElement>} />
                  {/* この要素にスクロール */}
                </ul>
              </div>
            )}

            {/* Lovense/おねだりボタン（縦並び） */}
            {shouldShowButtons && (
              <div className={styles.buttonGroup}>
                {presentMenuItems.length > 0 && (
                  <PresentButton onClick={clickPresentMenu} />
                )}
                {lovenseMenuItems.length > 0 && (
                  <LovenseButton onClick={clickLovenseMenu} />
                )}
              </div>
            )}
          </div>

          <div
            className={styles.inputContainer}
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              bottom: `${inputContainerBottom}px`,
              transition: 'bottom 0.2s ease-out',
              // inputContainer全体のタッチスクロールを防止（配信画面のスクロールと競合するため）
              touchAction: 'none',
              // モーダルを開くときは isVisible に関わらず描画（モーダルが祖先の display:none に巻き込まれないように）
              display:
                isVisible ||
                clickModalOpen ||
                clickLovenseModalOpen ||
                clickFleaMarketModalOpen
                  ? 'block'
                  : 'none',
            }}
          >
            <ModalWrapper
              isOpen={clickModalOpen}
              onClose={() => setClickModalOpen(false)}
              isPCView={false}
            >
              <MenuItemsModal
                presentMenuItems={presentMenuItems}
                onClose={() => setClickModalOpen(false)}
                receiverId={receiverId}
                onSendMessageToChannel={onSendMessageToChannel}
                setLiveMessages={setLiveMessagesForCompat}
                callType="live"
                isPCView={false}
              />
            </ModalWrapper>

            <ModalWrapper
              isOpen={clickLovenseModalOpen}
              onClose={() => setClickLovenseModalOpen(false)}
              isPCView={false}
            >
              <LovenseCarouselContents
                lovenseMenuItems={lovenseMenuItems}
                onClose={() => setClickLovenseModalOpen(false)}
                receiverId={receiverId}
                onSendMessageToChannel={onSendMessageToChannel}
                setLiveMessages={setLiveMessagesForCompat}
                callType="live"
                isPCView={false}
                onTicketUsed={async () => {
                  const updatedMenuList = await fetchLovenseMenuList();
                  setLovenseMenuItems(updatedMenuList);
                }}
              />
            </ModalWrapper>

            <ModalWrapper
              isOpen={clickFleaMarketModalOpen}
              onClose={() => setClickFleaMarketModalOpen(false)}
              isPCView={false}
            >
              <FleaMarketModal
                items={filteredFleaMarketItems}
                onClose={() => setClickFleaMarketModalOpen(false)}
                isPCView={false}
                onViewItem={handleViewFleaMarketItem}
                onPurchase={(item) => {
                  setClickFleaMarketModalOpen(false);
                  handleOpenFleaMarketPurchase(item);
                }}
                userName={broadcasterName ?? ''}
              />
            </ModalWrapper>

            {/* フリマ商品詳細オーバーレイ */}
            {selectedFleaMarketItemId && (
              <FleaMarketItemOverlay
                itemId={selectedFleaMarketItemId}
                isOpen={isFleaMarketOverlayOpen}
                onClose={handleFleaMarketOverlayClose}
                onPurchaseComplete={handleFleaMarketPurchaseComplete}
                initialViewMode={
                  fleaMarketPurchaseTarget ? 'purchase' : 'detail'
                }
                initialItemDataForPurchase={fleaMarketPurchaseTarget}
              />
            )}

            {/* 商品プレビュー（女性がピックアップした商品のみ表示） */}
            {displayItem && !isInputFocused && !isLatestItemDismissed && (
              <div
                key={latestItemAnimationKey}
                className={`mb-2 px-1${latestItemAnimationKey > 0 ? 'animate-flea-market-swap' : ''}`}
              >
                <FleaMarketLatestItem
                  item={displayItem}
                  isPromoted={isPromotedItem}
                  onClick={() => {
                    handleViewFleaMarketItem(displayItem.item.itemId);
                  }}
                  onPurchase={() => {
                    handleOpenFleaMarketPurchase(displayItem);
                  }}
                  onDismiss={() => {
                    setIsLatestItemDismissed(true);
                  }}
                />
              </div>
            )}

            {/* フリマボタン + コメント入力 */}
            <div className="flex items-center gap-2">
              {/* フリマボタン */}
              {filteredFleaMarketItems.length > 0 && !isInputFocused && (
                <FleaMarketButton
                  onClick={clickFleaMarketMenu}
                  itemCount={filteredFleaMarketItems.length}
                />
              )}

              {/* コメント入力 */}
              <div className="flex-1">
                <MessageInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  handleFocus={handleFocus}
                  handleBlur={handleBlur}
                  handleKeyDown={handleKeyDown}
                  handleCompositionStart={handleCompositionStart}
                  handleCompositionEnd={handleCompositionEnd}
                  onClick={onClick}
                />
              </div>
            </div>
          </div>

          {/* LOVENSE_ROULETTE_HIDE_START - ラブンスルーレット機能を一時的に非表示 */}
          {/* Lovenseルーレットウィジェット */}

          {/* デバッグパネル（開発環境のみ） */}
          {/* <LovenseDebugPanel /> */}
        </div>
      </>
    );
  },
);

export default LiveChatArea;
LiveChatArea.displayName = 'LiveChatArea';
