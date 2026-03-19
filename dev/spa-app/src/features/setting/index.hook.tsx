import type { GetServerSideProps } from 'next';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    isPurchased: boolean;
    consumedPoint: number;
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
  if (!token)
    return {
      redirect: {
        destination: isMobileUserAgent(userAgent) ? '/login' : '/login/pc',
        permanent: false,
      },
    };
  const pointInfoRequest = getUtageWebPointInfoRequest(token);
  const { code, data } = await postToJambo<GetUtageWebPointInfoResponseData>(
    pointInfoRequest,
    context.req,
  );
  return {
    props: {
      type: 'success',
      isPurchased: !!data?.is_purchased,
      consumedPoint: data?.point || 0,
    },
  };
};
