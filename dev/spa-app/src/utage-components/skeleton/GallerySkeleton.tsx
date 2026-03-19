import type React from 'react';
import { Skeleton } from './Skeleton';

type GirlsListSkeletonProps = {
  count?: number;
};

// 女の子カードのスケルトン（1アイテム）
export const CardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
    {/* サムネイル画像 - モバイル: 160px, PC: 200px */}
    <div className="h-[160px] md:h-[200px]">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-3">
      {/* 名前・年齢 */}
      <div className="mb-2 flex items-center gap-2">
        <Skeleton width={80} height={16} />
        <Skeleton width={40} height={14} />
      </div>
      {/* ステータスバッジ */}
      <div className="flex gap-2">
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={50} height={24} borderRadius={12} />
      </div>
    </div>
  </div>
);

// レスポンシブ対応（モバイル: 2カラム, PC: 4カラム）
export const ListSkeleton: React.FC<GirlsListSkeletonProps> = ({
  count = 8,
}) => (
  <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);
