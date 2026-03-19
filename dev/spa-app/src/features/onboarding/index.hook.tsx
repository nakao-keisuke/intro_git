import type { GetServerSideProps } from 'next';
import { getUserToken } from '@/utils/cookie';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<{
  error?: string;
}> = async (context) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return {
      props: { data: { type: 'error', message: '不正なリクエストです' } },
    };
  }
  if (isMobileUserAgent(userAgent)) {
    if (context.resolvedUrl.includes('pc')) {
      return {
        redirect: {
          destination: context.resolvedUrl.replace('/pc', ''),
          permanent: false,
        },
      };
    }
  } else {
    if (!context.resolvedUrl.includes('pc')) {
      return {
        redirect: {
          destination: `${context.resolvedUrl}/pc`,
          permanent: false,
        },
      };
    }
  }

  const token = await getUserToken(context.req);
  if (!token) {
    return { props: { error: 'ログインしてください' } };
  }

  return {
    props: {
      token,
    },
  };
};
