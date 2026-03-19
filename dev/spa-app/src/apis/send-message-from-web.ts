import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

interface SendMessageFromWebRequest extends JamboRequest {
  readonly api: 'send_message_from_web';
  readonly user_id: string;
  readonly rcv_id: string;
  readonly content: string;
  readonly is_free: boolean;
  readonly token: string;
  readonly web_custom_consume_point?: number;
}

export interface SendMessageFromWebResponse extends JamboResponseData {}

export const sendMessageFromWebRequest = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
): SendMessageFromWebRequest => {
  return {
    api: 'send_message_from_web',
    user_id: userId,
    rcv_id: partnerId,
    content: content,
    is_free: isFree,
    token: token,
  };
};

export const sendMessageFromWebRequestForCampaign = (
  userId: string,
  partnerId: string,
  content: string,
  isFree: boolean,
  token: string,
  customConsumePoint: number,
): SendMessageFromWebRequest => {
  return {
    api: 'send_message_from_web',
    user_id: userId,
    rcv_id: partnerId,
    content: content,
    is_free: isFree,
    token: token,
    web_custom_consume_point: customConsumePoint,
  };
};
