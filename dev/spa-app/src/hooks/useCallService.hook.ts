import { useServiceStore } from '@/stores/serviceStore';

export function useCallService() {
  return useServiceStore((s) => s.callService);
}
