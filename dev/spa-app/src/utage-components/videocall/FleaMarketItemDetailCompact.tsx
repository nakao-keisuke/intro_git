import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { useSession } from '#/hooks/useSession';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  type FleaMarketItemDetail,
  type FleaMarketItemDetailWithFavorites,
  type GetFleaMarketItemDetailResponseData,
  getFleaMarketItemDetailRequest,
} from '@/apis/get-flea-market-item-detail';
import { GET_FLEA_MARKET_ITEM_DETAIL } from '@/constants/endpoints';
import {
  type FleaMarketApiResponse,
  isErrorResponse,
} from '@/types/FleaMarketError';
import { calculateShippingFee } from '@/utils/fleamarket';
import { imageUrlForFleaMarket } from '@/utils/image';
import { postToNext } from '@/utils/next';

export type ItemDataForPurchase = {
  itemId: string;
  title: string;
  price: number;
  images: string[];
};

type Props = {
  itemId: string;
  onBack: () => void;
  onPurchase: (itemData: ItemDataForPurchase) => void;
};

// Type guard function
function isFleaMarketItemDetail(data: unknown): data is FleaMarketItemDetail {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.item_id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.price === 'number' &&
    Array.isArray(obj.images) &&
    typeof obj.seller_id === 'string'
  );
}

const FleaMarketItemDetailCompact = memo<Props>(
  ({ itemId, onBack, onPurchase }) => {
    const { status } = useSession();
    const [item, setItem] = useState<FleaMarketItemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // スワイプ用のref
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useEffect(() => {
      const fetchItemDetail = async () => {
        if (status === 'loading') return;
        if (!itemId || itemId === 'undefined') {
          setError('商品IDが指定されていません');
          setIsLoading(false);
          return;
        }

        try {
          const request = getFleaMarketItemDetailRequest(itemId);
          const response = await postToNext<
            FleaMarketApiResponse<GetFleaMarketItemDetailResponseData>
          >(GET_FLEA_MARKET_ITEM_DETAIL, request);

          if (response.type === 'error' || isErrorResponse(response)) {
            throw new Error(response.message ?? 'エラーが発生しました');
          }

          if (response.data) {
            if (response.data.item && response.data.fav_count !== undefined) {
              const itemData =
                response.data as FleaMarketItemDetailWithFavorites;
              setItem(itemData.item);
            } else if (isFleaMarketItemDetail(response.data)) {
              setItem(response.data);
            } else {
              throw new Error('商品データの形式が不正です');
            }
          } else {
            throw new Error('商品が見つかりませんでした');
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : '商品情報の取得に失敗しました',
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchItemDetail();
    }, [status, itemId]);

    // スワイプハンドラー
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      touchStartX.current = e.touches[0]?.clientX ?? null;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      touchEndX.current = e.touches[0]?.clientX ?? null;
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (!touchStartX.current || !touchEndX.current || !item?.images) return;

      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (diff > threshold && currentImageIndex < item.images.length - 1) {
        // 左スワイプ - 次の画像
        setCurrentImageIndex((prev) => prev + 1);
      } else if (diff < -threshold && currentImageIndex > 0) {
        // 右スワイプ - 前の画像
        setCurrentImageIndex((prev) => prev - 1);
      }

      touchStartX.current = null;
      touchEndX.current = null;
    }, [currentImageIndex, item?.images]);

    const goToPrevImage = useCallback(() => {
      if (currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    }, [currentImageIndex]);

    const goToNextImage = useCallback(() => {
      if (item?.images && currentImageIndex < item.images.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    }, [currentImageIndex, item?.images]);

    const formatPrice = (price: number) => price.toLocaleString('ja-JP');

    const isSold = item?.sales_status === 'sold';
    const shippingFee = item ? calculateShippingFee(item.price) : 0;
    const totalPrice = item ? item.price + shippingFee : 0;
    const hasMultipleImages = item?.images && item.images.length > 1;

    if (isLoading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-pink-500" />
          <p className="text-gray-600 text-sm">読み込み中...</p>
        </div>
      );
    }

    if (error || !item) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
          <p className="text-gray-600 text-sm">
            {error ?? '商品が見つかりませんでした'}
          </p>
          <button
            onClick={onBack}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-800 text-sm"
          >
            戻る
          </button>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col overflow-hidden bg-white">
        {/* 画像スライダー */}
        <div
          className="relative flex-1 bg-gray-100"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {item.images && item.images.length > 0 ? (
            <>
              <Image
                src={imageUrlForFleaMarket(
                  item.images[currentImageIndex] ?? item.images[0] ?? '',
                )}
                alt={item.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
              {isSold && (
                <div className="absolute top-0 left-0 z-10 h-0 w-0 border-t-[80px] border-t-red-500 border-l-[80px] border-l-transparent">
                  <span className="absolute -top-[65px] -left-[55px] -rotate-45 whitespace-nowrap font-bold text-base text-white">
                    SOLD
                  </span>
                </div>
              )}

              {/* 左右ナビボタン */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevImage}
                    disabled={currentImageIndex === 0}
                    className={`absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity ${
                      currentImageIndex === 0 ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <IconChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNextImage}
                    disabled={currentImageIndex === item.images.length - 1}
                    className={`absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity ${
                      currentImageIndex === item.images.length - 1
                        ? 'opacity-30'
                        : 'opacity-100'
                    }`}
                  >
                    <IconChevronRight size={20} />
                  </button>
                </>
              )}

              {/* 画像インジケーター */}
              {hasMultipleImages && (
                <div className="absolute right-3 bottom-3 z-10 rounded bg-black/60 px-2 py-1 font-semibold text-white text-xs">
                  {currentImageIndex + 1} / {item.images.length}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* 商品情報 */}
        <div className="border-gray-200 border-t bg-white p-4">
          <h3 className="line-clamp-2 font-bold text-base text-gray-800">
            {item.title}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-bold text-2xl text-[#ff6666]">
              {formatPrice(totalPrice)}pt
            </span>
            <span className="text-gray-500 text-xs">(送料込み)</span>
          </div>

          {/* 商品説明（短く表示） */}
          {item.description && (
            <p className="mt-2 text-gray-600 text-sm">{item.description}</p>
          )}
        </div>

        {/* ボタンエリア */}
        <div className="flex gap-3 border-gray-200 border-t bg-white p-3">
          <button
            onClick={onBack}
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white py-3 font-bold text-base text-gray-700 transition-colors hover:bg-gray-50"
          >
            戻る
          </button>
          <button
            onClick={() =>
              onPurchase({
                itemId: item.item_id,
                title: item.title,
                price: item.price,
                images: item.images,
              })
            }
            disabled={isSold}
            className={`flex-1 rounded-lg py-3 font-bold text-base text-white transition-colors ${
              isSold
                ? 'cursor-not-allowed bg-gray-300'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isSold ? '売り切れ' : '購入手続きへ'}
          </button>
        </div>
      </div>
    );
  },
);

FleaMarketItemDetailCompact.displayName = 'FleaMarketItemDetailCompact';

export default FleaMarketItemDetailCompact;
