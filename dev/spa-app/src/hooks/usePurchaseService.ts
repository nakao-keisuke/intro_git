import { useServiceStore } from '@/stores/serviceStore';

export function usePurchaseService() {
  return useServiceStore((s) => s.purchaseService);
}
