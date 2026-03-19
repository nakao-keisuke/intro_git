import { useServiceStore } from '@/stores/serviceStore';

export function useHomeService() {
  return useServiceStore((s) => s.homeService);
}
