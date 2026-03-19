import { useEffect, useState } from 'react';
import type { LstNotiResponseData } from '@/apis/lst-noti';
import { HTTP_GET_NOTIFICATIONS } from '@/constants/endpoints';
import { usePollingStore } from '@/stores/pollingStore';
import { getFromNext } from '@/utils/next';

const CACHE_KEY = 'lastNotificationViewedTime';
const UNREAD_COUNT_CACHE_KEY = 'unreadNotificationCount';

function yyyymmddhhmmssToTimestamp(str: string): number {
  const year = Number(str.slice(0, 4));
  const month = Number(str.slice(4, 6)) - 1;
  const day = Number(str.slice(6, 8));
  const hour = Number(str.slice(8, 10));
  const min = Number(str.slice(10, 12));
  const sec = Number(str.slice(12, 14));
  return new Date(year, month, day, hour, min, sec).getTime();
}

export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const isNeedToUpdate = usePollingStore((s) => s.isNeedToUpdateUnreadCount);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedCount = localStorage.getItem(UNREAD_COUNT_CACHE_KEY);
      if (cachedCount) {
        setUnreadCount(parseInt(cachedCount, 10));
      }
    }
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        if (typeof window === 'undefined') return;
        const lastViewedTime = Number(localStorage.getItem(CACHE_KEY) || '0');
        const response = await getFromNext<{
          type: 'success' | 'error';
          notifications: LstNotiResponseData[];
        }>(HTTP_GET_NOTIFICATIONS);

        if (response.type === 'success') {
          const newCount = response.notifications.filter(
            (notification) =>
              yyyymmddhhmmssToTimestamp(notification.time) > lastViewedTime,
          ).length;
          setUnreadCount(newCount);
          localStorage.setItem(UNREAD_COUNT_CACHE_KEY, newCount.toString());
        }
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
  }, [isNeedToUpdate]);

  return { unreadCount };
};
