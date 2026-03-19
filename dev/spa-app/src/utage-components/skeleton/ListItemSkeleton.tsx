import type React from 'react';
import { Skeleton } from './Skeleton';

type MessageListSkeletonProps = {
  count?: number;
};

// メッセージ/掲示板のリストアイテム（1アイテム）
export const MessageItemSkeleton: React.FC = () => (
  <div className="flex items-start gap-3 border-gray-100 border-b p-4">
    {/* 左: 円形アバター */}
    <Skeleton circle width={48} height={48} />

    {/* 中央: ユーザー情報とメッセージ */}
    <div className="min-w-0 flex-1">
      {/* ユーザー名・年齢・地域 */}
      <div className="mb-2 flex items-center gap-2">
        <Skeleton width={60} height={16} />
        <Skeleton width={40} height={14} />
        <Skeleton width={30} height={14} />
      </div>
      {/* メッセージ内容（2行） */}
      <Skeleton width="90%" height={14} />
      <Skeleton width="70%" height={14} className="mt-1" />
    </div>

    {/* 右: 日時 */}
    <Skeleton width={80} height={12} />
  </div>
);

// メッセージ/掲示板リスト全体
export const MessageListSkeleton: React.FC<MessageListSkeletonProps> = ({
  count = 6,
}) => (
  <div className="bg-white">
    {Array.from({ length: count }).map((_, index) => (
      <MessageItemSkeleton key={index} />
    ))}
  </div>
);
