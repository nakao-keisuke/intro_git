import { useServiceStore } from '@/stores/serviceStore';

export function useSettingService() {
  return useServiceStore((s) => s.settingService);
}
