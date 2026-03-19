import { useServiceStore } from '@/stores/serviceStore';

export function useMyPageService() {
  return useServiceStore((s) => s.myPageService);
}
