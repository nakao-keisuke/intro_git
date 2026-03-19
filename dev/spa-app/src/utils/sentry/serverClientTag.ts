import type { ClientPlatform } from './clientPlatform';

const CLIENT_COOKIE_KEY = 'client';

const isValidClient = (
  value: string | null | undefined,
): value is ClientPlatform =>
  value === 'web' || value === 'ios' || value === 'android';

const normalizeHeaderValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

const getHeaderValue = (
  headers: Record<string, string | string[]> | Headers | undefined,
  name: string,
): string | undefined => {
  if (!headers) return undefined;
  if (headers instanceof Headers) {
    return headers.get(name) ?? headers.get(name.toLowerCase()) ?? undefined;
  }
  const key = Object.keys(headers).find(
    (headerName) => headerName.toLowerCase() === name.toLowerCase(),
  );
  if (!key) return undefined;
  return normalizeHeaderValue(headers[key]);
};

const parseCookie = (cookieHeader: string): Record<string, string> => {
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
};

export const resolveClientPlatformFromHeaders = (
  headers: Record<string, string | string[]> | Headers | undefined,
): ClientPlatform => {
  const headerValue = getHeaderValue(headers, 'x-client-platform');
  if (isValidClient(headerValue)) {
    return headerValue;
  }

  const cookieHeader = getHeaderValue(headers, 'cookie');
  if (cookieHeader) {
    const cookies = parseCookie(cookieHeader);
    const cookieValue = cookies[CLIENT_COOKIE_KEY];
    if (isValidClient(cookieValue)) {
      return cookieValue;
    }
  }

  return 'web';
};
