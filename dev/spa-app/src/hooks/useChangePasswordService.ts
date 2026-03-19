import { useServiceStore } from '@/stores/serviceStore';

export default function useChangePasswordService() {
  return useServiceStore((s) => s.changePasswordService);
}
