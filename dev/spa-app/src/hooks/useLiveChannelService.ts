import { useServiceStore } from '@/stores/serviceStore';

export function useLiveChannelService() {
  return useServiceStore((s) => s.liveChannelService);
}
