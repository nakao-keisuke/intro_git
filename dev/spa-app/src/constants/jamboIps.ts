import { getClientIp } from '@/utils/clientIpCheck';

export const JAMBO_IPS = ['221.248.24.234'] as const;

// クライアントサイド用（外部APIでIP取得）
export const isJamboIp = async (): Promise<boolean> => {
  try {
    const clientIp = await getClientIp();
    if (!clientIp) return false;
    return (JAMBO_IPS as readonly string[]).includes(clientIp);
  } catch {
    return false;
  }
};

// サーバーサイド用（IPを引数で受け取る）
export const isJamboIpServer = (clientIp: string | undefined): boolean => {
  if (!clientIp) return false;
  return (JAMBO_IPS as readonly string[]).includes(clientIp);
};
