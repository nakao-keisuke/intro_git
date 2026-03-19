import { useCallback, useEffect, useState } from 'react';
import type {
  GetNotificationSettingRouteResponse,
  NotificationSettingData,
  UpdateNotificationSettingRequestBody,
  UpdateNotificationSettingRouteResponse,
} from '@/apis/http/notificationSetting';
import {
  HTTP_GET_NOTIFICATION_SETTING,
  HTTP_UPDATE_NOTIFICATION_SETTING,
} from '@/constants/endpoints';
import { ClientHttpClient } from '@/libs/http/ClientHttpClient';

type UseNotificationSettingReturn = {
  // 状態
  setting: NotificationSettingData | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  // アクション
  fetchSetting: () => Promise<void>;
  updateSetting: (
    body: UpdateNotificationSettingRequestBody,
  ) => Promise<boolean>;
  // 個別更新用ヘルパー
  updateChannels: (
    appChannel: boolean,
    emailChannel: boolean,
  ) => Promise<boolean>;
};

/**
 * 通知許可設定のCustom Hook
 * @param autoFetch - マウント時に自動取得するかどうか（デフォルト: true）
 */
export function useNotificationSetting(
  autoFetch: boolean = true,
): UseNotificationSettingReturn {
  const [setting, setSetting] = useState<NotificationSettingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSetting = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const client = new ClientHttpClient();
      const response = await client.post<GetNotificationSettingRouteResponse>(
        HTTP_GET_NOTIFICATION_SETTING,
        {},
      );

      if (response.type === 'success' && response.data) {
        setSetting(response.data);
      } else if (response.type === 'error') {
        setError(response.message || '通知設定の取得に失敗しました');
      }
    } catch (err) {
      console.error('Error fetching notification setting:', err);
      setError('通知設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSetting = useCallback(
    async (body: UpdateNotificationSettingRequestBody): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        const client = new ClientHttpClient();
        const response =
          await client.post<UpdateNotificationSettingRouteResponse>(
            HTTP_UPDATE_NOTIFICATION_SETTING,
            body,
          );

        if (response.type === 'success') {
          // 楽観的更新：ローカル状態を更新
          // NOTE: messageFromWomen と siteAnnouncement は固定値のため、現在の値を維持
          setSetting((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              channels: {
                app: body.appChannel,
                email: body.emailChannel,
              },
              updatedAt: Date.now(),
            };
          });
          return true;
        } else {
          setError(response.message || '通知設定の更新に失敗しました');
          return false;
        }
      } catch (err) {
        console.error('Error updating notification setting:', err);
        setError('通知設定の更新に失敗しました');
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  // 個別更新用ヘルパー関数
  const updateChannels = useCallback(
    async (appChannel: boolean, emailChannel: boolean): Promise<boolean> => {
      return updateSetting({
        appChannel,
        emailChannel,
      });
    },
    [updateSetting],
  );

  // 自動取得
  useEffect(() => {
    if (autoFetch) {
      fetchSetting();
    }
  }, [autoFetch, fetchSetting]);

  return {
    setting,
    isLoading,
    isUpdating,
    error,
    fetchSetting,
    updateSetting,
    updateChannels,
  };
}
