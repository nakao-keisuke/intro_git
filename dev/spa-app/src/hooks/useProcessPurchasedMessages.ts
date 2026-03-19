import { useMemo } from 'react';
import type { ChatInfoWithOptimistic } from '@/types/ChatInfo';

/**
 * メッセージ配列を処理し、購入済みメディアの状態を反映するカスタムフック
 *
 * このフックはuseMemoで最適化されており、依存配列が変更されない限り再計算されません。
 * プロフィールギャラリーの `useProcessPurchasedMedia` パターンを踏襲した実装です。
 *
 * @param messages - 元のメッセージ配列
 * @param purchasedImageIds - 購入済み画像IDのSet
 * @param purchasedVideoIds - 購入済み動画IDのSet
 * @param purchasedAudioIds - 購入済み音声IDのSet
 * @returns 購入状態を反映した処理済みメッセージ配列
 */
export const useProcessPurchasedMessages = (
  messages: ChatInfoWithOptimistic[],
  purchasedImageIds: Set<string>,
  purchasedVideoIds: Set<string>,
  purchasedAudioIds: Set<string>,
): ChatInfoWithOptimistic[] => {
  return useMemo(() => {
    return messages.map((message) => {
      // 画像の購入状態を反映
      if (
        message.type === 'unpurchased_image' &&
        purchasedImageIds.has(message.imageId)
      ) {
        return { ...message, type: 'image' as const };
      }

      // 動画の購入状態を反映
      if (
        message.type === 'unpurchased_video' &&
        purchasedVideoIds.has(message.fileId)
      ) {
        return { ...message, type: 'video' as const };
      }

      // 音声の購入状態を反映
      if (
        message.type === 'unpurchased_audio' &&
        purchasedAudioIds.has(message.audioId)
      ) {
        return { ...message, type: 'audio' as const };
      }

      return message;
    });
  }, [messages, purchasedImageIds, purchasedVideoIds, purchasedAudioIds]);
};
