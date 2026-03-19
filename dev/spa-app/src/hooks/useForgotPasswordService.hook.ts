import { useServiceStore } from '@/stores/serviceStore';

export function useForgotPasswordService() {
  return useServiceStore((s) => s.forgotPasswordService);
}
