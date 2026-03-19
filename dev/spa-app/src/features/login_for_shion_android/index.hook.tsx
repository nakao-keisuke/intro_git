import type { GetServerSideProps } from 'next';
import {
  type GetPasswordForLoginWebByMobileUserResponseData,
  getPasswordForLoginWebByMobileUserRequest,
} from '@/apis/get-password-for-login-web-by-mobile-user';
import {
  type GetUserInfoResponseData,
  getUserInfoRequest,
} from '@/apis/get-user-inf';
import type { ResponseData } from '@/types/NextApi';
import { postToJambo } from '@/utils/jambo';

export const getServerSideProps: GetServerSideProps<{
  data: ResponseData<{ email: string; password: string }>;
}> = async (context) => {
  const token = context.query.sid as string;
  if (!token) {
    return {
      props: {
        data: {
          type: 'error',
          message: 'error',
        },
      },
    };
  }
  const userRequest = getUserInfoRequest(token);
  const passRequest = getPasswordForLoginWebByMobileUserRequest(token);
  const [
    { code: userCode, data: userData },
    { code: passCode, data: passData },
  ] = await Promise.all([
    postToJambo<GetUserInfoResponseData>(userRequest, context.req),
    postToJambo<GetPasswordForLoginWebByMobileUserResponseData>(
      passRequest,
      context.req,
    ),
  ]);
  if (userCode || passCode) {
    return {
      props: {
        data: {
          type: 'error',
          message: 'error',
        },
      },
    };
  }
  return {
    props: {
      data: {
        type: 'success',
        email: userData?.email ?? '',
        password: passData?.pwd,
      },
    },
  };
};
