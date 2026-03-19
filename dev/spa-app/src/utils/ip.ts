export const isValidIp = (ip: string) => {
  const regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

export const extractClientIp = (
  headers: Record<string, any> | NodeJS.Dict<string | string[]> | undefined,
): string | undefined => {
  if (headers?.['x-forwarded-for']) {
    const forwardedFor = headers?.['x-forwarded-for'] as string;
    const ips = forwardedFor.split(',');
    if (ips.length > 0 && isValidIp(ips[0]?.trim() ?? '')) {
      return ips[0]?.trim();
    }
  }
  if (import.meta.env.NODE_ENV === 'development') {
    return import.meta.env.DEV_IP as string;
  }
  return undefined;
};
