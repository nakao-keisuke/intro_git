import type { GetServerSideProps } from 'next';
import {
  type CheckRegisterEmailStatusForUtageWebResponseData,
  checkRegisterEmailStatusForUtageWebRequest,
} from '@/apis/check-register-email-status-for-utage-web';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    unConfirmedMail?: string;
  }>
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
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  const checkRegisteredEmailStatusRequest =
    checkRegisterEmailStatusForUtageWebRequest(token);
  const { code, data } =
    await postToJambo<CheckRegisterEmailStatusForUtageWebResponseData>(
      checkRegisteredEmailStatusRequest,
      context.req,
    );
  if (code) {
    return { props: { type: 'error', message: 'サーバーの不明なエラーです' } };
  }
  if (data.email_status === 'already_registered') {
    return {
      redirect: {
        destination: '/setting/already-registered-mail',
        permanent: false,
      },
    };
  }
  if (data.email_status === 'unconfirmed') {
    return {
      props: {
        type: 'success',
        unConfirmedMail: data.email,
      },
    };
  }
  return {
    props: { type: 'success' },
  };
};
