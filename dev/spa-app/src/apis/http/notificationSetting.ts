import { JAMBO_API_ROUTE } from '@/constants/jamboApiRoute';
import type { APIRequest, APIResponse } from '@/libs/http/type';
import type { ApiRouteResponse } from '@/types/ApiRoute';

// ===============================
// 通知設定のポリシー定義
// ===============================
export type MessageFromWomenPolicy = 'all' | 'favorites_only' | 'none';

// ===============================
// Route Handler ⇔ Client の型定義
// ===============================

// 取得APIのレスポンスデータ
export type NotificationSettingData = {
  userId: string;
  channels: {
    app: boolean;
    email: boolean;
  };
  categories: {
    messageFromWomen: {
      policy: MessageFromWomenPolicy;
    };
    siteAnnouncement: {
      enabled: boolean;
    };
  };
  createdAt: number;
  updatedAt: number;
};

// Route Handler ⇔ Client のレスポンス型
export type GetNotificationSettingRouteResponse =
  ApiRouteResponse<NotificationSettingData>;
export type UpdateNotificationSettingRouteResponse =
  ApiRouteResponse<undefined>;

// 更新API用のリクエストボディ（Client → Route Handler）
// NOTE: messageFromWomenPolicy と siteAnnouncementEnabled は現在クライアント側で設定しないため、
// リクエスト作成関数で固定値を使用する
export type UpdateNotificationSettingRequestBody = {
  appChannel: boolean;
  emailChannel: boolean;
};

// ===============================
// Route Handler ⇔ Jambo の型定義
// ===============================

// Jambo向け取得リクエスト（snake_case）
export type GetNotificationSettingJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.GET_NOTIFICATION_SETTING_FOR_WEB;
  readonly token: string;
};

// Jambo向け更新リクエスト（snake_case）
export type UpdateNotificationSettingJamboRequest = APIRequest & {
  readonly api: typeof JAMBO_API_ROUTE.UPDATE_NOTIFICATION_SETTING_FOR_WEB;
  readonly token: string;
  readonly app_channel: boolean;
  readonly email_channel: boolean;
  readonly message_from_women_policy: MessageFromWomenPolicy;
  readonly site_announcement_enabled: boolean;
};

// Jamboからの取得レスポンス（camelCase）
export type GetNotificationSettingJamboResponseData = {
  userId: string;
  channels: {
    app: boolean;
    email: boolean;
  };
  categories: {
    messageFromWomen: {
      policy: MessageFromWomenPolicy;
    };
    siteAnnouncement: {
      enabled: boolean;
    };
  };
  createdAt: number;
  updatedAt: number;
};

export type GetNotificationSettingUpstreamResponse =
  APIResponse<GetNotificationSettingJamboResponseData>;
export type UpdateNotificationSettingUpstreamResponse = APIResponse<null>;

// ===============================
// リクエスト作成関数
// ===============================

export const createGetNotificationSettingRequest = (
  token: string,
): GetNotificationSettingJamboRequest => ({
  api: JAMBO_API_ROUTE.GET_NOTIFICATION_SETTING_FOR_WEB,
  token,
});

export const createUpdateNotificationSettingRequest = (
  token: string,
  body: UpdateNotificationSettingRequestBody,
): UpdateNotificationSettingJamboRequest => ({
  api: JAMBO_API_ROUTE.UPDATE_NOTIFICATION_SETTING_FOR_WEB,
  token,
  app_channel: body.appChannel,
  email_channel: body.emailChannel,
  // NOTE: 現在クライアント側で設定しないため固定値を使用
  message_from_women_policy: 'all',
  site_announcement_enabled: false,
});

// ===============================
// レスポンス変換関数（Jambo → Client）
// ===============================

export const transformNotificationSettingResponse = (
  data: GetNotificationSettingJamboResponseData,
): NotificationSettingData => ({
  userId: data.userId,
  channels: {
    app: data.channels.app,
    email: data.channels.email,
  },
  categories: {
    messageFromWomen: {
      policy: data.categories.messageFromWomen.policy,
    },
    siteAnnouncement: {
      enabled: data.categories.siteAnnouncement.enabled,
    },
  },
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});
