import type { JamboRequest } from '@/types/JamboApi';

interface GetOpenedAudioRequest extends JamboRequest {
  readonly api: 'get_opened_audio';
  readonly token: string;
}

// snake_case版（Jambo APIレスポンス用）
export interface GetOpenedAudioResponseElementData {
  readonly file_id: string;
}

// camelCase版（ServerHttpClient経由のレスポンス用）
export interface GetOpenedAudioResponseData {
  readonly fileId: string;
}

export const getOpenedAudioRequest = (token: string): GetOpenedAudioRequest => {
  return {
    api: 'get_opened_audio',
    token: token,
  };
};
