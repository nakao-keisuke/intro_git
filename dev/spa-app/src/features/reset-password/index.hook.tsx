import type { GetServerSideProps } from 'next';
import { verifyPasswordResetAuthCode } from '@/apis/verify-password-reset-auth-code';
import type { ResponseData } from '@/types/NextApi';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    authCode: string;
    userId: string;
    isVerified: boolean;
  }>
> = async (context) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }

  const rawAuthCode = context.query.authCode;
  let authCode: string | undefined;
  let userId: string | undefined;

  if (typeof rawAuthCode === 'string' && rawAuthCode.includes('?userId=')) {
    const [code, id] = rawAuthCode.split('?userId=');
    authCode = code;
    userId = id;
  } else {
    authCode = rawAuthCode as string;
    userId = context.query.userId as string;
  }

  if (isMobileUserAgent(userAgent)) {
    if (context.resolvedUrl.includes('/pc')) {
      return {
        redirect: {
          destination: `/reset-password?authCode=${authCode}&userId=${userId}`,
          permanent: false,
        },
      };
    }
  } else {
    if (!context.resolvedUrl.includes('/pc')) {
      return {
        redirect: {
          destination: `/reset-password?authCode=${authCode}&userId=${userId}`,
          permanent: false,
        },
      };
    }
  }

  if (!authCode || !userId) {
    return {
      props: {
        type: 'error',
        message:
          'アクセスURLをお確かめください。何度もエラーが発生する場合はお問い合わせください',
      },
    };
  }

  try {
    const verifyRequest = verifyPasswordResetAuthCode(authCode);
    const { code } = await postToJambo(verifyRequest, context.req);

    if (code) {
      return {
        props: {
          type: 'error',
          message: '認証コードが無効です。もう一度お試しください。',
        },
      };
    }

    return {
      props: {
        type: 'success',
        authCode,
        userId,
        isVerified: true,
      },
    };
  } catch (_error) {
    return {
      props: {
        type: 'error',
        message: 'サーバーエラーが発生しました。もう一度お試しください。',
      },
    };
  }
};
