import type { Thumbnail } from '@/types/image';
import type { MediaInfo } from '@/types/MediaInfo';
import { convertToMediaInfo, imageUrl } from '@/utils/image';

export const processThumbnailData = (
  thumbnailData: Thumbnail[] | undefined,
  fallbackAvaId?: string,
): MediaInfo[] => {
  if (thumbnailData && thumbnailData.length > 0) {
    return thumbnailData
      .map((data) => convertToMediaInfo(data))
      .sort((a, _b) => (a.type === 'movie' ? -1 : 1));
  } else if (fallbackAvaId) {
    return [
      {
        type: 'image',
        thumbnailId: imageUrl(fallbackAvaId),
      },
    ];
  }
  return [];
};
