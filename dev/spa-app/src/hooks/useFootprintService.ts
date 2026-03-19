import { useServiceStore } from '@/stores/serviceStore';

export function useFootprintService() {
  return useServiceStore((s) => s.footprintService);
}
