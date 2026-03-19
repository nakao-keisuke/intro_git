/**
 * アップロードファイル情報
 */
export type FileInfo = {
  fileId: string;
  fileType: 'image' | 'video';
  duration?: number;
};
