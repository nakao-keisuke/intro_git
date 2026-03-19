import type { GetServerSidePropsContext, NextApiRequest } from 'next';
// next/server removed for SPA;
import { getJWTToken } from '@/libs/next-auth';

export const getUserToken = async (
  req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest,
): Promise<string | null> => {
  const jwtToken = await getJWTToken(req);
  if (!jwtToken || jwtToken.isLogout) return null;
  return jwtToken.token as string;
};

export const getUserId = async (
  req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest,
): Promise<string | null> => {
  const jwtToken = await getJWTToken(req);
  if (!jwtToken || jwtToken.isLogout) return null;
  return jwtToken.id as string;
};

export const getUserEmail = async (
  req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest,
): Promise<string | null> => {
  const jwtToken = await getJWTToken(req);
  if (!jwtToken || jwtToken.isLogout) return null;
  return jwtToken.email as string;
};

export const checkIsRegistered = async (
  req: GetServerSidePropsContext['req'] | NextRequest | NextApiRequest,
): Promise<boolean> => {
  const jwtToken = await getJWTToken(req);
  return !!jwtToken;
};
