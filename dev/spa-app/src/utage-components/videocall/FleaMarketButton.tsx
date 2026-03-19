// Image component removed (use <img> directly);
import { memo } from 'react';

type FleaMarketButtonProps = {
  onClick: () => void;
  itemCount?: number;
};

const FleaMarketButton = memo<FleaMarketButtonProps>(
  ({ onClick, itemCount }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/50 shadow-lg active:scale-95"
    >
      <span className="text-xl">
        <Image
          src="/setting_icon/flema_live.webp"
          alt="FleaMarket"
          width={30}
          height={30}
        />
      </span>
      {/* 商品数を右上に表示 */}
      {itemCount && itemCount > 0 && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </div>
      )}
    </button>
  ),
);

FleaMarketButton.displayName = 'FleaMarketButton';

export default FleaMarketButton;
