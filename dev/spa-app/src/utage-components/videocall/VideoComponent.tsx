// Image component removed (use <img> directly);
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StopCallModal from '@/components/videocall/StopCallModal';
import { useAgoraRTC } from '@/hooks/useAgoraRTC.hook';
import styles from '@/styles/videocall/VideoComponent.module.css';
import PointCard from './PointCard';
import StopCallButton from './StopCallButton';

const logoPic = '/header/utage_logo.webp';
const humanPic = '/live/human.webp';
const swapPic = '/call/swap.webp';
const pointPic = '/call/point.webp';
const micPic = '/mic/mic.webp';
const micOffPic = '/mic/mic_off.webp';

import { useSession } from '#/hooks/useSession';
import { BeatLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import type { GetPresentMenuListResponseElementData } from '@/apis/get-present-menu-list';
import type {
  LovenseMenuItem,
  UncompletedLovenseLogItem,
} from '@/apis/http/lovense';
import type { GetPresentMenuListResponse } from '@/apis/http/present';
import { LovenseFullControlModal } from '@/components/LovenseFullControlModal';
import { ProfileModal } from '@/components/profile/ProfileModal';
import {
  GET_FLEA_MARKET_ITEM_LIST,
  HTTP_GET_LOVENSE_MENU_LIST,
  HTTP_GET_PRESENT_MENU_LIST,
  HTTP_GET_UNCOMPLETED_LOVENSE_LOG,
} from '@/constants/endpoints';
import { useFleaMarketStore } from '@/features/fleamarket/store/fleaMarketStore';
import type { LovenseRtmUpdateMessage } from '@/features/lovense/store/lovenseStore';
import { useLovenseStore } from '@/features/lovense/store/lovenseStore';
import { useQuickCharge } from '@/hooks/requests/useQuickCharge';
import { useBookmark } from '@/hooks/useBookmark';
import { usePaymentCustomerData } from '@/hooks/usePaymentCustomerData.hook';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import { useCallStore } from '@/stores/callStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { usePointStore } from '@/stores/pointStore';
import { usePollingStore } from '@/stores/pollingStore';
import { useUIStore } from '@/stores/uiStore';
import type { LiveChannel } from '@/types/LiveChannel';
import type { ResponseData } from '@/types/NextApi';
import { beforeCall, inCall } from '@/utils/callState';
import type { CallType } from '@/utils/callView';
import { postToNext } from '@/utils/next';
import AlvionPaymentModal from '../purchase/AlvionPaymentModal';
import AlvionQuickChargeModal from '../purchase/AlvionQuickChargeModal';
import RoundedThumbnail from '../RoundedThumbnail';
import LiveChatArea from './LiveChatArea';
import LovenseItemsModal from './LovenseItemModal';

const LovensePic = '/lovense_pink.webp';

import { event } from '@/constants/ga4Event';
import {
  MILLISECOND_THRESHOLD,
  RECENT_START_WINDOW_MS,
  RECENT_START_WINDOW_SEC,
} from '@/constants/lovenseSequences';
import { rtmMessageType } from '@/constants/RtmMessageType';
import {
  type InCallChargeType,
  useInCallPurchaseTracking,
} from '@/hooks/useInCallPurchaseTracking';
import { trackEvent } from '@/utils/eventTracker';

const bookmarkBeforePic = '/profile/bookmark_before.webp';
const bookmarkAfterPic = '/profile/bookmark_after.webp';

import {
  type FleaMarketItemWithFavorites,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import { isNativeApplication } from '@/constants/applicationId';
import { pointPerMinute, useCallTimer } from '@/hooks/useCallTimer.hook';
import { useDateChangeDetector } from '@/hooks/useDateChangeDetector.hook';
import { usePromotedFleaMarketItem } from '@/hooks/usePromotedFleaMarketItem';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import type { MessageWithType } from '@/types/MessageWithType';
import { imageUrl } from '@/utils/image';
import type { ItemDataForPurchase } from './FleaMarketItemDetailCompact';
import FleaMarketItemOverlay from './FleaMarketItemOverlay';
import FleaMarketLatestItem from './FleaMarketLatestItem';
import FleaMarketModal from './FleaMarketModal';
import type { FleaMarketPurchaseCompleteData } from './FleaMarketPurchaseCompact';
import { LovenseCircularTimer } from './LovenseCircularTimer';
import LovenseQuickMenu from './LovenseQuickMenu';

type Props = {
  onSendMessageToPeer?: (message: Record<string, unknown>) => Promise<void>;
  onSendMessageToChannel?: (message: Record<string, unknown>) => Promise<void>;
  receiverId: string;
  viewCount: number;
  callType: CallType;
  liveChannel: LiveChannel;
  isBookmarked: boolean;
  onEndRTM?: () => Promise<void>;
};

export const VideoComponent = memo<Props>(
  ({
    liveChannel: { channelInfo, broadcaster },
    onSendMessageToPeer,
    onSendMessageToChannel,
    receiverId,
    viewCount,
    callType,
    isBookmarked,
    onEndRTM,
  }: Props) => {
    const videoWrapperRef = useRef<HTMLDivElement | null>(null);
    const videoScreenRef = useRef<HTMLDivElement | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isAlvionModalOpen, setIsAlvionModalOpen] = useState(false);
    const [isQuickChargeModalOpen, setIsQuickChargeModalOpen] = useState(false);

    // 決済顧客データを取得（クイックチャージ可否判定のため）
    usePaymentCustomerData();

    // クイックチャージ可否をZustandから取得
    const canQuickCharge = usePaymentStore((s) => s.canQuickCharge);
    const [_selectedPointAmount, _setSelectedPointAmount] = useState(800);
    const [_selectedMoneyAmount, _setSelectedMoneyAmount] = useState(980);

    // 通話中課金のトラッキング用（通話タイプを判定）
    const inCallChargeType: InCallChargeType = useMemo(() => {
      // ライブ配信 / ビデオチャット
      if (
        callType === 'live' ||
        callType === 'videoChatFromOutgoing' ||
        callType === 'videoChatFromIncoming'
      ) {
        return 'live';
      }
      // ビデオ通話
      return 'videocall';
    }, [callType]);

    const { trackInCallCharge, clearInCallChargeAttribution } =
      useInCallPurchaseTracking(canQuickCharge, inCallChargeType);

    // 通話中であることを body に設定（ヘッダー・サイドバー非表示用）
    useEffect(() => {
      document.body.setAttribute('data-in-call', 'true');
      return () => {
        document.body.removeAttribute('data-in-call');
      };
    }, []);

    useEffect(() => {
      const touchHandler = (event: TouchEvent) => {
        if (event.touches.length > 1) {
          event.preventDefault();
        }
      };

      const videoWrapper = videoWrapperRef.current;
      if (videoWrapper) {
        videoWrapper.addEventListener('touchstart', touchHandler, {
          passive: false,
        });
      }

      // viewport設定を強制的に適用してズームを防止
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        const currentContent = viewportMeta.getAttribute('content') || '';
        if (
          !currentContent.includes('user-scalable=no') ||
          !currentContent.includes('maximum-scale=1')
        ) {
          viewportMeta.setAttribute(
            'content',
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
          );
        }
      }

      // ビデオチャット中は画面のスクロールを完全に防止
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalHeight = document.body.style.height;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.height = '100%';
      document.body.style.width = '100%';

      return () => {
        if (videoWrapper) {
          videoWrapper.removeEventListener('touchstart', touchHandler);
        }

        // 元の状態に戻す
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.height = originalHeight;
        document.body.style.width = originalWidth;
      };
    }, []);

    const setCurrentPoint = usePointStore((s) => s.setCurrentPoint);
    const updatePointOptimistic = usePointStore((s) => s.updatePointOptimistic);
    const updateLovenseState = useLovenseStore((s) => s.updateLovenseState);
    const openStopCallModal = useUIStore((s) => s.openStopCallModal);
    const setPromotedFleaMarketItemId = useFleaMarketStore(
      (s) => s.setPromotedItemId,
    );
    const [isConnecting, setIsConnecting] = useState(true);
    const callState = useCallStore((s) => s.callState);

    // 日付変更検知フックを使用
    useDateChangeDetector();
    const [micMutedPicState, setMicMutedPicState] = useState<
      'notmuted' | 'muted'
    >('notmuted');
    const { data: session } = useSession();
    const userId = session?.user.id;
    const [isVisible, setIsVisible] = useState(true);
    const [quickChargeModalType, setQuickChargeModalType] = useState<
      'normal' | 'pointless' | 'hide'
    >('hide');

    const {
      isSuccess,
      errorData,
      response,
      isPurchasing,
      startPurchase,
      onEnd,
    } = useQuickCharge();
    const [lastPurchasedPoints, setLastPurchasedPoints] = useState<
      number | undefined
    >(undefined);
    const [isQuickMessageModalOpen, setIsQuickMessageModalOpen] =
      useState(false);

    // フリマ関連のstate
    const [fleaMarketItems, setFleaMarketItems] = useState<
      FleaMarketItemWithFavoritesCamel[]
    >([]);
    const [clickFleaMarketModalOpen, setClickFleaMarketModalOpen] =
      useState(false);
    const [selectedFleaMarketItemId, setSelectedFleaMarketItemId] = useState<
      string | null
    >(null);
    const [fleaMarketPurchaseTarget, setFleaMarketPurchaseTarget] =
      useState<ItemDataForPurchase | null>(null);
    const [isFleaMarketOverlayOpen, setIsFleaMarketOverlayOpen] =
      useState(false);

    // ピックアップ商品（女性側からRTMで指定された商品）
    const { promotedItem, clearPromotedItem } = usePromotedFleaMarketItem();

    // PC判定（768px以上でPC）
    const isPC = useUIStore((s) => s.isPC);

    // PC版のぼかし背景用CSS変数を設定
    useEffect(() => {
      if (isPC && videoScreenRef.current) {
        videoScreenRef.current.style.setProperty(
          '--bg-image',
          `url(${imageUrl(broadcaster.avatarId)})`,
        );
      } else if (videoScreenRef.current) {
        videoScreenRef.current.style.removeProperty('--bg-image');
      }
    }, [isPC, broadcaster.avatarId]);

    const [
      onLeave,
      switchCamera,
      changeMicState,
      isMicMuted,
      isPartnerMicMuted,
      isRemoteVideoReceived,
    ] = useAgoraRTC(channelInfo, callType, isPC ? 'desktop' : 'mobile');

    const cancel = useCallback(async () => {
      // RTC切断処理（エラーハンドリング付き）
      try {
        await onLeave();
      } catch (error) {
        console.error('[VideoComponent] onLeave failed:', error);
      }

      // live または sideWatch の場合は RTM クライアントも切断
      if ((callType === 'live' || callType === 'sideWatch') && onEndRTM) {
        try {
          await onEndRTM();
        } catch (error) {
          console.error('[VideoComponent] onEndRTM failed:', error);
        }
      }

      onSendMessageToPeer?.({
        message_type: rtmMessageType.videoCallReply,
        isAccepted_call: false,
      });
    }, [onLeave, onSendMessageToPeer, onEndRTM]);

    const callTime = useCallTimer(
      channelInfo.peerId!,
      onLeave,
      onSendMessageToPeer,
      onSendMessageToChannel,
      callType,
      undefined,
      async (point, _money, _isBonusExist) => {
        // ポイントが必要量より少ないかチェック
        const pointNeededPerMinute = pointPerMinute(callType);
        // 1分分のポイントがない場合のみpointlessに設定
        if (point < pointNeededPerMinute) {
          setQuickChargeModalType('pointless');
        } else {
          // ポイントが十分にある場合はモーダルを非表示に
          if (quickChargeModalType === 'pointless') {
            setQuickChargeModalType('hide');
          }
        }
      },
    );

    const userCurrentPoint = usePointStore((s) => s.currentPoint);
    const requiredPointsPerMinute = pointPerMinute(callType);

    useEffect(() => {
      // 現在のポイントが必要なポイント量を下回った場合
      if (
        userCurrentPoint !== undefined &&
        userCurrentPoint < requiredPointsPerMinute
      ) {
        // ポイント不足モーダルを表示
        setQuickChargeModalType('pointless');
      } else {
        // ポイントが十分にある場合はモーダルを非表示に
        if (quickChargeModalType === 'pointless') {
          setQuickChargeModalType('hide');
        }
      }
    }, [userCurrentPoint, requiredPointsPerMinute]);

    const handleProfileButtonClick = (event: {
      stopPropagation: () => void;
    }) => {
      event.stopPropagation();
      setIsProfileModalOpen(true);
    };

    useEffect(() => {
      if (
        callType === 'videoCallFromOutgoing' ||
        callType === 'videoChatFromOutgoing' ||
        callType === 'videoCallFromIncoming' ||
        callType === 'videoChatFromIncoming' ||
        callType === 'live'
      )
        return;
      const showFullScreen = async () => {
        if (videoWrapperRef.current?.requestFullscreen) {
          await videoWrapperRef.current?.requestFullscreen();
          sessionStorage.setItem('isFullScreen', 'true');
        }
      };
      showFullScreen();
    }, []);

    useEffect(() => {
      setIsConnecting(isPurchasing || !isRemoteVideoReceived);
    }, [isPurchasing, isRemoteVideoReceived]);
    useEffect(() => {
      if (isSuccess) {
        const message =
          lastPurchasedPoints !== undefined
            ? `決済成功しました！${lastPurchasedPoints}ポイント追加しました！`
            : '決済成功しました！ポイントが追加されました！';
        toast(message);
        if (response?.point !== undefined) {
          setCurrentPoint(response.point);
        }
      }
      if (isSuccess === false && errorData) {
        toast(errorData.message);
      }
      onEnd();
    }, [isSuccess, errorData]);

    useEffect(() => {
      if (isMicMuted === undefined || isMicMuted === 'switching') return;
      setMicMutedPicState(isMicMuted ? 'muted' : 'notmuted');
    }, [isMicMuted]);

    const _onClickQuickCharge = (point: number, money: number) => {
      if (isPurchasing) return;
      setLastPurchasedPoints(point);
      startPurchase(point, money);
      setQuickChargeModalType('hide');
    };

    const handlePurchaseSuccess = (addedPoints: number) => {
      setIsAlvionModalOpen(false);
      setIsQuickChargeModalOpen(false);
      updatePointOptimistic(addedPoints);
      setLastPurchasedPoints(addedPoints);
      toast(
        <div
          className="inline-flex items-center"
          style={{ verticalAlign: 'middle' }}
        >
          <img
            src="/images/purchase_check_icon.webp"
            alt="購入完了"
            className="h-8 w-8"
            style={{ marginRight: '0.5em', verticalAlign: 'middle' }}
          />
          <span style={{ verticalAlign: 'middle', lineHeight: '32px' }}>
            {addedPoints}ポイントを購入しました。
          </span>
        </div>,
        {
          theme: 'light',
          className: 'bg-white',
          hideProgressBar: false,
          autoClose: 3000,
        },
      );
    };

    // ポイント購入ボタンクリック時の条件分岐処理
    const handlePointPurchaseClick = () => {
      trackInCallCharge();

      if (canQuickCharge) {
        setIsQuickChargeModalOpen(true);
      } else {
        setIsAlvionModalOpen(true);
      }
    };

    // 課金モーダルを閉じる時の処理（購入せずに閉じた場合、attributionをクリア）
    const handleClosePaymentModal = () => {
      setQuickChargeModalType('hide');
      setIsQuickChargeModalOpen(false);
      setIsAlvionModalOpen(false);
      clearInCallChargeAttribution();
    };

    // タップのやつ
    const toggleVisibility = () => {
      if (callState !== inCall) return;
      if (fullControlSession || isFullControlPanelActive) return;
      if (isQuickMessageModalOpen) {
        setIsQuickMessageModalOpen(false);
        return;
      }

      setIsVisible(!isVisible);
    };

    const [_presentMenuItems, setPresentMenuItems] = useState<
      GetPresentMenuListResponseElementData[]
    >([]);

    const [lovenseMenuItems, setLovenseMenuItems] = useState<LovenseMenuItem[]>(
      [],
    );

    const [fullControlSession, setFullControlSession] = useState<{
      partnerId: string;
      durationSec: number;
      startTime: number;
      endTime: number;
    } | null>(null);
    const [isFullControlPanelActive, setIsFullControlPanelActive] =
      useState(false);
    const handleSendRtmUpdate = useCallback(
      (payload: LovenseRtmUpdateMessage) => {
        if (!onSendMessageToChannel) return Promise.resolve();
        return onSendMessageToChannel(payload);
      },
      [onSendMessageToChannel],
    );

    const [uncompletedLovenseMenuItems, setUncompletedLovenseMenuItems] =
      useState<UncompletedLovenseLogItem[]>([]);
    const [isRouletteSpinning, _setIsRouletteSpinning] = useState(false);

    const fetchUncompletedLovenseMenuList = async (): Promise<
      UncompletedLovenseLogItem[]
    > => {
      try {
        const client = new ClientHttpClient();
        const response = await client.post<
          ResponseData<{
            logLovenseMenuList: UncompletedLovenseLogItem[];
          }>
        >(HTTP_GET_UNCOMPLETED_LOVENSE_LOG, {
          female_id: receiverId,
        });
        if (response.type === 'error') {
          console.error(
            'Failed to fetch uncompleted lovense menu list:',
            response.message,
          );
          return [];
        }
        return response.logLovenseMenuList || [];
      } catch (error) {
        console.error('Failed to fetch uncompleted lovense menu list:', error);
        return [];
      }
    };

    useEffect(() => {
      const intervalId = setInterval(async () => {
        // ルーレット回転中はスキップ
        if (isRouletteSpinning) {
          return;
        }

        try {
          const menuList = await fetchUncompletedLovenseMenuList();
          // 配列が変わった場合のみ更新
          setUncompletedLovenseMenuItems((prev) => {
            const isChanged = JSON.stringify(prev) !== JSON.stringify(menuList);
            if (isChanged) {
              return menuList;
            }
            return prev;
          });
        } catch (error) {
          console.error(
            'Failed to fetch uncompleted lovense menu list:',
            error,
          );
        }
      }, 1000); // 1秒ごとに実行

      return () => {
        clearInterval(intervalId);
      };
    }, [isRouletteSpinning, callType, isVisible]);

    const [clickModalOpen, setClickModalOpen] = useState(false);

    const [_liveMessages, setLiveMessages] = useState<MessageWithType[]>([]);

    const clickPresentMenu = () => {
      setClickModalOpen(true);
    };

    const fetchPresentMenuList = async (): Promise<
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
    };

    const fetchLovenseMenuList = async (): Promise<LovenseMenuItem[]> => {
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
          call_type: 'video',
        });
        if (response.type === 'error') {
          console.error(
            '[ラブンスメニュー] fetchLovenseMenuList error:',
            response.message,
          );
          return [];
        }

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
        console.error(
          '[ラブンスメニュー] fetchLovenseMenuList exception:',
          error,
        );
        return [];
      }
    };

    // フリマ商品一覧取得
    const fetchFleaMarketItems = async (): Promise<
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
    };

    // Loveenseメニューとプレゼントメニューのリストを取得
    useEffect(() => {
      const fetchLovenseMenu = async () => {
        try {
          const menuList = await fetchLovenseMenuList();
          // 配列が変わった場合のみ更新
          setLovenseMenuItems((prev) => {
            const isChanged = JSON.stringify(prev) !== JSON.stringify(menuList);
            if (isChanged) {
              return menuList;
            }
            return prev;
          });
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

      // フリマ商品取得（ビデオ通話の場合のみ）
      const fetchFleaMarket = async () => {
        if (
          callType !== 'videoCallFromOutgoing' &&
          callType !== 'videoCallFromIncoming' &&
          callType !== 'videoCallFromStandby'
        ) {
          return;
        }
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
    }, []);

    const _memberCount = usePollingStore((s) => s.memberCountUpdated);

    const {
      isBookmarked: isBookmarkedState,
      bookmarkCooldown,
      addBookmark,
      removeBookmark,
    } = useBookmark(broadcaster.userId, isBookmarked, session?.user?.id);

    // フリマ商品詳細を開く
    const handleViewFleaMarketItem = (itemId: string) => {
      setFleaMarketPurchaseTarget(null);
      setSelectedFleaMarketItemId(itemId);
      setIsFleaMarketOverlayOpen(true);
      setClickFleaMarketModalOpen(false);

      // GA4イベント発火
      trackEvent(event.OPEN_FLEA_MARKET_ITEM_DETAIL, {
        item_id: itemId,
        source: 'video_call',
        broadcaster_id: receiverId,
      });
    };

    // フリマ商品購入画面を開く
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

    // フリマオーバーレイを閉じる
    const handleFleaMarketOverlayClose = () => {
      setIsFleaMarketOverlayOpen(false);
      setSelectedFleaMarketItemId(null);
      setFleaMarketPurchaseTarget(null);
    };

    // フリマ購入完了ハンドラー
    const handleFleaMarketPurchaseComplete = async (
      data: FleaMarketPurchaseCompleteData,
    ) => {
      const { itemTitle, newPoint, itemId, price, transactionId } = data;

      // ポイント更新
      setCurrentPoint(newPoint);

      // 購入した商品がピックアップ商品の場合はクリア
      if (promotedItem?.item.itemId === itemId) {
        setPromotedFleaMarketItemId(null);
      }

      // 購入完了トースト表示
      // NOTE: react-toastifyのデフォルトCSSがTailwindより優先度が高いため、style属性を使用
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

      // GA4イベント発火
      trackEvent(event.COMPLETE_PURCHASE_FLEA_MARKET_ITEM, {
        item_id: itemId,
        price,
        transaction_id: transactionId,
        source: 'video_call',
        broadcaster_id: receiverId,
      });

      // 相手へ購入メッセージを送信（チャネルメッセージ）
      if (session?.user?.name && session?.user?.id) {
        const purchaseMessage = `「${itemTitle}」を購入しました🛒`;

        try {
          await onSendMessageToChannel?.({
            text: purchaseMessage,
            sender_name: session.user.name,
            sender_id: session.user.id,
            message_type: 'chat',
            receiver_id: receiverId,
            callType,
            fleaMarketItemPurchased: {
              messageType: 'fleaMarketItemPurchased',
              itemId,
              amount: price,
            },
          });
        } catch (err) {
          console.error(
            '[VideoComponent] Failed to send flea market purchase message:',
            err,
          );
        }
      }

      // 商品リスト更新（/fleamarket との同期）
      const updatedItems = await fetchFleaMarketItems();
      setFleaMarketItems(updatedItems);
    };

    const username =
      broadcaster.userName.length > 7
        ? `${broadcaster.userName.slice(0, 7)}...`
        : broadcaster.userName;

    // 表示条件を変数に抽出
    const isInCallState = callState === inCall;
    const isBeforeCallState = callState === beforeCall;
    const isVideoChat =
      callType === 'videoChatFromOutgoing' ||
      callType === 'videoChatFromIncoming';
    const isVideoCall =
      callType === 'videoCallFromOutgoing' ||
      callType === 'videoCallFromIncoming';
    const isLiveStreaming = callType === 'live';

    // 複合条件を変数に抽出
    const shouldShowChatArea =
      isLiveStreaming || (isInCallState && isVideoChat);
    const shouldShowOutgoingCameraButton =
      isBeforeCallState && callType === 'videoCallFromOutgoing' && isVisible;
    const shouldShowInCallElements = isInCallState && isVisible;
    const shouldShowButtonGroup =
      callType === 'videoCallFromStandby' ||
      callType === 'videoCallFromOutgoing' ||
      callType === 'videoCallFromIncoming';

    // アクティブなLovenseメニューアイテムをメモ化（残り時間が0秒以下のアイテムを除外）
    const activeLovenseItems = useMemo(() => {
      if (uncompletedLovenseMenuItems.length === 0) return [];

      return uncompletedLovenseMenuItems.filter((item) => {
        const isMilliseconds = item.startTime > MILLISECOND_THRESHOLD;

        // 現在時刻を取得（ミリ秒または秒）
        const now = isMilliseconds ? Date.now() : Date.now() / 1000;

        // 残り時間を計算
        const remaining = item.endTime - now;
        const hasStarted = item.startTime <= now;
        const isRecentlyStarted = isMilliseconds
          ? now - item.startTime < RECENT_START_WINDOW_MS
          : now - item.startTime < RECENT_START_WINDOW_SEC;

        // 基本条件: 残り時間があり、開始済みで、最近開始されたもの
        const meetsBasicConditions =
          remaining > 0 && hasStarted && isRecentlyStarted;

        return meetsBasicConditions;
      });
    }, [uncompletedLovenseMenuItems]);

    const shouldShowFullControlPanel =
      (isLiveStreaming || isVideoCall || isVideoChat) &&
      activeLovenseItems.length > 0 &&
      activeLovenseItems[0]?.type === '完全コントロール';

    useEffect(() => {
      if (!shouldShowFullControlPanel) {
        if (fullControlSession !== null) {
          setFullControlSession(null);
        }
        return;
      }

      if (!isVisible) {
        setIsVisible(true);
      }

      const item = activeLovenseItems[0];
      if (!item) return;

      if (
        fullControlSession &&
        fullControlSession.startTime === item.startTime &&
        fullControlSession.endTime === item.endTime
      ) {
        return;
      }

      setFullControlSession({
        partnerId: receiverId,
        durationSec: item.duration,
        startTime: item.startTime,
        endTime: item.endTime,
      });
    }, [
      shouldShowFullControlPanel,
      activeLovenseItems,
      fullControlSession,
      receiverId,
    ]);

    return (
      <>
        <div className={styles.video_wrapper} ref={videoWrapperRef}>
          {clickModalOpen && (
            <LovenseItemsModal
              lovenseMenuItems={lovenseMenuItems}
              onClose={() => setClickModalOpen(false)}
              receiverId={receiverId}
              onSendMessageToChannel={onSendMessageToChannel}
              setLiveMessages={setLiveMessages}
              callType="video"
              isPCView={false}
              onTicketUsed={async () => {
                const updatedMenuList = await fetchLovenseMenuList();
                setLovenseMenuItems(updatedMenuList);
              }}
            />
          )}
          {fullControlSession && (
            <LovenseFullControlModal
              partnerId={fullControlSession.partnerId}
              sessionDurationSec={fullControlSession.durationSec}
              sessionStartTime={fullControlSession.startTime}
              sessionEndTime={fullControlSession.endTime}
              onSendRtmUpdate={handleSendRtmUpdate}
              onClose={() => setFullControlSession(null)}
            />
          )}
          {isConnecting && callState === inCall && (
            <div className={styles.loadingSpinner}>
              <BeatLoader color="#00bfff" size={15} />
            </div>
          )}

          <div
            className={styles.video_screen}
            onClick={toggleVisibility}
            ref={videoScreenRef}
          >
            {/* 通話中でポイント不足モーダルが表示されている場合はポイント不足モーダルを表示 & 入室から30秒間はポイント不足モーダルを表示しない */}
            {callState === inCall &&
              quickChargeModalType !== 'hide' &&
              callTime !== undefined &&
              callTime >= 30 &&
              (canQuickCharge ? (
                <AlvionQuickChargeModal
                  token={session?.user.token || ''}
                  onClose={handleClosePaymentModal}
                  onSuccess={handlePurchaseSuccess}
                  onOpenPaymentModal={() => {
                    setQuickChargeModalType('hide');
                    setIsQuickChargeModalOpen(false);
                    setIsAlvionModalOpen(true);
                  }}
                  title={
                    // 入室から60秒間は残り30秒で通話が終了します！と表示、それ以降は残り1分で通話が終了します！と表示
                    callTime < 60
                      ? '残り30秒で通話が終了します！'
                      : '残り1分で通話が終了します！'
                  }
                  hideLowestPackage={true}
                  source="live"
                />
              ) : (
                <AlvionPaymentModal
                  token={session?.user.token || ''}
                  onClose={handleClosePaymentModal}
                  onSuccess={handlePurchaseSuccess}
                  title={
                    // 入室から60秒間は残り30秒で通話が終了します！と表示、それ以降は残り1分で通話が終了します！と表示
                    callTime < 60
                      ? '残り30秒で通話が終了します！'
                      : '残り1分で通話が終了します！'
                  }
                  hideLowestPackage={true}
                  source="live"
                />
              ))}
            <div
              id="local_video"
              className={`${
                callState === beforeCall
                  ? styles.local_video_outgoing_call
                  : styles.local_video
              } ${isVisible ? 'block' : 'hidden'}`}
            ></div>
            <div id="remote_video" className={styles.remote_video}></div>
            {callState === inCall && isVisible && (
              <div
                className={styles.point_card}
                onClick={(event) => {
                  event.stopPropagation();
                  handlePointPurchaseClick();
                }}
              >
                <PointCard />
              </div>
            )}
            <div
              className={`${styles.name} ${callState === inCall && isVisible ? 'block' : 'hidden'}`}
            >
              <div className="relative flex items-center gap-[3px]">
                <button
                  type="button"
                  onClick={handleProfileButtonClick}
                  className={styles.prf}
                  aria-label="プロフィールを表示"
                >
                  <RoundedThumbnail
                    avatarId={broadcaster.avatarId}
                    deviceCategory="mobile"
                    customSize={{ width: 34, height: 34 }}
                  />
                </button>
                {isPartnerMicMuted && (
                  <Image alt={'mute'} src={micOffPic} width={13} height={13} />
                )}
                <div>{username}</div>
                <div className={styles.bookmark}>
                  {!isBookmarkedState ? (
                    <div
                      className={styles.bookmarkMessage}
                      onClick={isBookmarked ? removeBookmark : addBookmark}
                    >
                      <Image
                        src={bookmarkBeforePic}
                        alt="お気に入りする"
                        width={30}
                        height={30}
                        className="cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div
                      className={styles.bookmarkedMessage}
                      onClick={isBookmarked ? removeBookmark : addBookmark}
                    >
                      <Image
                        src={bookmarkAfterPic}
                        alt="お気に入り済み"
                        width={30}
                        height={30}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(callType === 'live' ||
              callType === 'videoChatFromOutgoing' ||
              callType === 'videoChatFromIncoming') &&
              isVisible && (
                <div className={styles.viewCountWrapper}>
                  <div className={styles.viewCount}>
                    <Image
                      src={humanPic}
                      alt="視聴者人数"
                      width={15}
                      height={15}
                      className={styles.humanlogo}
                    />
                    {viewCount}
                  </div>
                </div>
              )}
            {(isLiveStreaming || isVideoCall) &&
              activeLovenseItems.length > 0 &&
              activeLovenseItems[0] && (
                <div
                  className={
                    isVideoCall
                      ? styles.circularTimerContainerVideoCall
                      : styles.circularTimerContainer
                  }
                >
                  {/* 1件目：円形タイマー */}
                  <LovenseCircularTimer
                    duration={activeLovenseItems[0].duration}
                    startTime={activeLovenseItems[0].startTime}
                    endTime={activeLovenseItems[0].endTime}
                    type={activeLovenseItems[0].type}
                    userName={activeLovenseItems[0].maleName}
                    showUserInfo={isLiveStreaming || isVideoCall}
                    noMarginLeft={isVideoCall}
                  />

                  {/* 2件目以降：名前とメニュー名だけ表示（最大3件まで）- ビデオ通話時は非表示 */}
                  {isLiveStreaming && (
                    <>
                      {activeLovenseItems.slice(1, 3).map((item, index) => (
                        <div key={index} className={styles.lovenseQueueItem}>
                          <div className={styles.queueUserName}>
                            {item.maleName}
                          </div>
                          <div className={styles.queueMenuInfo}>
                            {item.duration}秒 | {item.type}
                          </div>
                        </div>
                      ))}

                      {/* 4件以上ある場合は︙を表示 */}
                      {activeLovenseItems.length > 3 && (
                        <div className={styles.moreIndicator}>︙</div>
                      )}
                    </>
                  )}
                </div>
              )}
            {(callType === 'live' ||
              (callState === inCall && callType === 'videoChatFromOutgoing') ||
              (callState === inCall &&
                callType === 'videoChatFromIncoming')) && (
              <div>
                {/* Renka(iOS/Android)環境ではロゴを非表示 */}
                {!isNativeApplication() && (
                  <div className={styles.livelogo}>
                    <Image
                      src={logoPic}
                      alt="Utage"
                      width={120}
                      height={40}
                      className="livelogo"
                    />
                  </div>
                )}
                {/* <div className={styles.liveid}>{userId}</div> */}
              </div>
            )}
            {!isPC && shouldShowChatArea && (
              <div className={styles.live_chat_area}>
                <LiveChatArea
                  onSendMessageToChannel={onSendMessageToChannel}
                  receiverId={channelInfo.peerId ?? ''}
                  channelId={channelInfo.channelId ?? ''}
                  liveCallType={isVideoChat ? 'live' : callType}
                  isVisible={isVisible}
                  isPCView={false}
                  broadcasterName={broadcaster?.userName || ''}
                  broadcasterAbout={broadcaster?.about || ''}
                  onFullControlActiveChange={setIsFullControlPanelActive}
                />
              </div>
            )}

            {/* おねだりクイックメニュー（モバイル版のみ） */}

            {/* 発信中のカメラ切替ボタン（赤いボタンの左側に配置） */}
            {shouldShowOutgoingCameraButton && (
              <div className={styles.cameraButtonForOutgoing}>
                <button
                  className={styles.iconButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    switchCamera?.();
                  }}
                >
                  <Image
                    src={swapPic}
                    alt="カメラ切替"
                    width={30}
                    height={30}
                  />
                </button>
                <span className={styles.buttonLabel}>カメラ切替</span>
              </div>
            )}

            {/* 通話中の要素 */}
            {shouldShowInCallElements && (
              <>
                {/* 統一された閉じるボタン表示（PCでチャットエリアがある場合はチャットの×ボタンを使うため非表示） */}
                {!(isPC && shouldShowChatArea) && (
                  <div className={styles.stop_call_btn}>
                    <StopCallButton />
                  </div>
                )}

                {/* 通話中のボタングループ */}
                {shouldShowButtonGroup && (
                  <div className={styles.buttonGroup}>
                    <div className={styles.buttonContainer}>
                      <button
                        className={styles.iconButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          switchCamera?.();
                        }}
                      >
                        <Image
                          src={swapPic}
                          alt="カメラ切替"
                          width={30}
                          height={30}
                        />
                      </button>
                      <span className={styles.buttonLabel}>カメラ切替</span>
                    </div>
                    {isMicMuted !== undefined && (
                      <div className={styles.buttonContainer}>
                        <button
                          className={styles.iconButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            changeMicState();
                          }}
                        >
                          <Image
                            src={
                              micMutedPicState === 'muted' ? micOffPic : micPic
                            }
                            alt="マイク"
                            width={30}
                            height={30}
                          />
                        </button>
                        <span className={styles.buttonLabel}>マイク</span>
                      </div>
                    )}
                    <div className={styles.buttonContainer}>
                      <button
                        className={styles.iconButton}
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePointPurchaseClick();
                        }}
                      >
                        <Image
                          src={pointPic}
                          alt="ポイント"
                          width={30}
                          height={30}
                        />
                      </button>
                      <span className={styles.buttonLabel}>ポイント購入</span>
                    </div>
                    {lovenseMenuItems.length > 0 && (
                      <div className={styles.buttonContainer}>
                        <button
                          className={styles.iconButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            clickPresentMenu();
                          }}
                        >
                          <Image
                            src={LovensePic}
                            alt="ラブンスメニュー"
                            width={30}
                            height={30}
                          />
                        </button>
                        <span className={styles.buttonLabel}>
                          ラブンスメニュー
                        </span>
                      </div>
                    )}
                    {fleaMarketItems.length > 0 && (
                      <div className={styles.buttonContainer}>
                        <button
                          className="relative flex h-[50px] w-[50px] items-center justify-center rounded-full border-none bg-black/30 p-2.5"
                          onClick={(event) => {
                            event.stopPropagation();
                            setClickFleaMarketModalOpen(true);
                          }}
                        >
                          <Image
                            src="/setting_icon/flema_live.webp"
                            alt="フリマ"
                            width={30}
                            height={30}
                          />
                          {/* 出品数バッジ */}
                          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
                            {fleaMarketItems.length > 99
                              ? '99+'
                              : fleaMarketItems.length}
                          </div>
                        </button>
                        <span className={styles.buttonLabel}>フリマ</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            partnerInfo={{
              ...broadcaster,
              isNewUser: false,
            }}
          />

          <StopCallModal onLeave={cancel} callType={callType} />
          {isAlvionModalOpen && (
            <AlvionPaymentModal
              token={session?.user.token || ''}
              onClose={handleClosePaymentModal}
              onSuccess={handlePurchaseSuccess}
              hideLowestPackage={true}
              isPC={false}
              source="live"
            />
          )}

          {isQuickChargeModalOpen && (
            <AlvionQuickChargeModal
              token={session?.user.token || ''}
              onClose={handleClosePaymentModal}
              onSuccess={handlePurchaseSuccess}
              onOpenPaymentModal={() => {
                setIsQuickChargeModalOpen(false);
                setIsAlvionModalOpen(true);
              }}
              hideLowestPackage={true}
              source="live"
            />
          )}

          {/* ピックアップ商品（女性側からRTMで指定された商品）- ビデオ通話用 */}
          {isVideoCall && promotedItem && isVisible && (
            <div className={styles.promotedItemContainer}>
              <FleaMarketLatestItem
                item={promotedItem}
                isPromoted={true}
                onClick={() => {
                  handleViewFleaMarketItem(promotedItem.item.itemId);
                }}
                onPurchase={() => {
                  handleOpenFleaMarketPurchase(promotedItem);
                }}
                onDismiss={clearPromotedItem}
              />
            </div>
          )}

          {/* フリマ商品一覧モーダル（ビデオ通話用） */}
          {clickFleaMarketModalOpen && (
            <FleaMarketModal
              items={fleaMarketItems}
              onClose={() => setClickFleaMarketModalOpen(false)}
              isPCView={false}
              onViewItem={handleViewFleaMarketItem}
              onPurchase={(item) => {
                setClickFleaMarketModalOpen(false);
                handleOpenFleaMarketPurchase(item);
              }}
              userName={broadcaster?.userName ?? ''}
            />
          )}

          {/* フリマ商品詳細オーバーレイ（ビデオ通話用） */}
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
        </div>

        {/* Lovenseクイックメニュー（モバイル版のみ） - stacking context回避のため video_screen の外に配置 */}
        {!isPC &&
          isVisible &&
          isLiveStreaming &&
          lovenseMenuItems.length > 0 && (
            <LovenseQuickMenu
              lovenseMenuItems={lovenseMenuItems}
              receiverId={receiverId}
              callType={callType}
              onSendMessageToChannel={onSendMessageToChannel}
              setLiveMessages={setLiveMessages}
              setCurrentPoint={setCurrentPoint}
              isModalOpen={
                isQuickChargeModalOpen ||
                isAlvionModalOpen ||
                quickChargeModalType !== 'hide'
              }
            />
          )}

        {/* PC版チャットエリア - 右側30%に表示 */}
        {isPC && shouldShowChatArea && (
          <div className={styles.pcChatArea}>
            <div className={styles.pcChatInner}>
              <div className={styles.pcChatHeader}>
                <h3 className={styles.pcChatTitle}>チャット</h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openStopCallModal();
                  }}
                  className={styles.pcChatCloseButton}
                  aria-label="退室"
                >
                  <span className={styles.pcChatCloseIcon}>×</span>
                </button>
              </div>
              <div className={styles.pcChatContent}>
                <LiveChatArea
                  onSendMessageToChannel={onSendMessageToChannel}
                  receiverId={channelInfo.peerId ?? ''}
                  channelId={channelInfo.channelId ?? ''}
                  liveCallType={isVideoChat ? 'live' : callType}
                  isVisible={isVisible}
                  isPCView={true}
                  broadcasterName={broadcaster?.userName || ''}
                  broadcasterAbout={broadcaster?.about || ''}
                  onFullControlActiveChange={setIsFullControlPanelActive}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
);

VideoComponent.displayName = 'VideoComponent';
