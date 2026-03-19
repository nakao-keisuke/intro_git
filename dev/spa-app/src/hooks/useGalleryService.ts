import { useServiceStore } from '@/stores/serviceStore';

export function useGalleryService() {
  return useServiceStore((s) => s.galleryService);
}
