export const getDeviceInfo = () => {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  return {
    browser: getBrowser(ua),
    os: getOS(ua),
    isMobile: /Mobi|Android/i.test(ua),
    userAgent: ua.slice(0, 200),
  };
};

const getBrowser = (ua: string) => {
  if (ua.includes('CriOS')) return 'Chrome iOS';
  if (ua.includes('FxiOS')) return 'Firefox iOS';
  if (ua.includes('EdgA') || ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Other';
};

const getOS = (ua: string) => {
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Other';
};
