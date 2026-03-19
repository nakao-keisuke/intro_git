import { useServiceStore } from '@/stores/serviceStore';

export function useMessageService() {
  return useServiceStore((s) => s.messageService);
}
