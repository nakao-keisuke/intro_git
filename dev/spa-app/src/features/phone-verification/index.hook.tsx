import type { GetServerSideProps } from 'next';
import {
  type GetPhoneVerificationStatusResponseData,
  getPhoneVerificationStatusRequest,
} from '@/apis/get-phone-verification-status';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    isPhoneVerified: boolean;
  }>
> = async (context) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }

  // PC/SPの振り分け
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
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // 電話認証状態を取得
  const getPhoneStatusRequest = getPhoneVerificationStatusRequest(token);
  const { code, data } =
    await postToJambo<GetPhoneVerificationStatusResponseData>(
      getPhoneStatusRequest,
      context.req,
    );

  if (code || !data) {
    return {
      props: { type: 'error', message: '電話認証状態の取得に失敗しました' },
    };
  }

  if (data.verified === true) {
    return {
      props: { type: 'error', message: '電話認証済みです' },
    };
  }

  return {
    props: {
      type: 'success',
      isPhoneVerified: data.verified,
    },
  };
};
