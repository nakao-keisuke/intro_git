import type {
  ActiveLiveRecordingInfo,
  ChatFileArchiveInfo,
  ThumbnailInfo,
} from '@/services/profile/type';
import type { MediaInfo } from '@/types/MediaInfo';

export type ProfileMediaItem = {
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
  originalItem?: MediaInfo | ChatFileArchiveInfo;
};

/**
 * ThumbnailInfo[] → MediaInfo[] へ正規化
 * - 欠損は除外
 * - movie の場合は timelineMovieUrl を優先し、なければ thumbnailUrl を使用
 */
export function mapThumbnailsToMedia(
  thumbnails: ThumbnailInfo[] | undefined | null,
): MediaInfo[] {
  const safe = thumbnails || [];
  return safe
    .map((item) => {
      const thumbId = item.thumbnailUrl;
      if (!thumbId) return null;
      if (item.type === 'image') {
        return { type: 'image' as const, thumbnailId: thumbId };
      }
      const movieId = item.timelineMovieUrl || thumbId;
      if (!movieId) return null;
      return { type: 'movie' as const, thumbnailId: thumbId, movieId };
    })
    .filter((v): v is MediaInfo => v !== null);
}

/**
 * プロフィール用メディア配列を構築
 * - サムネイル（画像/動画）と購入可否情報を統合
 * - 未購入メディア/購入済みメディアを分類
 * - ライブ録画がある場合は先頭に追加
 * - 画像は末尾、動画は先頭（動画をreverseで最新順優先）
 * - データがない場合はデフォルトアバターを1件返す
 */
export function buildProfileMediaItems(
  mediaList: MediaInfo[] | undefined | null,
  chatFileArchive: ChatFileArchiveInfo[] | undefined | null,
  defaultAvatarPath: string,
  activeLiveRecording?: ActiveLiveRecordingInfo | null,
): { items: ProfileMediaItem[]; hasMultipleImages: boolean } {
  const safeMedia = mediaList || [];
  const videos = [
    ...safeMedia.filter((item) => item.type === 'movie'),
  ].reverse();
  const images = safeMedia.filter((item) => item.type !== 'movie');
  const combinedThumbnailList = [...videos, ...images];

  const safeChat = chatFileArchive || [];
  const hasValidMediaId = (mediaId: string): boolean =>
    Boolean(mediaId) && mediaId !== defaultAvatarPath;
  const filteredUnOpenMovies = safeChat.filter(
    (item) =>
      item.isPurchased === false &&
      item.mediaType === 'video' &&
      hasValidMediaId(item.mediaId),
  );
  const filteredUnOpenImages = safeChat.filter(
    (item) =>
      item.isPurchased === false &&
      item.mediaType === 'image' &&
      hasValidMediaId(item.mediaId),
  );
  const purchasedMovies = safeChat.filter(
    (item) => item.isPurchased && item.mediaType === 'video',
  );
  const purchasedImages = safeChat.filter(
    (item) => item.isPurchased && item.mediaType === 'image',
  );

  // ライブ録画アイテム（先頭に表示）
  // recordingIdが有効な場合のみアイテムを作成（空文字や無効な値の場合は白い四角になるため除外）
  const liveRecordingItem: ProfileMediaItem[] = activeLiveRecording?.recordingId
    ? [
        {
          type: 'liveRecording',
          id: activeLiveRecording.recordingId,
          recordingId: activeLiveRecording.recordingId,
        },
      ]
    : [];

  const all: ProfileMediaItem[] = [
    ...liveRecordingItem,
    ...combinedThumbnailList.map((item): ProfileMediaItem => {
      if (item.type === 'image') {
        return {
          type: 'image',
          id: item.thumbnailId,
          thumbnailId: item.thumbnailId,
          originalItem: item,
        };
      }
      return {
        type: 'movie',
        id: item.thumbnailId,
        thumbnailId: item.thumbnailId,
        movieId: item.movieId,
        originalItem: item,
      };
    }),
    ...filteredUnOpenMovies.map(
      (item): ProfileMediaItem => ({
        type: 'unOpenMovie',
        id: item.mediaId,
        fileId: item.mediaId,
        originalItem: item,
      }),
    ),
    ...filteredUnOpenImages.map(
      (item): ProfileMediaItem => ({
        type: 'unOpenImage',
        id: item.mediaId,
        fileId: item.mediaId,
        originalItem: item,
      }),
    ),
    ...purchasedMovies.map(
      (item): ProfileMediaItem => ({
        type: 'purchasedMovie',
        id: item.mediaId,
        fileId: item.mediaId,
        originalItem: item,
      }),
    ),
    ...purchasedImages.map(
      (item): ProfileMediaItem => ({
        type: 'purchasedImage',
        id: item.mediaId,
        fileId: item.mediaId,
        originalItem: item,
      }),
    ),
  ];

  const items =
    all.length === 0
      ? [
          {
            type: 'image' as const,
            id: defaultAvatarPath,
            thumbnailId: defaultAvatarPath,
            originalItem: {
              type: 'image' as const,
              thumbnailId: defaultAvatarPath,
            },
          },
        ]
      : all;

  return { items, hasMultipleImages: items.length > 1 };
}
