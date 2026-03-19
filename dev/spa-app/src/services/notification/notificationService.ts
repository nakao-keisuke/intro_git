import { getServerSession } from 'next-auth';
import { lstNotiRequest, lstNotiRequestForMore } from '@/apis/lst-noti';
import type { HttpClient } from '@/libs/http/HttpClient';
import { type APIResponse, Context } from '@/libs/http/type';

// ServerHttpClientによってcamelCaseに変換されたレスポンス型
interface LstNotiResponseDataCamelCase {
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

import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import { HTTP_GET_NOTIFICATIONS } from '@/constants/endpoints';
import { jamboUserIds } from '@/constants/jamboUserIds';
import { region } from '@/utils/region';
import type {
  EnhancedNotificationData,
  NotificationApiResponse,
  NotificationListResponse,
  NotificationService,
} from './type';

export type { NotificationService } from './type';

/**
 * serverHttpClientがレスポンスをsnake_caseからcamelCaseに自動変換するため、
 * 元の型（GetUserInfoForWebResponseData）にはuser_idしかないが、
 * 変換後はuserIdも存在する可能性がある
 */
type GetUserInfoForWebResponseDataWithCamel = GetUserInfoForWebResponseData & {
  userId?: string;
};

export class ServerNotificationService implements NotificationService {
  private readonly apiUrl = import.meta.env.API_URL;

  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<NotificationListResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token) {
      return {
        notifications: [],
        hasMore: false,
      };
    }
    const apiUrl = this.apiUrl;
    if (!apiUrl) {
      return {
        notifications: [],
        hasMore: false,
      };
    }

    try {
      const request = lstNotiRequest(token);
      const response = await this.client.post<
        APIResponse<LstNotiResponseDataCamelCase[]>
      >(apiUrl, request);

      if (response.code || !response.data) {
        return {
          notifications: [],
          hasMore: false,
        };
      }

      // システムアカウントからの通知をフィルタリング
      const filteredData = response.data.filter(
        (notification) =>
          !jamboUserIds.includes(
            notification.notiUserId as (typeof jamboUserIds)[number],
          ),
      );

      // システムアカウント以外のすべての通知でユーザー詳細を取得
      const userIds = filteredData
        .map((notification) => notification.notiUserId)
        .filter((id, index, self) => self.indexOf(id) === index);

      const userDetailsPromises = userIds.map(async (userId) => {
        const userInfoRequest = getUserInfoForWebRequest(userId);
        try {
          const response = await this.client.post<
            APIResponse<GetUserInfoForWebResponseData>
          >(apiUrl, userInfoRequest);
          return response;
        } catch {
          return { code: 401, data: null };
        }
      });

      const userDetailsResponses = await Promise.all(userDetailsPromises);

      const userDetailsMap = new Map<string, GetUserInfoForWebResponseData>();
      userDetailsResponses.forEach((response, index) => {
        if (response.code === 0 && response.data) {
          const userInfo =
            response.data as GetUserInfoForWebResponseDataWithCamel;
          const userId = userInfo.userId || userInfo.user_id || userIds[index];
          if (userId) {
            userDetailsMap.set(userId, response.data);
          }
        }
      });

      const enhancedNotifications: EnhancedNotificationData[] =
        filteredData.map((notification) => {
          const userDetails = userDetailsMap.get(notification.notiUserId);

          const finalAge = userDetails?.age || notification.age || 0;
          const finalRegion = userDetails?.region || notification.region || 0;
          const finalRegionName = region(finalRegion);

          return {
            notiUserId: notification.notiUserId,
            notiUserName: notification.notiUserName,
            avatarId: notification.avatarId,
            abt: notification.abt,
            timeOutUser: notification.timeOutUser,
            notiType: notification.notiType,
            dist: notification.dist,
            offlineCall: notification.offlineCall,
            time: notification.time,
            voiceCallWaiting: notification.voiceCallWaiting,
            videoCallWaiting: notification.videoCallWaiting,
            age: finalAge,
            region: finalRegion,
            bustSize: userDetails?.bust_size || '',
            hLevel: userDetails?.h_level || '',
            hasLovense: userDetails?.has_lovense || false,
            regionName: finalRegionName,
          };
        });

      return {
        notifications: enhancedNotifications,
        hasMore: enhancedNotifications.length > 0,
        nextTimeStamp:
          enhancedNotifications.length > 0
            ? enhancedNotifications[enhancedNotifications.length - 1]?.time
            : (undefined as string | undefined),
      };
    } catch (_error) {
      return {
        notifications: [],
        hasMore: false,
      };
    }
  }

  async getMoreData(timeStamp?: string): Promise<NotificationListResponse> {
    const { authOptions } = await import(
      '@/app/api/auth/[...nextauth]/options'
    );
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;

    if (!token || !timeStamp) {
      return {
        notifications: [],
        hasMore: false,
      };
    }
    const apiUrl = this.apiUrl;
    if (!apiUrl) {
      return {
        notifications: [],
        hasMore: false,
      };
    }

    try {
      const request = lstNotiRequestForMore(token, timeStamp);
      const response = await this.client.post<
        APIResponse<LstNotiResponseDataCamelCase[]>
      >(apiUrl, request);

      if (response.code || !response.data) {
        return {
          notifications: [],
          hasMore: false,
        };
      }

      // システムアカウントからの通知をフィルタリング
      const filteredMoreData = response.data.filter(
        (notification) =>
          !jamboUserIds.includes(
            notification.notiUserId as (typeof jamboUserIds)[number],
          ),
      );

      // システムアカウント以外のすべての通知でユーザー詳細を取得
      const userIds = filteredMoreData
        .map((notification) => notification.notiUserId)
        .filter((id, index, self) => self.indexOf(id) === index);

      const userDetailsPromises = userIds.map(async (userId) => {
        const userInfoRequest = getUserInfoForWebRequest(userId);
        try {
          const response = await this.client.post<
            APIResponse<GetUserInfoForWebResponseData>
          >(apiUrl, userInfoRequest);
          return response;
        } catch {
          return { code: 401, data: null };
        }
      });

      const userDetailsResponses = await Promise.all(userDetailsPromises);

      const userDetailsMap = new Map<string, GetUserInfoForWebResponseData>();
      userDetailsResponses.forEach((response) => {
        if (response.code === 0 && response.data) {
          userDetailsMap.set(response.data.user_id, response.data);
        }
      });

      const enhancedNotifications: EnhancedNotificationData[] =
        filteredMoreData.map((notification) => {
          const userDetails = userDetailsMap.get(notification.notiUserId);
          return {
            notiUserId: notification.notiUserId,
            notiUserName: notification.notiUserName,
            avatarId: notification.avatarId,
            abt: notification.abt,
            timeOutUser: notification.timeOutUser,
            notiType: notification.notiType,
            dist: notification.dist,
            offlineCall: notification.offlineCall,
            time: notification.time,
            voiceCallWaiting: notification.voiceCallWaiting,
            videoCallWaiting: notification.videoCallWaiting,
            age: userDetails?.age || notification.age || 0,
            region: userDetails?.region || notification.region || 0,
            bustSize: userDetails?.bust_size || '',
            hLevel: userDetails?.h_level || '',
            hasLovense: userDetails?.has_lovense || false,
            regionName: region(userDetails?.region || notification.region || 0),
          };
        });

      return {
        notifications: enhancedNotifications,
        hasMore: enhancedNotifications.length > 0,
        nextTimeStamp:
          enhancedNotifications.length > 0
            ? enhancedNotifications[enhancedNotifications.length - 1]?.time
            : (undefined as string | undefined),
      };
    } catch (_error) {
      return {
        notifications: [],
        hasMore: false,
      };
    }
  }
}

export class ClientNotificationService implements NotificationService {
  constructor(private readonly client: HttpClient) {}

  async getInitialData(): Promise<NotificationListResponse> {
    try {
      const response = await this.client.post<NotificationApiResponse>(
        HTTP_GET_NOTIFICATIONS,
        {},
      );

      if (response.type === 'success') {
        return {
          notifications: response.notifications,
          hasMore: response.hasMore || false,
          nextTimeStamp: response.nextTimeStamp,
        };
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }

    return {
      notifications: [],
      hasMore: false,
    };
  }

  async getMoreData(timeStamp?: string): Promise<NotificationListResponse> {
    if (!timeStamp) {
      return {
        notifications: [],
        hasMore: false,
      };
    }

    try {
      const response = await this.client.post<NotificationApiResponse>(
        HTTP_GET_NOTIFICATIONS,
        { timeStamp },
      );

      if (response.type === 'success') {
        return {
          notifications: response.notifications,
          hasMore: response.hasMore || false,
          nextTimeStamp: response.nextTimeStamp,
        };
      }
    } catch (error) {
      console.error('Failed to fetch more notifications:', error);
    }

    return {
      notifications: [],
      hasMore: false,
    };
  }
}

export function createNotificationService(
  client: HttpClient,
): NotificationService {
  if (client.getContext() === Context.SERVER) {
    return new ServerNotificationService(client);
  } else {
    return new ClientNotificationService(client);
  }
}
