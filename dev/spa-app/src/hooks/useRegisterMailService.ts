import { useServiceStore } from '@/stores/serviceStore';

export function useRegisterMailService() {
  return useServiceStore((s) => s.registerMailService);
}
