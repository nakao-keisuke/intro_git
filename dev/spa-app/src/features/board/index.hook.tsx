import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import type { GetSessionBoardMessageResponseElementData } from '@/apis/get-session-board-message';
import { getUtageWebBoardMessageRequest } from '@/apis/get-utage-web-board-message';
import {
  type GetUtageWebPointInfoResponseData,
  getUtageWebPointInfoRequest,
} from '@/apis/get-utage-web-point-info';
import {
  type UtageWebGetLiveChannelsResponseData,
  utageWebGetLiveChannelsRequest,
} from '@/apis/utage-web-get-live-channels';
import {
  loginMeetPeopleRequest,
  type MeetPeopleResponseData,
} from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import type { ResponseData } from '@/types/NextApi';
import type { LiveCallType } from '@/utils/callView';
import { getUserToken } from '@/utils/cookie';
import { postToJambo, postToJamboWithoutIp } from '@/utils/jambo';
import { type Region, region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type BoardListUserInfo = {
  userName: string;
  userId: string;
  age: number;
  region: Region;
  avatarId: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  message: string;
  postTime: string;
  isCalling: boolean;
  liveCallType?: LiveCallType;
  hasLovense: boolean;
  hLevel?: string;
  bustSize?: string;
  isNewUser: boolean;
  regDate?: string;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    boardList: BoardListUserInfo[];
    isPurchased: boolean;
    isTokenAvailable: boolean;
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
  const isTokenAvailable = !!token;
  const boardRequest = getUtageWebBoardMessageRequest(token || undefined);
  const liveChannelRequest = utageWebGetLiveChannelsRequest();

  let isPurchased = false;

  try {
    const fetchCreditData = token
      ? postToJambo<GetUtageWebPointInfoResponseData>(
          getUtageWebPointInfoRequest(token),
          context.req,
        )
      : Promise.resolve({ code: 0, data: null });

    const [creditData, boardResponse, meetResponse, liveChannelResponse] =
      await Promise.all([
        fetchCreditData,
        postToJambo<GetSessionBoardMessageResponseElementData[]>(
          boardRequest,
          context.req,
        ).catch((_error) => {
          return { code: 401, data: [] };
        }), // 未認証時のエラーを処理
        postToJamboWithoutIp<MeetPeopleResponseData[]>(
          loginMeetPeopleRequest,
        ).catch(() => ({ data: [] })),
        postToJambo<UtageWebGetLiveChannelsResponseData>(
          liveChannelRequest,
          context.req,
        ).catch(() => ({ data: { standbyList: [], inLiveList: [] } })),
      ]);

    const { code: boardCode, data: boardData } = boardResponse;
    const { data: meetData } = meetResponse;
    const { data: liveChannelData } = liveChannelResponse;

    if (creditData && creditData.code === 0) {
      isPurchased = creditData.data?.is_purchased ?? false;
    }

    // 未認証時は空のデータでも正常として扱う
    if (boardCode && boardCode !== 401) {
      return {
        props: {
          type: 'error',
          message: 'エラーが発生しました',
        },
      };
    }

    // 未認証時にboardDataが空の場合はデフォルト値を設定
    const safeBoardData = boardData || [];

    const boardList = safeBoardData.map((data) => {
      let liveCallType: LiveCallType | undefined;
      const standbyChannelId = liveChannelData?.standbyList.find(
        (e) => e.broadcaster.user_id === data.user_id,
      )?.channelInfo.channel_id;
      const inLiveChannelId = liveChannelData?.inLiveList.find(
        (e) => e.broadcaster.user_id === data.user_id,
      )?.channelInfo.channel_id;
      if (standbyChannelId) {
        liveCallType = standbyChannelId.includes('video')
          ? 'videoCallFromStandby'
          : 'live';
      }
      if (inLiveChannelId) {
        liveCallType = 'live';
      }

      return {
        userId: data.user_id,
        avatarId: data.ava_id,
        videoCallWaiting: data.video_call_waiting ?? false,
        voiceCallWaiting: data.voice_call_waiting ?? false,
        age: data.age,
        region: region(data.region),
        userName: data.user_name,
        message: data.message,
        postTime: data.created,
        isCalling: !!meetData?.find((d) => d.user_id === data.user_id)
          ?.is_calling,
        ...(liveCallType && { liveCallType }),
        hasLovense: data.has_lovense,
        // 新しく追加するフィールド
        bustSize: data.bust_size || '',
        hLevel: data.h_level || '',
        isNewUser: Boolean(data.is_new_user),
        regDate: data.reg_date || '',
      };
    });

    return {
      props: {
        type: 'success',
        boardList,
        isPurchased,
        isTokenAvailable,
      },
    };
  } catch (_error) {
    // 未認証時でもエラーページではなく空のデータを返す
    return {
      props: {
        type: 'success',
        boardList: [],
        isPurchased: false,
        isTokenAvailable: false,
      },
    };
  }
};
