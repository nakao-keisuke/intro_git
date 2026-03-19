import type { AddOpenedContentResponseData } from '@/apis/add-opened-content';
import type { PlayAudioResponseData } from '@/apis/play-audio';
import type { ResponseData } from '@/types/NextApi';

// リクエスト型
export interface PlayAudioRequest {
  audioId: string;
}

// AddOpenedContent リクエスト型
export interface AddOpenedContentRequest {
  fileId: string;
  isImage?: boolean;
  openedContentType?: 'audio' | 'image' | 'video';
}

// レスポンス型
export type PlayAudioResponse = ResponseData<PlayAudioResponseData>;
export type AddOpenedContentResponse = AddOpenedContentResponseData;
