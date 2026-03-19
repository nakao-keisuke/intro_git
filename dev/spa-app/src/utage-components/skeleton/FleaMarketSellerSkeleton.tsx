import type React from 'react';
import { Skeleton } from './Skeleton';

export const FleaMarketItemSkeleton: React.FC = () => (
  <div className="border-gray-100 border-b bg-white px-2 py-3">
    <div className="flex gap-3">
      {/* 左側：商品画像 */}
      <div className="aspect-square w-[35%] overflow-hidden rounded-md bg-gray-100">
        <Skeleton className="h-full w-full" />
      </div>

      {/* 右側：商品情報 */}
      <div className="flex flex-1 flex-col">
        {/* 商品名 */}
        <Skeleton width="70%" height={18} className="mb-2" />

        {/* 価格 */}
        <Skeleton width="40%" height={18} className="mb-3" />

        {/* 出品者情報 */}
        <div className="mb-3 flex items-center gap-2">
          <Skeleton circle width={28} height={28} />
          <div>
            <Skeleton width={120} height={14} />
            <Skeleton width={80} height={14} className="mt-1" />
          </div>
        </div>

        {/* コメント吹き出し */}
        <div className="mb-3 rounded-md bg-pink-100 p-2">
          <Skeleton width="90%" height={14} />
          <Skeleton width="60%" height={14} className="mt-1" />
        </div>

        {/* サブ画像 */}
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square w-[50px] overflow-hidden rounded-md bg-gray-100"
            >
              <Skeleton className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

type FleaMarketItemListSkeletonProps = {
  count?: number;
};

// フリマ商品一覧のリスト用スケルトン（縦方向に複数アイテムを表示）
export const FleaMarketItemListSkeleton: React.FC<
  FleaMarketItemListSkeletonProps
> = ({ count = 3 }) => (
  <div className="bg-white">
    {Array.from({ length: count }).map((_, index) => (
      // initial ロードのみで一時的に表示されるため index key を許容
      // eslint-disable-next-line react/no-array-index-key
      <FleaMarketItemSkeleton key={index} />
    ))}
  </div>
);
