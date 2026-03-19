import { useServiceStore } from '@/stores/serviceStore';

export function useOnboardingService() {
  return useServiceStore((s) => s.onboardingService);
}
