import type React from 'react';
import { Skeleton } from './Skeleton';

export const MypageSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 bg-white p-4">
      {/* プロフィールセクション */}
      <div className="flex items-center gap-3">
        <Skeleton circle width={64} height={64} /> {/* アバター（円形） */}
        <div className="flex flex-col gap-1">
          <Skeleton width={100} height={20} /> {/* ユーザー名 */}
          <Skeleton width={60} height={16} /> {/* 編集ボタン */}
        </div>
      </div>

      {/* ポイント表示 */}
      <Skeleton width="100%" height={40} borderRadius={8} />

      {/* ボタン2つ */}
      <div className="flex gap-2">
        <Skeleton width="50%" height={40} borderRadius={20} />
        <Skeleton width="50%" height={40} borderRadius={20} />
      </div>

      {/* 設定トグル */}
      <Skeleton width="100%" height={50} borderRadius={8} />

      {/* メニューグリッド（3x3） */}
      <div className="grid grid-cols-3 gap-4 py-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <Skeleton circle width={40} height={40} /> {/* アイコン（円形） */}
            <Skeleton width={60} height={12} /> {/* ラベル */}
          </div>
        ))}
      </div>

      {/* バナー */}
      <Skeleton width="100%" height={100} borderRadius={8} />
    </div>
  );
};
