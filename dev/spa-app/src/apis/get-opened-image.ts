import type { JamboRequest } from '@/types/JamboApi';

interface GetOpenedImageRequest extends JamboRequest {
  readonly api: 'get_opened_image';
  readonly token: string;
}

// snake_case版（Jambo APIレスポンス用）
export interface GetOpenedImageResponseElementData {
  readonly file_id: string;
}

// camelCase版（ServerHttpClient経由のレスポンス用）
export interface GetOpenedImageResponseData {
  readonly fileId: string;
}

export const getOpenedImageRequest = (token: string): GetOpenedImageRequest => {
  return {
    api: 'get_opened_image',
    token: token,
  };
};
