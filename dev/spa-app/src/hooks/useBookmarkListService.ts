import { useServiceStore } from '@/stores/serviceStore';

export function useBookmarkListService() {
  return useServiceStore((s) => s.bookmarkListService);
}
