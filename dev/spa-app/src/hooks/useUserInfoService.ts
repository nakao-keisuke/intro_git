import { useServiceStore } from '@/stores/serviceStore';

export function useUserInfoService() {
  return useServiceStore((s) => s.userInfoService);
}
