import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetImageRankingResponseElementData,
  getImageRankingRequest,
} from '@/apis/get-image-ranking';
import {
  type GetVideoRankingResponseElementData,
  getVideoRankingRequest,
} from '@/apis/get-video-ranking';
import { bannedUserIdList } from '@/constants/bannedUserIdList';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type rankedMeetPerson = {
  is_sudden_rise: boolean;
  user_id: string;
  rank: number;
  last_action_status_color: string;
  step_to_call: number;
  gender: number;
  last_login_time: string;
  is_new: boolean;
  user_name: string;
  last_action_status_label: string;
  talk_theme: number;
  showing_face_status: number;
  last_action_status_index: number;
  channel_info: string;
  online_status_color: string;
  abt: string;
  call_status: number;
  online_status_label: string;
  voice_call_waiting: boolean;
  region: Region;
  ava_id: string;
  age: number;
  video_call_waiting: boolean;
  point: number;
  isSendRequest?: boolean;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    videoRankingList: rankedMeetPerson[];
    imageRankingList: rankedMeetPerson[];
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

  const videoRankingRequest = getVideoRankingRequest(token);
  const imageRankingRequest = getImageRankingRequest(token);

  const [
    { code: videoRankingCode, data: videoRankingData },
    { code: imageRankingCode, data: imageRankingData },
  ] = await Promise.all([
    postToJambo<GetVideoRankingResponseElementData>(
      videoRankingRequest,
      context.req,
    ),
    postToJambo<GetImageRankingResponseElementData>(
      imageRankingRequest,
      context.req,
    ),
  ]);

  const filteredVideoRankingData = videoRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );

  const filteredImageRankingData = imageRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );

  const videoRankingList =
    filteredVideoRankingData?.map((data) => ({
      is_sudden_rise: data.is_sudden_rise,
      user_id: data.user_id,
      rank: data.rank,
      last_action_status_color: data.user.last_action_status_color,
      step_to_call: data.user.step_to_call,
      gender: data.user.gender,
      last_login_time: data.user.last_login_time,
      is_new: data.user.is_new,
      user_name: data.user.user_name,
      last_action_status_label: data.user.last_action_status_label,
      talk_theme: data.user.talk_theme,
      showing_face_status: data.user.showing_face_status,
      last_action_status_index: data.user.last_action_status_index,
      channel_info: data.user.channel_info,
      online_status_color: data.user.online_status_color,
      abt: data.user.abt,
      call_status: data.user.call_status,
      online_status_label: data.user.online_status_label,
      voice_call_waiting: data.user.voice_call_waiting,
      region: region(data.user.region),
      ava_id: data.user.ava_id,
      age: data.user.age,
      video_call_waiting: data.user.video_call_waiting,
      point: data.point,
    })) || [];

  const imageRankingList =
    filteredImageRankingData?.map((data) => ({
      is_sudden_rise: data.is_sudden_rise,
      user_id: data.user_id,
      rank: data.rank,
      last_action_status_color: data.user.last_action_status_color,
      step_to_call: data.user.step_to_call,
      gender: data.user.gender,
      last_login_time: data.user.last_login_time,
      is_new: data.user.is_new,
      user_name: data.user.user_name,
      last_action_status_label: data.user.last_action_status_label,
      talk_theme: data.user.talk_theme,
      showing_face_status: data.user.showing_face_status,
      last_action_status_index: data.user.last_action_status_index,
      channel_info: data.user.channel_info,
      online_status_color: data.user.online_status_color,
      abt: data.user.abt,
      call_status: data.user.call_status,
      online_status_label: data.user.online_status_label,
      voice_call_waiting: data.user.voice_call_waiting,
      region: region(data.user.region),
      ava_id: data.user.ava_id,
      age: data.user.age,
      video_call_waiting: data.user.video_call_waiting,
      point: data.point,
    })) || [];

  if (videoRankingCode || imageRankingCode)
    return {
      props: { type: 'error', message: 'エラーが発生しました' },
    };

  return {
    props: {
      type: 'success',
      videoRankingList: videoRankingList,
      imageRankingList: imageRankingList,
    },
  };
};
