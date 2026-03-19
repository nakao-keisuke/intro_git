/**
 * ブラウザの種類を判定する
 * @returns ブラウザ名
 */
export const getBrowserType = (): string => {
  if (typeof window === 'undefined') return 'unknown';

  const userAgent = window.navigator.userAgent;

  let browserName = 'Unknown';

  // Check if user is using Internet Explorer
  if (userAgent.match(/MSIE/i) || userAgent.match(/Trident.*rv:11\./)) {
    browserName = 'Internet Explorer';
  }
  // Check if user is using Opera (OPRを先にチェック)
  else if (userAgent.match(/Opera/i) || userAgent.match(/OPR/i)) {
    browserName = 'Opera';
  }
  // Check if user is using Edge (新旧両方のEdgeに対応)
  else if (userAgent.match(/Edg/i)) {
    browserName = 'Edge';
  }
  // Check if user is using Chrome
  // Chrome userAgent contains 'Chrome' and 'Safari', but real Safari doesn't contain 'Chrome'
  else if (userAgent.match(/Chrome/i) && !userAgent.match(/Edg/i)) {
    browserName = 'Chrome';
  }
  // Check if user is using Safari
  // Safari userAgent contains 'Safari' but not 'Chrome'
  else if (userAgent.match(/Safari/i) && !userAgent.match(/Chrome/i)) {
    browserName = 'Safari';
  }
  // Check if user is using Firefox
  else if (userAgent.match(/Firefox/i)) {
    browserName = 'Firefox';
  }

  return browserName;
};

/**
 * ブラウザがSafariかどうかを判定する
 * @returns Safariの場合true
 */
export const isSafari = (): boolean => {
  return getBrowserType() === 'Safari';
};
