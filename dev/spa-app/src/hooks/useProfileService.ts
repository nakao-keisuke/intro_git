import { useServiceStore } from '@/stores/serviceStore';

export function useProfileService() {
  return useServiceStore((s) => s.profileService);
}
