import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetCallHistoryResponseElementData,
  getCallHistoryRequest,
} from '@/apis/get-call-history-for-second-apps';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type CallHistoryListUserInfo = {
  readonly start_time: string;
  readonly partner_id: string;
  readonly call_type: 'live' | 'side_watch' | 'video' | 'voice';
  readonly user: {
    readonly gender: number;
    readonly last_login_time: string;
    readonly user_id: string;
    readonly online_status: string;
    readonly user_name: string;
    readonly voice_call_waiting: boolean;
    readonly region: Region;
    readonly ava_id: string;
    readonly age: number;
    readonly video_call_waiting: boolean;
  };
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    callHistorylist: CallHistoryListUserInfo[];
  }>
> = async (context: GetServerSidePropsContext) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return { props: { type: 'error', message: '不正なリクエストです' } };
  }

  // リダイレクト処理
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
        destination: isMobileUserAgent(userAgent) ? '/login' : '/login/pc',
        permanent: false,
      },
    };
  }

  const request = getCallHistoryRequest(token, 0);
  const { code, data } = await postToJambo<GetCallHistoryResponseElementData[]>(
    request,
    context.req,
  );

  let callHistorylist: CallHistoryListUserInfo[] = [];
  // レスポンスごとの処理
  if (!code && data) {
    const historyList = data.map((item: GetCallHistoryResponseElementData) => ({
      start_time: item.start_time || '',
      partner_id: item.partner_id || '',
      call_type: item.call_type || '',
      user: {
        gender: item.user.gender || 0,
        last_login_time: item.user.last_login_time || '',
        user_id: item.user.user_id || '',
        online_status: item.user.online_status || '',
        user_name: item.user.user_name || '',
        voice_call_waiting: item.user.voice_call_waiting || false,
        region: region(item.user.region),
        ava_id: item.user.ava_id || '',
        age: item.user.age || 0,
        video_call_waiting: item.user.video_call_waiting || false,
      },
    }));
    callHistorylist = historyList;
  }

  // 結果をフィルタリングして返す
  return {
    props: {
      type: 'success',
      callHistorylist: callHistorylist,
    },
  };
};
