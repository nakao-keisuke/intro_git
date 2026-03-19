import { useState } from 'react';
import type { PurchaseRouteResponse } from '@/apis/http/purchase';
import {
  HTTP_PURCHASE_IMAGE,
  HTTP_PURCHASE_VIDEO,
} from '@/constants/endpoints';
import { event } from '@/constants/ga4Event';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';
// 新ルートに直アクセス（constantsは旧実装のため変更しない）
import type { ChatFileArchiveInfo } from '@/services/profile/type';
import { trackEvent } from '@/utils/eventTracker';

type UsePurchaseReturn = {
  notEnoughPointModalOpen: boolean;
  purchaseSuccessModalOpen: boolean;
  purchasedMediaType: 'video' | 'image' | null;
  selectedMedia: ChatFileArchiveInfo | null;
  closeNotEnoughPointModal: () => void;
  closePurchaseSuccessModal: () => void;
  purchaseVideo: (item: ChatFileArchiveInfo) => Promise<boolean>;
  purchaseImage: (item: ChatFileArchiveInfo) => Promise<boolean>;
};
/**
 * 購入機能のCustom Hook
 * @param onPurchaseSuccess - 購入成功時のコールバック（購入済み状態を更新）
 */
export function usePurchase(
  onPurchaseSuccess?: (mediaId: string, mediaType: 'video' | 'image') => void,
): UsePurchaseReturn {
  const [notEnoughPointModalOpen, setNotEnoughPointModalOpen] = useState(false);
  const [purchaseSuccessModalOpen, setPurchaseSuccessModalOpen] =
    useState(false);
  const [purchasedMediaType, setPurchasedMediaType] = useState<
    'video' | 'image' | null
  >(null);
  const [selectedMedia, setSelectedMedia] =
    useState<ChatFileArchiveInfo | null>(null);
  const closeNotEnoughPointModal = () => setNotEnoughPointModalOpen(false);
  const closePurchaseSuccessModal = () => setPurchaseSuccessModalOpen(false);
  const purchaseVideo = async (item: ChatFileArchiveInfo): Promise<boolean> => {
    if (!item.mediaId) return false;
    const client = new ClientHttpClient();
    const response = await client.post<PurchaseRouteResponse>(
      HTTP_PURCHASE_VIDEO,
      { fileId: item.mediaId },
    );
    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
      }
      return false;
    }
    // 購入成功
    onPurchaseSuccess?.(item.mediaId, 'video');
    setSelectedMedia(item);
    setPurchasedMediaType('video');
    setPurchaseSuccessModalOpen(true);
    trackEvent(event.COMPLETE_BUY_VIDEO, { from: window.location.pathname });
    localStorage.setItem('purchaseGalleryItem', 'true');
    return true;
  };
  const purchaseImage = async (item: ChatFileArchiveInfo): Promise<boolean> => {
    if (!item.mediaId) return false;
    const client = new ClientHttpClient();
    const response = await client.post<PurchaseRouteResponse>(
      HTTP_PURCHASE_IMAGE,
      { imageId: item.mediaId },
    );
    if (response.type === 'error') {
      if (response.notEnoughPoint) {
        setNotEnoughPointModalOpen(true);
      }
      return false;
    }
    // 購入成功
    onPurchaseSuccess?.(item.mediaId, 'image');
    trackEvent(event.COMPLETE_BUY_IMAGE, { from: window.location.pathname });
    localStorage.setItem('purchaseGalleryItem', 'true');
    setSelectedMedia(item);
    setPurchasedMediaType('image');
    setPurchaseSuccessModalOpen(true);
    return true;
  };

  return {
    notEnoughPointModalOpen,
    purchaseSuccessModalOpen,
    purchasedMediaType,
    selectedMedia,
    closeNotEnoughPointModal,
    closePurchaseSuccessModal,
    purchaseVideo,
    purchaseImage,
  };
}
