import { useServiceStore } from '@/stores/serviceStore';

export function useFleaMarketService() {
  return useServiceStore((s) => s.fleaMarketService);
}
