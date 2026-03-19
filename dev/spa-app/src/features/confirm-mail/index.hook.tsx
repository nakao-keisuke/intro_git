import type { GetServerSideProps } from 'next';
import {
  type ValidateConfirmRegisterEmailForUtageWebResponseData,
  validateConfirmRegisterEmailForUtageWebRequest,
} from '@/apis/validate-confirm-register-email-for-utage-web';
import { decrypt } from '@/libs/crypto';
import type { ResponseData } from '@/types/NextApi';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    email: string;
    status: 'already_registered' | 'unconfirmed';
  }>
> = async (context) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }
  const { token } = context.query;
  const decodeUrlToken = decodeURIComponent(token as string);
  if (isMobileUserAgent(userAgent)) {
    if (context.resolvedUrl.includes('/pc')) {
      const encodedToken = encodeURIComponent(decodeUrlToken);
      return {
        redirect: {
          destination: `/confirm-mail?token=${encodedToken}`,
          permanent: false,
        },
      };
    }
  } else {
    if (!context.resolvedUrl.includes('/pc')) {
      const encodedToken = encodeURIComponent(decodeUrlToken);
      return {
        redirect: {
          destination: `/confirm-mail/pc?token=${encodedToken}`,
          permanent: false,
        },
      };
    }
  }
  try {
    const decryptedToken = decrypt(decodeUrlToken);
    const { userId, email } = JSON.parse(decryptedToken);
    const validateConfirmRegisterEmailRequest =
      validateConfirmRegisterEmailForUtageWebRequest(userId, email);
    const { code, data } =
      await postToJambo<ValidateConfirmRegisterEmailForUtageWebResponseData>(
        validateConfirmRegisterEmailRequest,
        context.req,
      );
    if (code) {
      let message = '';
      switch (code) {
        case 12:
          message = 'メールアドレスがすでに使用されています';
          break;
        default:
          message = 'サーバーの不明なエラーです';
          break;
      }
      return { props: { type: 'error', message } };
    }
    return {
      props: { type: 'success', email: data.email, status: data.email_status },
    };
  } catch (_e) {
    return {
      props: {
        type: 'error',
        message:
          'アクセスURLをお確かめください。何度もエラーが発生する場合はお問い合わせください',
      },
    };
  }
};
