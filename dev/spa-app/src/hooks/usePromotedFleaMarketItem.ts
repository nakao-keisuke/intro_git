import { useCallback, useEffect, useState } from 'react';
import {
  type FleaMarketItemDetailWithFavorites,
  getFleaMarketItemDetailRequest,
} from '@/apis/get-flea-market-item-detail';
import { GET_FLEA_MARKET_ITEM_DETAIL } from '@/constants/endpoints';
import { useFleaMarketStore } from '@/features/fleamarket/store/fleaMarketStore';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import { postToNext } from '@/utils/next';

/**
 * ピックアップ商品を管理するhook
 *
 * 女性側からRTMメッセージで指定された商品を取得して返す
 * - updatePromotedFleaMarketItem: 商品を指定
 * - deletePromotedFleaMarketItem: 商品を削除
 */
export const usePromotedFleaMarketItem = () => {
  const promotedItemId = useFleaMarketStore((s) => s.promotedItemId);
  const [promotedItem, setPromotedItem] =
    useState<FleaMarketItemWithFavoritesCamel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 商品詳細を取得
  const fetchItemDetail = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      const req = getFleaMarketItemDetailRequest(itemId);
      const response = await postToNext<{
        code: number;
        data: FleaMarketItemDetailWithFavorites | null;
      }>(GET_FLEA_MARKET_ITEM_DETAIL, req);

      if (response.type === 'error' || response.code !== 0 || !response.data) {
        console.error(
          '[usePromotedFleaMarketItem] Failed to fetch item:',
          response,
        );
        setPromotedItem(null);
        return;
      }

      // snake_case → camelCase 変換
      const item = response.data.item;
      const camelCaseItem: FleaMarketItemWithFavoritesCamel = {
        item: {
          itemId: item.item_id,
          sellerId: item.seller_id,
          title: item.title,
          description: item.description,
          images: item.images,
          price: item.price,
          category: item.category,
          salesStatus: item.sales_status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
        favCount: response.data.fav_count,
      };

      setPromotedItem(camelCaseItem);
    } catch (error) {
      console.error('[usePromotedFleaMarketItem] Error fetching item:', error);
      setPromotedItem(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // itemIdが変更されたら商品詳細を取得
  useEffect(() => {
    if (promotedItemId) {
      fetchItemDetail(promotedItemId);
    } else {
      setPromotedItem(null);
    }
  }, [promotedItemId, fetchItemDetail]);

  // ピックアップ商品をクリアする関数
  const clearPromotedItem = useCallback(() => {
    setPromotedItem(null);
  }, []);

  return {
    promotedItem,
    promotedItemId,
    isLoading,
    clearPromotedItem,
  };
};
