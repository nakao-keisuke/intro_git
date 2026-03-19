import { useMemo } from 'react';
import type {
  ChatFileArchiveInfo,
  ThumbnailInfo,
} from '@/services/profile/type';
import type { MediaInfo } from '@/types/MediaInfo';

export type MediaItem = {
  type:
    | 'unOpenMovie'
    | 'unOpenImage'
    | 'image'
    | 'movie'
    | 'purchasedMovie'
    | 'purchasedImage'
    | 'liveRecording';
  id: string;
  fileId?: string;
  thumbnailId?: string;
  movieId?: string;
  recordingId?: string;
  originalItem?: MediaInfo | ThumbnailInfo | ChatFileArchiveInfo;
};

/**
 * 購入済みメディアの状態を反映したメディアアイテムを返すカスタムフック
 *
 * @param mediaItems - 元のメディアアイテム配列
 * @param purchasedMediaIds - 購入済みメディアIDのSet
 * @returns 購入済み状態を反映した変換済みメディアアイテム配列
 */
export const useProcessPurchasedMedia = (
  mediaItems: MediaItem[],
  purchasedMediaIds: Set<string>,
): MediaItem[] => {
  return useMemo(() => {
    return mediaItems.map((item) => {
      if (!item.fileId || !purchasedMediaIds.has(item.fileId)) {
        return item;
      }

      if (item.type === 'unOpenMovie') {
        return { ...item, type: 'purchasedMovie' as const };
      }
      if (item.type === 'unOpenImage') {
        return { ...item, type: 'purchasedImage' as const };
      }
      return item;
    });
  }, [mediaItems, purchasedMediaIds]);
};
