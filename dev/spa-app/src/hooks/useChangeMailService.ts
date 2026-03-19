import { useServiceStore } from '@/stores/serviceStore';

export function useChangeMailService() {
  return useServiceStore((s) => s.changeMailService);
}
