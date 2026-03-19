import { useServiceStore } from '@/stores/serviceStore';

export function useConfirmMailService() {
  return useServiceStore((s) => s.confirmMailService);
}
