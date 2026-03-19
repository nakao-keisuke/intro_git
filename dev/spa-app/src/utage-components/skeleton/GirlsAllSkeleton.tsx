import type React from 'react';
import { Skeleton } from './Skeleton';

// バナーセクションスケルトン
const BannerSkeleton: React.FC = () => (
  <div className="w-full px-2 py-3">
    <Skeleton className="h-[120px] w-full rounded-xl" />
    {/* ページインジケーター */}
    <div className="mt-2 flex justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} circle width={8} height={8} />
      ))}
    </div>
  </div>
);

type HorizontalScrollUsersSkeletonProps = {
  count?: number;
  variant?: 'circle' | 'square';
};

// 配信中の女の子 / ビデオ通話ユーザー用スケルトン（横スクロール）
const HorizontalScrollUsersSkeleton: React.FC<
  HorizontalScrollUsersSkeletonProps
> = ({ count = 4, variant = 'circle' }) => (
  <div className="w-full p-2">
    {/* ヘッダー */}
    <div className="mb-2 flex items-center justify-between">
      <Skeleton width={180} height={18} />
      <Skeleton width={60} height={14} />
    </div>
    {/* アイコンの横スクロール */}
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-shrink-0 flex-col items-center">
          <Skeleton
            width={variant === 'square' ? 120 : 84}
            height={variant === 'square' ? 100 : 84}
            {...(variant === 'circle'
              ? { circle: true }
              : { className: 'rounded-xl' })}
          />
          <div className="mt-1 flex items-center gap-1">
            <Skeleton width={50} height={12} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 今すぐ話せるユーザー用カードスケルトン（1アイテム）
const MeetPeopleCardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-xl bg-white shadow-sm">
    {/* サムネイル画像 */}
    <div className="h-[160px]">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-2">
      {/* 名前・年齢・地域 */}
      <div className="mb-1 flex items-center gap-1">
        <Skeleton circle width={10} height={10} />
        <Skeleton width={70} height={14} />
      </div>
      {/* ステータスバッジ */}
      <div className="flex flex-wrap gap-1">
        <Skeleton width={50} height={20} borderRadius={10} />
        <Skeleton width={40} height={20} borderRadius={10} />
      </div>
    </div>
  </div>
);

// 今すぐ話せるユーザーセクションスケルトン
const MeetPeopleGridSkeleton: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="mt-1 w-full">
    {/* ヘッダー */}
    <div className="mb-2 flex items-center justify-between px-2">
      <Skeleton width={140} height={18} />
      <Skeleton circle width={24} height={24} />
    </div>
    {/* クイックフィルタータブ */}
    <div className="mb-3 flex gap-2 overflow-hidden px-2">
      {['今すぐ話せる', '新人女性', '巨乳', '熟女'].map((_, index) => (
        <Skeleton
          key={index}
          width={index === 0 ? 90 : 60}
          height={32}
          borderRadius={16}
        />
      ))}
    </div>
    {/* 2カラムグリッド */}
    <div className="grid grid-cols-2 gap-3 px-2">
      {Array.from({ length: count }).map((_, index) => (
        <MeetPeopleCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

// girls/all ページ全体のスケルトン
export const GirlsAllSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white">
    {/* 1. バナー */}
    <BannerSkeleton />
    {/* 2. 配信中の女の子（四角アイコン） */}
    <HorizontalScrollUsersSkeleton count={3} variant="square" />
    {/* 3. 今すぐビデオ通話ができるユーザー（丸アイコン） */}
    <HorizontalScrollUsersSkeleton count={4} variant="circle" />
    {/* 4. 今すぐ話せるユーザー（グリッド） */}
    <MeetPeopleGridSkeleton count={6} />
  </div>
);
