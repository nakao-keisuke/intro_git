import { useMemo } from 'react';
import { PRICING_INFO } from '@/constants/pricing';

const fallbackVideoChatPoint = 230;

/**
 * ビデオチャットのポイントチェック用カスタムフック
 *
 * @param myPoint ユーザーの現在のポイント数
 * @returns ビデオチャットポイント数と、十分なポイントがあるかの判定結果
 */
export const useVideoChatPointCheck = (myPoint: number | undefined) => {
  // ビデオチャットの必要ポイント数を取得（メモ化）
  const videoChatPoint = useMemo(() => {
    // constants/pricing.tsからビデオチャットのポイント数を取得
    const info = PRICING_INFO.find(
      (info) => info.label === 'ビデオチャット視聴',
    );

    if (!info) {
      console.error('ビデオチャットのポイント設定が見つかりません');
      return fallbackVideoChatPoint; // フォールバック値
    }

    if (typeof info.price !== 'number') {
      console.error(
        'ビデオチャットのポイント設定が数値ではありません:',
        info.price,
      );
      throw new Error('ビデオチャットのポイント設定が無効です');
    }

    return info.price;
  }, []);

  // ユーザーが十分なポイントを持っているか判定（メモ化）
  const hasEnoughPoint = useMemo(
    () => myPoint !== undefined && myPoint >= videoChatPoint,
    [myPoint, videoChatPoint],
  );

  // ポイント不足かどうかの判定（メモ化）
  const isPointShortage = useMemo(
    () => myPoint !== undefined && myPoint < videoChatPoint,
    [myPoint, videoChatPoint],
  );

  return {
    videoChatPoint, // ビデオチャットの必要ポイント数
    hasEnoughPoint, // 十分なポイントがあるか
    isPointShortage, // ポイント不足か
  };
};
