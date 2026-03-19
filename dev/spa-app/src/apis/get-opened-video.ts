import type { JamboRequest } from '@/types/JamboApi';

interface GetOpenedVideoRequest extends JamboRequest {
  readonly api: 'get_opened_video';
  readonly token: string;
}

// snake_case版（Jambo APIレスポンス用）
export interface GetOpenedVideoResponseElementData {
  readonly file_id: string;
}

// camelCase版（ServerHttpClient経由のレスポンス用）
export interface GetOpenedVideoResponseData {
  readonly fileId: string;
}

export const getOpenedVideoRequest = (token: string): GetOpenedVideoRequest => {
  return {
    api: 'get_opened_video',
    token: token,
  };
};
