import { useServiceStore } from '@/stores/serviceStore';

export function useBoardService() {
  return useServiceStore((s) => s.boardService);
}
