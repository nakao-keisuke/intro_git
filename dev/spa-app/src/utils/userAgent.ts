export const isMobileUserAgent = (userAgentStr: string) => {
  const userAgent: 'Android' | 'iOS' | 'other' = /Android/.test(userAgentStr)
    ? 'Android'
    : /(iPhone|iPad|iPad)/.test(userAgentStr)
      ? 'iOS'
      : 'other';

  if (userAgent === 'Android' || userAgent === 'iOS') {
    return true;
  }

  const lowerCaseUserAgent = userAgentStr.toLowerCase();
  return (
    lowerCaseUserAgent.indexOf('mobile') !== -1 ||
    lowerCaseUserAgent.indexOf('tablet') !== -1
  );
};
