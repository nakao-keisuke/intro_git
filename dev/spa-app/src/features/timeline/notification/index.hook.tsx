import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetTimelineNotificationResponseData,
  getTimelineNotificationRequest,
} from '@/apis/get-tiimeline-noti';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { isMobileUserAgent } from '@/utils/userAgent';

export type TimelineNotificationResponseData = {
  contents_image_id: string;
  comment_text: string;
  avatar_id: string;
  contents_text: string;
  action_time: string;
  reaction_type: string;
  user_id: string;
  user_name: string;
  timeline_id: string;
  contents_type: string;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    timelineNotificationList: GetTimelineNotificationResponseData[];
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
  if (!token) {
    return {
      props: { type: 'error', message: 'ユーザー情報が取得できません' },
    };
  }
  const timelineRequest = getTimelineNotificationRequest(token);
  const fetchCreditData = token
    ? postToJambo<GetUtageWebPointInfoResponseData>(
        getUtageWebPointInfoRequest(token),
        context.req,
      )
    : Promise.resolve({ code: 200, data: null });

  const [creditData, { code: timelineCode, data: timelineData }] =
    await Promise.all([
      fetchCreditData,
      postToJambo<GetTimelineNotificationResponseData[]>(
        timelineRequest,
        context.req,
      ),
    ]);

  if (timelineCode || !timelineData) {
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
      timelineNotificationList: timelineData ?? [],
      isPurchased: creditData.data?.is_purchased ?? false,
    },
  };
};
