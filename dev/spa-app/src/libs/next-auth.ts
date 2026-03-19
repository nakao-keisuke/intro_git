import type { GetServerSidePropsContext, NextApiRequest } from 'next';
// next/server removed for SPA;
import { getToken, type JWT } from 'next-auth/jwt';

export async function getJWTToken(
  req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest,
): Promise<JWT | null> {
  return await getToken({ req });
}
