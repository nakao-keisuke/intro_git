import { useQuery } from '@tanstack/react-query';
import {
  type FleaMarketItemWithFavorites,
  getFleaMarketItemListRequest,
} from '@/apis/get-flea-market-item-list';
import { GET_FLEA_MARKET_ITEM_LIST } from '@/constants/endpoints';
import { postToNext } from '@/utils/next';

/**
 * 出品者の商品リストを取得するカスタムフック
 * @param sellerId - 出品者のユーザーID
 * @returns React Query の useQuery レスポンス（5分間キャッシュ有効）
 */
export const useSellerItems = (
  sellerId: string,
  options: { enabled?: boolean } = {},
) => {
  const isEnabled = Boolean(sellerId) && (options.enabled ?? true);
  return useQuery({
    queryKey: ['sellerItems', sellerId],
    queryFn: async () => {
      const req = getFleaMarketItemListRequest(
        'all',
        20,
        1,
        undefined,
        sellerId,
      );
      const res = await postToNext<{
        code: number;
        data: FleaMarketItemWithFavorites[] | null;
        message?: string;
      }>(GET_FLEA_MARKET_ITEM_LIST, req);

      if (res.type === 'error' || res.code !== 0 || !Array.isArray(res.data)) {
        throw new Error(res.message || '商品の取得に失敗しました');
      }

      return res.data;
    },
    // プロフィール画面間の遷移で再フェッチを防ぎ、ブラウザバック時の UX を向上
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ有効
    gcTime: 10 * 60 * 1000, // 10分間メモリ保持（staleTime の2倍を目安）
    retry: false,
    enabled: isEnabled,
  });
};
