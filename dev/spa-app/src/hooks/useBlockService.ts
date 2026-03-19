import { useServiceStore } from '@/stores/serviceStore';

export function useBlockService() {
  return useServiceStore((s) => s.blockService);
}
