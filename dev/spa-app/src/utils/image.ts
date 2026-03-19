import { isSecondAppsGroup } from '@/constants/config';
import type { Thumbnail } from '@/types/image';
import type { MediaInfo } from '@/types/MediaInfo';
import type { FileInfo } from '@/types/upload';

export const imageUrl = (id: string, userId?: string, kind?: string) => {
  let url =
    '/api/img/api=load_img_for_utage_web&img_id=' +
    id +
    '&img_kind=' +
    (kind || '1');
  if (userId) {
    url += `&user_id=${userId}`;
  }
  return url;
};

export const imageUrlForAgoraScreenshot = (id: string, userId?: string) => {
  let url = `/api/img/api=load_img_for_utage_web&img_id=${id}&img_kind=8`;
  if (userId) {
    url += `&user_id=${userId}`;
  }
  return url;
};

export const movieImageUrl = (id: string) => {
  return (
    '/api/img/api=load_timeline_movie_thumbnail_for_utage_web&image_url=' +
    id +
    '&width_size=32'
  );
};
export const imageUrlForFleaMarket = (id: string, userId?: string) => {
  let url = `/api/img/api=load_img_for_utage_web&img_id=${id}&img_kind=6`;
  if (userId) {
    url += `&user_id=${userId}`;
  }
  return url;
};

/**
 * ライブ録画のURL取得
 * @param recordingId 録画ID（file_id）
 * @param token ログインユーザーのトークン
 * @returns ライブ録画のURL
 */
export const getLiveRecordingUrl = (recordingId: string, token: string) => {
  return `/api/img/api=load_live_recording&token=${token}&file_id=${recordingId}`;
};

/**
 * 過去配信の録画URL取得（buzz_live_recording_id 用）
 * Android: LiveRecordingVideoLoader で api=load_buzz_live_recording を使用
 * @param recordingId 録画ID（buzz_live_recording_id）
 * @param token ログインユーザーのトークン
 * @returns 過去配信の録画URL
 */
export const getBuzzLiveRecordingUrl = (recordingId: string, token: string) => {
  return `/api/img/api=load_buzz_live_recording&token=${token}&file_id=${recordingId}`;
};

/**
 * ユーザープロフィール画面のタイムラインまたはストーリーサムネイル画像のURL取得
 * @param applicationId アプリID
 * @param fileId ファイルID
 * @param token トークン
 * @returns サムネイル画像のURL
 */
export const getProfileStoryThumbnailUrl = ({
  applicationId,
  fileId,
  token,
}: {
  applicationId: string;
  fileId: string;
  token: string;
}) => {
  return isSecondAppsGroup(applicationId)
    ? `/api/img/api=load_timeline_movie_thumbnail_for_utage_web&image_url=${fileId}&width_size=32` // 第二世界線用
    : `/api/img/api=load_story_thumbnail_with_size&token=${token}&image_url=${fileId}&width_size=32`; // 第一世界線用
};

/**
 * ユーザープロフィール画面のタイムラインまたはストーリー動画のURL取得
 * @param applicationId アプリID
 * @param fileId ファイルID
 * @param token トークン
 * @returns 動画のURL
 */
export const getProfileStoryMovieUrl = ({
  applicationId,
  fileId,
  token,
}: {
  applicationId: string;
  fileId: string;
  token: string;
}) => {
  return isSecondAppsGroup(applicationId)
    ? `/api/img/api=load_timeline_movie_for_utage_web&story_url=${fileId}` // 第二世界線用
    : `/api/img/api=load_story_movie&token=${token}&story_url=${fileId}`; // 第一世界線用
};

export const convertToMediaInfo = (data: Thumbnail): MediaInfo => {
  switch (data.type) {
    case 'image':
      return {
        type: 'image',
        thumbnailId: data.thumbnailUrl,
      };
    case 'movie':
      return {
        type: 'movie',
        thumbnailId: data.thumbnailUrl,
        movieId: data.timelineMovieUrl!,
      };
  }
};

/**
 * 画像をアップロード
 * @param file 画像ファイル
 * @param imageCategory 画像カテゴリ（デフォルト: 0）
 * @returns ファイル情報
 */
export const uploadImage = async (
  file: File,
  imageCategory: number = 0,
): Promise<FileInfo> => {
  const formData = new FormData();
  formData.append('data', file);
  formData.append('imgCat', imageCategory.toString());

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Image upload failed: ${response.status} ${errorText}`);
  }

  const imageData = await response.json();

  const fileId = imageData.data?.image_id;

  if (!fileId) {
    throw new Error('image_id not found in image upload response');
  }

  return {
    fileId,
    fileType: 'image',
  };
};
