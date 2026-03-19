import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface sendImageFromWebRequest extends JamboRequest {
  readonly api: 'send_image_from_web';
  readonly userId: string;
  readonly partnerId: string;
  readonly fileId: string;
}

export interface SendImageFromWebResponse extends JamboResponseData {}

export const sendImageFromWebRequest = (
  userId: string,
  partnerId: string,
  fileId: string,
): sendImageFromWebRequest => {
  return {
    api: 'send_image_from_web',
    userId: userId,
    partnerId: partnerId,
    fileId: fileId,
  };
};
