// Image component removed (use <img> directly);
import { memo } from 'react';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import { calculateShippingFee } from '@/utils/fleamarket';
import { imageUrlForFleaMarket } from '@/utils/image';

type Props = {
  items: FleaMarketItemWithFavoritesCamel[];
  onViewItem: ((itemId: string) => void) | undefined;
  onPurchase?: ((item: FleaMarketItemWithFavoritesCamel) => void) | undefined;
};

const FleaMarketItemList = memo<Props>(({ items, onViewItem, onPurchase }) => {
  const formatPrice = (price: number) => price.toLocaleString('ja-JP');

  if (items.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-[14px] text-white/70">
        出品中の商品はありません
      </div>
    );
  }

  return (
    <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((itemData) => {
        const { item } = itemData;
        const shippingFee = calculateShippingFee(item.price);
        const totalPrice = item.price + shippingFee;
        const isSold = item.salesStatus === 'sold';

        return (
          <button
            key={item.itemId}
            onClick={(e) => {
              e.stopPropagation();
              onViewItem?.(item.itemId);
            }}
            disabled={isSold}
            className="flex w-full items-center gap-3 rounded-lg bg-gray-100 p-2 text-left transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {/* 商品画像 */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.images?.[0] ? (
                <Image
                  src={imageUrlForFleaMarket(item.images[0])}
                  alt={item.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e0e0e0] text-[#999] text-[10px]">
                  No Image
                </div>
              )}
              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="font-bold text-[10px] text-white">SOLD</span>
                </div>
              )}
            </div>

            {/* 商品情報 */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate font-bold text-[13px] text-gray-800">
                {item.title || '商品名なし'}
              </span>
              {item.description && (
                <span className="line-clamp-1 w-full text-left text-[10px] text-gray-500">
                  {item.description}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#ff6666] text-[14px]">
                  {formatPrice(totalPrice)}pt
                </span>
              </div>
            </div>

            {/* 購入ボタン */}
            <div className="flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase?.(itemData);
                }}
                disabled={isSold}
                className="flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-white shadow-md transition-all hover:bg-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="font-bold text-[12px]">購入</span>
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
});

FleaMarketItemList.displayName = 'FleaMarketItemList';

export default FleaMarketItemList;
