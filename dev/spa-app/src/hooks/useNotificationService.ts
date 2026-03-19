import type { NotificationService } from '@/services/notification/type';
import { useServiceStore } from '@/stores/serviceStore';

export const useNotificationService = (): NotificationService => {
  return useServiceStore((s) => s.notificationService);
};
