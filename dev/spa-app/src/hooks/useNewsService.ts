import { useServiceStore } from '@/stores/serviceStore';

export function useNewsService() {
  return useServiceStore((s) => s.newsService);
}
