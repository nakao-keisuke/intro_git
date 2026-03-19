import { useSession } from '#/hooks/useSession';
import { useState } from 'react';
import type { PurchaseRouteResponse } from '@/apis/http/purchase';
import {
  HTTP_PURCHASE_AUDIO,
  HTTP_PURCHASE_IMAGE,
  HTTP_PURCHASE_VIDEO,
} from '@/constants/endpoints';
import { EVENT_NAMES } from '@/constants/eventNames';
import { event } from '@/constants/ga4Event';
import { PRICING_INFO } from '@/constants/pricing';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
import type { ChatFileArchiveInfo } from '@/services/profile/type';
import { trackEvent } from '@/utils/eventTracker';
import {
  clearPurchaseAttribution,
  formatAttributionForSource,
  getPurchaseAttribution,
} from '@/utils/purchaseAttribution';

// 購入に必要な最小限の情報（mediaIdのみ必須）
type PurchaseItem = Pick<ChatFileArchiveInfo, 'mediaId'>;

type UsePurchaseReturn = {
  notEnoughPointModalOpen: boolean;
  purchaseSuccessModalOpen: boolean;
  purchasedMediaType: 'video' | 'image' | 'audio' | null;
  /** ポイント不足時に購入しようとしたメディアタイプ */
  attemptedMediaType: 'video' | 'image' | 'audio' | null;
  selectedMedia: PurchaseItem | null;
  closeNotEnoughPointModal: () => void;
  closePurchaseSuccessModal: () => void;
  purchaseVideo: (item: PurchaseItem) => Promise<boolean>;
  purchaseImage: (item: PurchaseItem) => Promise<boolean>;
  purchaseAudio: (item: PurchaseItem) => Promise<boolean>;
};

/**
 * 購入機能のCustom Hook
 * @param onPurchaseSuccess - 購入成功時のコールバック（購入済み状態を更新）
 */
export function usePurchase(
  onPurchaseSuccess?: (
    mediaId: string,
    mediaType: 'video' | 'image' | 'audio',
  ) => void,
): UsePurchaseReturn {
  const { data: session } = useSession();
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const [purchaseSuccessModalOpen, setPurchaseSuccessModalOpen] =
    useState(false);
  const [purchasedMediaType, setPurchasedMediaType] = useState<
    'video' | 'image' | 'audio' | null
  >(null);
  const [attemptedMediaType, setAttemptedMediaType] = useState<
    'video' | 'image' | 'audio' | null
  >(null);
  const [selectedMedia, setSelectedMedia] = useState<PurchaseItem | null>(null);

  const closeNotEnoughPointModal = () => {
    setNotEnoughPointModalOpen(false);
    setAttemptedMediaType(null);
  };
  const closePurchaseSuccessModal = () => setPurchaseSuccessModalOpen(false);

  const purchaseVideo = async (item: PurchaseItem): Promise<boolean> => {
    if (!item.mediaId) return false;

    const httpClient = new ClientHttpClient();
    const response = await httpClient.post<PurchaseRouteResponse>(
      HTTP_PURCHASE_VIDEO,
      { fileId: item.mediaId },
    );

    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setSelectedMedia(item);
        setAttemptedMediaType('video');
        setNotEnoughPointModalOpen(true);
      }
      return false;
    }

    // 購入成功
    onPurchaseSuccess?.(item.mediaId, 'video');
    setSelectedMedia(item);
    setPurchasedMediaType('video');
    setPurchaseSuccessModalOpen(true);
    // Purchase Attributionを取得してGA4イベント送信
    const source = formatAttributionForSource(getPurchaseAttribution());
    const videoPrice =
      (PRICING_INFO.find((p) => p.label === '動画開封')?.price as number) ??
      120;
    trackEvent(event.COMPLETE_BUY_VIDEO, {
      file_id: item.mediaId,
      price: videoPrice,
      user_id: session?.user?.id,
      from: window.location.pathname,
      source,
    });
    // 送信後にattributionをクリア
    clearPurchaseAttribution();
    localStorage.setItem('purchaseGalleryItem', 'true');
    return true;
  };

  const purchaseImage = async (item: PurchaseItem): Promise<boolean> => {
    if (!item.mediaId) return false;

    const httpClient = new ClientHttpClient();
    const response = await httpClient.post<PurchaseRouteResponse>(
      HTTP_PURCHASE_IMAGE,
      { imageId: item.mediaId },
    );

    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setSelectedMedia(item);
        setAttemptedMediaType('image');
        setNotEnoughPointModalOpen(true);
      }
      return false;
    }

    // 購入成功
    onPurchaseSuccess?.(item.mediaId, 'image');
    // Purchase Attributionを取得してGA4イベント送信
    const source = formatAttributionForSource(getPurchaseAttribution());
    const imagePrice =
      (PRICING_INFO.find((p) => p.label === '画像開封')?.price as number) ?? 75;
    trackEvent(event.COMPLETE_BUY_IMAGE, {
      file_id: item.mediaId,
      price: imagePrice,
      user_id: session?.user?.id,
      from: window.location.pathname,
      source,
    });
    // 送信後にattributionをクリア
    clearPurchaseAttribution();
    localStorage.setItem('purchaseGalleryItem', 'true');
    setSelectedMedia(item);
    setPurchasedMediaType('image');
    setPurchaseSuccessModalOpen(true);
    return true;
  };

  const purchaseAudio = async (item: PurchaseItem): Promise<boolean> => {
    if (!item.mediaId) return false;

    const httpClient = new ClientHttpClient();
    const response = await httpClient.post<PurchaseRouteResponse>(
      HTTP_PURCHASE_AUDIO,
      { audioId: item.mediaId },
    );

    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setSelectedMedia(item);
        setAttemptedMediaType('audio');
        setNotEnoughPointModalOpen(true);
      }
      return false;
    }

    // 購入成功
    onPurchaseSuccess?.(item.mediaId, 'audio');
    // Purchase Attributionを取得してGA4イベント送信
    const source = formatAttributionForSource(getPurchaseAttribution());
    // 音声は画像と同価格を採用（仕様準拠）
    const audioPrice =
      (PRICING_INFO.find((p) => p.label === '画像開封')?.price as number) ?? 75;
    trackEvent(EVENT_NAMES.COMPLETE_BUY_AUDIO, {
      file_id: item.mediaId,
      price: audioPrice,
      user_id: session?.user?.id,
      from: window.location.pathname,
      source,
    });
    // 送信後にattributionをクリア
    clearPurchaseAttribution();
    localStorage.setItem('purchaseGalleryItem', 'true');
    setSelectedMedia(item);
    setPurchasedMediaType('audio');
    setPurchaseSuccessModalOpen(true);
    return true;
  };

  return {
    notEnoughPointModalOpen,
    purchaseSuccessModalOpen,
    purchasedMediaType,
    attemptedMediaType,
    selectedMedia,
    closeNotEnoughPointModal,
    closePurchaseSuccessModal,
    purchaseVideo,
    purchaseImage,
    purchaseAudio,
  };
}
