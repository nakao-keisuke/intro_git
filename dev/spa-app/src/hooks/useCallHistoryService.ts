import { useServiceStore } from '@/stores/serviceStore';

export function useCallHistoryService() {
  return useServiceStore((s) => s.callHistoryService);
}
