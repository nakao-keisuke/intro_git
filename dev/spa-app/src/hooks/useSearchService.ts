import { useServiceStore } from '@/stores/serviceStore';

export function useSearchService() {
  return useServiceStore((s) => s.searchService);
}
