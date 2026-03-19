import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetBlockListResponseData,
  getBlockListRequest,
} from '@/apis/get-block-list';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type BlockListUserInfo = {
  userId: string;
  userName: string;
  age: number;
  about: string;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    blockList: BlockListUserInfo[];
  }>
> = async (context: GetServerSidePropsContext) => {
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

  const blockListRequest = getBlockListRequest(token, 0, 100);

  const [{ code: blockListCode, data: blockListData }] = await Promise.all([
    postToJambo<GetBlockListResponseData[]>(blockListRequest, context.req),
  ]);

  if (blockListCode) {
    return {
      props: {
        type: 'error',
        message: 'エラーが発生しました',
      },
    };
  }
  return {
    props: {
      type: 'success',
      blockList:
        blockListData?.map((data) => ({
          userId: data.user_id,
          avatarId: data.ava_id,
          about: data.abt ?? '',
          age: data.age,
          region: region(data.region),
          userName: data.user_name,
          voiceCallWaiting: false,
          videoCallWaiting: false,
        })) ?? ([] as BlockListUserInfo[]),
    },
  };
};
