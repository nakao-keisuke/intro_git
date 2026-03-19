import type { JamboRequest } from '@/types/JamboApi';

interface SendVideoFromWebRequest extends JamboRequest {
  readonly api: 'send_video_from_web';
  readonly userId: string;
  readonly partnerId: string;
  readonly fileId: string;
  readonly duration: number;
  readonly token: string;
}

export interface SendVideoFromWebResponse {
  message?: string;
}

export const sendVideoFromWebRequest = (
  userId: string,
  partnerId: string,
  fileId: string,
  duration: number,
  token: string,
): SendVideoFromWebRequest => {
  return {
    api: 'send_video_from_web',
    userId,
    partnerId,
    fileId,
    duration,
    token,
  };
};
