import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetTimelineCommentListResponseElementData,
  getTimelineCommentListRequest,
} from '@/apis/get-timeline-comment';
import {
  type GetTimelineDetailResponseData,
  getTimelineDetailRequest,
} from '@/apis/get-timeline-detail';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import type { Region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type TimelineDetailResponseData = {
  comment_count: number;
  poster_comment: string;
  like_count: number;
  gender: number;
  poster_ava_id: string;
  type: string;
  post_time: string;
  poster_user_name: string;
  call_status: number;
  poster_age: number;
  review_status: string;
  voice_call_waiting: boolean;
  timeline_id: string;
  poster_region: Region;
  poster_user_id: string;
  video_call_waiting: boolean;
  is_liked: boolean;
  image_id?: string;
};

export type TimelineCommentListResponseData = {
  comment_text: string;
  gender: number;
  user_id: string;
  comment_type: string;
  user_name: string;
  review_status: string;
  timeline_id: string;
  comment_id: string;
  ava_id: string;
  post_time: string;
  parent_comment_id: string;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    timelineDetail: GetTimelineDetailResponseData;
    timelineCommentList: GetTimelineCommentListResponseElementData[];
    isPurchased: boolean;
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

  const timelineId = context.params?.timelineId as string;
  const timelineRequest = getTimelineDetailRequest(token, timelineId);
  const timelineCommentListRequest = getTimelineCommentListRequest(
    token,
    timelineId,
  );
  const fetchCreditData = token
    ? postToJambo<GetUtageWebPointInfoResponseData>(
        getUtageWebPointInfoRequest(token),
        context.req,
      )
    : Promise.resolve({ code: 200, data: null });

  const [
    creditData,
    { code: timelineCode, data: timelineData },
    { code: timelineCommentListCode, data: timelineCommentListData },
  ] = await Promise.all([
    fetchCreditData,
    postToJambo<GetTimelineDetailResponseData>(timelineRequest, context.req),
    postToJambo<GetTimelineCommentListResponseElementData[]>(
      timelineCommentListRequest,
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

  const timelineDetail: GetTimelineDetailResponseData = {
    ...timelineData,
    poster_region: timelineData.poster_region,
  };

  return {
    props: {
      type: 'success',
      timelineDetail,
      timelineCommentList: timelineCommentListData ?? [],
      isPurchased: creditData.data?.is_purchased ?? false,
    },
  };
};
