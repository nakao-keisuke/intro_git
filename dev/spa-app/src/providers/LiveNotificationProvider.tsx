import { type PropsWithChildren, useCallback, useEffect } from 'react';
import { useBookmarkStreamInfo } from '@/hooks/usePollingData';
import type { LiveChannels } from '@/services/shared/type';
import { usePollingStore } from '@/stores/pollingStore';
import { useUIStore } from '@/stores/uiStore';

const STORAGE_KEY = 'liveNotification_lastDisplayedUserId';

// LiveChannels 型ガード
function isLiveChannels(x: unknown): x is LiveChannels {
  if (typeof x !== 'object' || x === null) return false;
  const obj = x as Record<string, unknown>;
  return Array.isArray(obj.inLiveList) && Array.isArray(obj.standbyList);
}

export function LiveNotificationProvider({ children }: PropsWithChildren) {
  const streamInfo = useBookmarkStreamInfo();
  const openLiveNotificationModal = useUIStore(
    (s) => s.openLiveNotificationModal,
  );
  // liveUsers から recordingId を取得するために追加
  const liveUsersData = usePollingStore((s) => s.liveUsers);

  const getLastDisplayedUserId = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  const saveLastDisplayedUserId = useCallback((userId: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, userId);
    } catch {
      // エラーは無視
    }
  }, []);

  useEffect(() => {
    if (streamInfo?.data?.broadcaster && streamInfo.data.channelInfo) {
      const { broadcaster, channelInfo } = streamInfo.data;
      const currentUserId = broadcaster.userId;
      const lastDisplayedUserId = getLastDisplayedUserId();

      if (currentUserId !== lastDisplayedUserId) {
        // liveUsers から recordingId をクロスリファレンスで取得
        const liveChannelsData = liveUsersData?.data;
        const liveChannels = isLiveChannels(liveChannelsData)
          ? liveChannelsData
          : undefined;
        const allChannels = [
          ...(liveChannels?.inLiveList ?? []),
          ...(liveChannels?.standbyList ?? []),
        ];
        const matchingChannel = allChannels.find(
          (ch) => ch.broadcaster.userId === currentUserId,
        );
        const recordingId = matchingChannel?.channelInfo.recordingId;

        const modalData = {
          broadcaster,
          channelInfo: recordingId
            ? { ...channelInfo, recordingId }
            : channelInfo,
        };

        openLiveNotificationModal(modalData);
        saveLastDisplayedUserId(currentUserId);
      }
    }
  }, [
    streamInfo,
    liveUsersData,
    openLiveNotificationModal,
    getLastDisplayedUserId,
    saveLastDisplayedUserId,
  ]);

  return <>{children}</>;
}
