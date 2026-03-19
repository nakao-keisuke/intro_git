export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  return /iPad|iPhone|iPod/.test(userAgent) && !('MSStream' in window);
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = (navigator.userAgent || navigator.vendor).toLowerCase();
  return /android/.test(userAgent) && !/windows phone/.test(userAgent);
};

export const getDeviceType = (): 'ios' | 'android' | 'other' => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'other';
};
