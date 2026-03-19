import { IconX } from '@tabler/icons-react';
// Image component removed (use <img> directly);
import { memo } from 'react';
import FleaMarketListedBadge from '@/components/shared/FleaMarketListedBadge';
import type { FleaMarketItemWithFavoritesCamel } from '@/services/fleamarket/type';
import { calculateShippingFee } from '@/utils/fleamarket';
import { imageUrlForFleaMarket } from '@/utils/image';

type Props = {
  item: FleaMarketItemWithFavoritesCamel;
  onClick: () => void;
  onPurchase?: () => void;
  onDismiss?: () => void;
  /** ピックアップ商品かどうか（女性側から指定された商品） */
  isPromoted?: boolean;
};

const FleaMarketLatestItem = memo<Props>(
  ({ item, onClick, onPurchase, onDismiss, isPromoted = false }) => {
    const formatPrice = (price: number) => price.toLocaleString('ja-JP');
    const shippingFee = calculateShippingFee(item.item.price);
    const totalPrice = item.item.price + shippingFee;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="relative flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/40 px-3 py-2 shadow-lg backdrop-blur-sm"
      >
        {/* バツボタン */}
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gray-600 text-white shadow-md transition-all hover:bg-gray-700 active:scale-95"
            aria-label="閉じる"
          >
            <IconX size={12} stroke={3} />
          </button>
        )}
        <FleaMarketListedBadge
          className="top-[-16px] left-2"
          label={isPromoted ? 'おすすめ' : '出品中'}
        />
        {/* 商品画像 */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white">
          {item.item.images?.[0] ? (
            <Image
              src={imageUrlForFleaMarket(item.item.images[0])}
              alt={item.item.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
              No Image
            </div>
          )}
        </div>

        {/* 商品情報 */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <span className="w-full truncate text-left font-bold text-[13px] text-gray-800">
            {item.item.title || '商品名なし'}
          </span>
          {item.item.description && (
            <span className="mt-1 line-clamp-2 w-full text-left text-[10px] text-gray-500">
              {item.item.description}
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
              onPurchase?.();
            }}
            className="flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-white shadow-md transition-all hover:bg-red-600 active:scale-95"
          >
            <span className="font-bold text-[12px]">購入</span>
          </button>
        </div>
      </button>
    );
  },
);

FleaMarketLatestItem.displayName = 'FleaMarketLatestItem';
export default FleaMarketLatestItem;
