import { useServiceStore } from '@/stores/serviceStore';

export function usePhoneVerificationService() {
  return useServiceStore((s) => s.phoneVerificationService);
}
