import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetMyTimelineListResponseData,
  getMyTimelineListRequest,
} from '@/apis/get-my-timeline-list';
import {
  type GetTimelineListResponseElementData,
  getTimelineListRequest,
} from '@/apis/get-timeline-list';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import type { ResponseData } from '@/types/NextApi';
import { getUserId, getUserToken } from '@/utils/cookie';
import { postToJambo, postToJamboWithoutIp } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type TimelineListResponseData = {
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

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    timelineList: TimelineListResponseData[];
    myTimelineList: TimelineListResponseData[];
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
  const myId = token ? await getUserId(context.req) : null;

  // トークンなしで使用できるAPIなので、常にトークンなしで呼び出し
  const timelineRequest = getTimelineListRequest();
  const myTimelineRequest =
    token && myId ? getMyTimelineListRequest(token, myId) : null;
  const fetchCreditData = token
    ? postToJambo<GetUtageWebPointInfoResponseData>(
        getUtageWebPointInfoRequest(token),
        context.req,
      )
    : Promise.resolve({ code: 200, data: null });

  const [creditData, timelineResponse, myTimelineResponse] = await Promise.all([
    fetchCreditData,
    // トークンなしで使用できるAPIなので、常にpostToJamboWithoutIpを使用
    postToJamboWithoutIp<GetTimelineListResponseElementData[]>(
      timelineRequest,
    ).catch((_error) => {
      return { code: 0, data: [] };
    }),
    myTimelineRequest
      ? postToJambo<GetMyTimelineListResponseData>(
          myTimelineRequest,
          context.req,
        )
      : Promise.resolve({ code: 0, data: [] }),
  ]);

  const { code: timelineCode, data: timelineData } = timelineResponse;
  const { code: myTimelineCode, data: myTimelineData } = myTimelineResponse;

  // エラーコードが0以外でも続行（トークンなしでも使用可能なAPIのため）

  // 未認証時にtimelineDataが空の場合はデフォルト値を設定
  const safeTimelineData = timelineData || [];

  const timelineList =
    Array.isArray(safeTimelineData) && safeTimelineData.length > 0
      ? safeTimelineData.map((data) => ({
          comment_count: data.comment_count,
          poster_comment: data.poster_comment,
          like_count: data.like_count,
          gender: data.gender,
          poster_ava_id: data.poster_ava_id,
          type: data.type,
          post_time: data.post_time,
          poster_user_name: data.poster_user_name,
          call_status: data.call_status,
          poster_age: data.poster_age,
          review_status: data.review_status,
          voice_call_waiting: data.voice_call_waiting,
          timeline_id: data.timeline_id,
          poster_region: region(data.poster_region),
          poster_user_id: data.poster_user_id,
          video_call_waiting: data.video_call_waiting,
          is_liked: data.is_liked,
          image_id: data.image_id ?? '',
        }))
      : [];

  let myTimelineList: TimelineListResponseData[] = [];
  if (
    token &&
    Array.isArray(myTimelineData) &&
    myTimelineData.length > 0 &&
    myTimelineData[0] &&
    !myTimelineCode
  ) {
    myTimelineList = (myTimelineData as GetMyTimelineListResponseData[]).map(
      (data) => ({
        comment_count: data.comment_count,
        poster_comment: data.poster_comment,
        like_count: data.like_count,
        gender: data.gender,
        poster_ava_id: data.poster_ava_id,
        type: data.type,
        post_time: data.post_time,
        poster_user_name: data.poster_user_name,
        call_status: data.call_status,
        poster_age: data.poster_age,
        review_status: data.review_status,
        voice_call_waiting: data.voice_call_waiting,
        timeline_id: data.timeline_id,
        poster_region: region(data.poster_region),
        poster_user_id: data.poster_user_id,
        video_call_waiting: data.video_call_waiting,
        is_liked: data.is_liked,
        image_id: data.image_id ?? '',
      }),
    );
  }

  return {
    props: {
      type: 'success',
      timelineList,
      myTimelineList,
      isPurchased: creditData.data?.is_purchased ?? false,
    },
  };
};
