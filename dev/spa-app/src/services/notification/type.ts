import type { LstNotiResponseData } from '@/apis/lst-noti';

export interface EnhancedNotificationData extends LstNotiResponseData {
  bustSize: string;
  hLevel: string;
  hasLovense: boolean;
  videoCallWaiting: boolean;
  voiceCallWaiting: boolean;
  age: number;
  regionName: string;
}

export interface NotificationListRequest {
  skip?: number;
  timeStamp?: string | undefined;
  notiType?: string;
}

export interface NotificationListResponse {
  notifications: EnhancedNotificationData[];
  hasMore?: boolean;
  nextTimeStamp?: string | undefined;
}

export interface NotificationApiResponse {
  type: 'success' | 'error';
  notifications: EnhancedNotificationData[];
  hasMore?: boolean;
  nextTimeStamp?: string | undefined;
}

export interface NotificationService {
  getInitialData: () => Promise<NotificationListResponse>;
  getMoreData?: (timeStamp?: string) => Promise<NotificationListResponse>;
}
