import type { JamboRequest, JamboResponseData } from '@/types/JamboApi';

export interface LstNotiRequest extends JamboRequest {
  readonly api: 'lst_noti';
  readonly token: string;
  readonly time_stamp?: string;
  readonly take: number;
  readonly noti_type?: string; // 追加: 通知タイプでフィルタリングするためのパラメータ
  readonly region?: null;
}

export interface LstNotiResponseData extends JamboResponseData {
  readonly avatarId: string;
  readonly abt: string;
  readonly timeOutUser: boolean;
  readonly notiUserName: string;
  readonly notiUserId: string;
  readonly notiType: number;
  readonly dist: number;
  readonly offlineCall: boolean;
  readonly time: string;
  readonly voiceCallWaiting: boolean;
  readonly videoCallWaiting: boolean;
  readonly age: number;
  readonly region: number;
}

export const lstNotiRequest = (token: string): LstNotiRequest => {
  return {
    api: 'lst_noti',
    token: token,
    take: 100,
    region: null,
  };
};

export const lstNotiRequestForMore = (
  token: string,
  timeStamp: string,
): LstNotiRequest => {
  return {
    api: 'lst_noti',
    token: token,
    time_stamp: timeStamp,
    take: 100,
  };
};

export const lstNotiRequestWithFilter = (
  token: string,
  notiType?: string,
): LstNotiRequest => {
  return {
    api: 'lst_noti',
    token: token,
    take: 100,
    ...(notiType && notiType !== 'all' ? { noti_type: notiType } : {}),
  };
};
