import { useServiceStore } from '@/stores/serviceStore';

export function useLiveListService() {
  return useServiceStore((s) => s.liveListService);
}
