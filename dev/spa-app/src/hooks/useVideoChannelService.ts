import { useServiceStore } from '@/stores/serviceStore';

export function useVideoChannelService() {
  return useServiceStore((s) => s.videoChannelService);
}
