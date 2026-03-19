import type { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{ email: string }>
> = async (context) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
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
  if (!token)
    return {
      redirect: {
        destination: isMobileUserAgent(userAgent) ? '/login' : '/login/pc',
        permanent: false,
      },
    };
  const userRequest = getUserInfoRequest(token);
  const { code, data } = await postToJambo<GetUserInfoResponseData>(
    userRequest,
    context.req,
  );
  if (code) {
    return { props: { type: 'error', message: 'サーバーの不明なエラーです' } };
  }
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session?.user.email !== data?.email) {
    return {
      props: {
        type: 'error',
        message: 'メールアドレスが変更されました。再ログインしてください',
        isNeedToReLoginWithClean: true,
      },
    };
  }
  return {
    props: { type: 'success', email: data.email ?? '' },
  };
};
