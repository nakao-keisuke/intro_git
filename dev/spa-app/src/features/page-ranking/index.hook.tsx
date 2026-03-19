import type { GetServerSideProps } from 'next';
import {
  type GetCategoryRankingResponseData,
  getCategoryMessageRankingRequest,
  getCategoryTwoShotRankingRequest,
  getCategoryVideoChatRankingRequest,
} from '@/apis/get-category-ranking';
import {
  type GetCategoryRankingForUtageWebResponseData,
  getCategoryRankingForUtageWebRequest,
} from '@/apis/get-category-ranking-for-utage-web';
import {
  type GetUtageWebBoardMessageResponseData,
  getUtageWebBoardMessageRequest,
} from '@/apis/get-utage-web-board-message';
import {
  loginMeetPeopleRequest,
  type MeetPeopleResponseData,
  newComerMeetPeopleRequest,
} from '@/apis/utage-web-get-meet-people-exclude-video-call-channeler';
import { bannedUserIdList } from '@/constants/bannedUserIdList';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';

import {
  extractInstantCallBoardList,
  extractInstantCallMeetPeopleList,
} from '@/utils/instantCallUtil';
import { postToJamboWithoutIp } from '@/utils/jambo';
import { region } from '@/utils/region';

export type RankedMeetPerson = {
  userId: string;
  avatarId: string;
  about: string;
  userName: string;
  age: number;
  region: string;
  voiceCallWaiting: boolean;
  videoCallWaiting: boolean;
  isNewUser: boolean;
  isCalling: boolean;
  isLive: boolean;
  lastLoginTime: string;
  hasStory: boolean;
  isCallWaiting: boolean;
  rank?: number;
  hasLovense: boolean;
};

type Props = {
  data: ResponseData<{
    isAuthenticated?: boolean;
    videochatRankingMeetPeople?: RankedMeetPerson[];
    twoshotRankingMeetPeople?: RankedMeetPerson[];
    chatRankingMeetPeople?: RankedMeetPerson[];
    popularRankingMeetPeople?: RankedMeetPerson[];
  }>;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const userAgent = context.req.headers['user-agent'];
  if (!userAgent) {
    return {
      props: { data: { type: 'error', message: '不正なリクエストです' } },
    };
  }
  const token = await getUserToken(context.req);

  const boardRequest = getUtageWebBoardMessageRequest(token || undefined);
  const rankingRequest = getCategoryRankingForUtageWebRequest();
  const videochatRankingRequest = getCategoryVideoChatRankingRequest(
    token || undefined,
  );
  const twoshotRankingRequest = getCategoryTwoShotRankingRequest(
    token || undefined,
  );
  const chatRankingRequest = getCategoryMessageRankingRequest(
    token || undefined,
  );

  const [
    { code: newComerCode, data: newComerData },
    { code: loginCode, data: loginData },
    { code: boardCode, data: boardData },
    { code: rankingCode, data: rankingData },
    { code: videochatRankingCode, data: videochatRankingData },
    { code: twoshotRankingCode, data: twoshotRankingData },
    { code: chatRankingCode, data: chatRankingData },
  ] = await Promise.all([
    postToJamboWithoutIp<MeetPeopleResponseData[]>(
      newComerMeetPeopleRequest,
    ).catch(() => ({ code: 0, data: [] })),
    postToJamboWithoutIp<MeetPeopleResponseData[]>(
      loginMeetPeopleRequest,
    ).catch(() => ({ code: 0, data: [] })),
    postToJamboWithoutIp<GetUtageWebBoardMessageResponseData[]>(
      boardRequest,
    ).catch(() => ({ code: 401, data: [] })),
    postToJamboWithoutIp<GetCategoryRankingForUtageWebResponseData[]>(
      rankingRequest,
    ).catch(() => ({ code: 0, data: [] })),
    postToJamboWithoutIp<GetCategoryRankingResponseData[]>(
      videochatRankingRequest,
    ).catch(() => ({ code: 401, data: [] })),
    postToJamboWithoutIp<GetCategoryRankingResponseData[]>(
      twoshotRankingRequest,
    ).catch(() => ({ code: 401, data: [] })),
    postToJamboWithoutIp<GetCategoryRankingResponseData[]>(
      chatRankingRequest,
    ).catch(() => ({ code: 401, data: [] })),
  ]);

  const isAuthenticated = !!token;

  // 未認証時はcode: 3エラーを許可し、認証時は厳密にチェック
  if (
    (newComerCode && newComerCode !== 401) ||
    (boardCode && boardCode !== 401) ||
    rankingCode ||
    (isAuthenticated && videochatRankingCode && videochatRankingCode !== 401) ||
    (isAuthenticated && twoshotRankingCode && twoshotRankingCode !== 401) ||
    (isAuthenticated && chatRankingCode && chatRankingCode !== 401) ||
    (loginCode && loginCode !== 401)
  ) {
    return {
      props: {
        data: {
          type: 'error',
          message: 'エラーが発生しました',
        },
      },
    };
  }

  const filteredVideochatRankingData = videochatRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );
  const filteredTwoshotRankingData = twoshotRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );
  const filteredChatRankingData = chatRankingData?.filter(
    (e) => bannedUserIdList.indexOf(e.user_id) === -1,
  );

  const safeBoardData = boardData || [];
  const safeLoginData = loginData || [];

  const boardInstantCallList = extractInstantCallBoardList(
    safeBoardData,
    safeLoginData,
  );
  const loginInstantCallList = extractInstantCallMeetPeopleList(safeLoginData);
  const isCallWaiting = (userId: string) =>
    boardInstantCallList.some((e) => e.user_id === userId) ||
    loginInstantCallList.some((e) => e.user_id === userId);

  const videochatRankingMeetPeopleList = (
    filteredVideochatRankingData || []
  ).map((e) => {
    const rank =
      (filteredVideochatRankingData?.findIndex(
        (d) => d.user_id === e.user_id,
      ) ?? -1) + 1;
    return {
      userId: e.user_id,
      avatarId: e.user.ava_id,
      about: e.user.abt ?? '',
      userName: e.user.user_name,
      age: e.user.age,
      region: region(e.user.region),
      voiceCallWaiting: e.user.voice_call_waiting,
      videoCallWaiting: e.user.video_call_waiting,
      isNewUser: e.user.is_new,
      isCalling: !!safeLoginData.find((d) => d.user_id === e.user_id)
        ?.is_calling,
      isLive: !!safeLoginData.find((d) => d.user_id === e.user_id)?.is_live_now,
      lastLoginTime: e.user.last_login_time,
      hasStory: !!safeLoginData.find((d) => d.user_id === e.user_id)
        ?.has_story_movie,
      isCallWaiting: isCallWaiting(e.user_id),
      ...(rank && { rank }),
      hasLovense: e.has_lovense,
      call_status: e.user.call_status,
      last_action_status_label: e.user.last_action_status_label,
    };
  });

  const twoshotRankingMeetPeopleList = (filteredTwoshotRankingData || []).map(
    (e) => {
      const rank =
        (filteredTwoshotRankingData?.findIndex(
          (d) => d.user_id === e.user_id,
        ) ?? -1) + 1;
      return {
        userId: e.user_id,
        avatarId: e.user.ava_id,
        about: e.user.abt ?? '',
        userName: e.user.user_name,
        age: e.user.age,
        region: region(e.user.region),
        voiceCallWaiting: e.user.voice_call_waiting,
        videoCallWaiting: e.user.video_call_waiting,
        isNewUser: e.user.is_new,
        isCalling: !!loginData?.find((d) => d.user_id === e.user_id)
          ?.is_calling,
        isLive: !!loginData?.find((d) => d.user_id === e.user_id)?.is_live_now,
        lastLoginTime: e.user.last_login_time,
        hasStory: !!loginData?.find((d) => d.user_id === e.user_id)
          ?.has_story_movie,
        isCallWaiting: isCallWaiting(e.user_id),
        ...(rank && { rank }),
        hasLovense: e.has_lovense,
        call_status: e.user.call_status,
        last_action_status_label: e.user.last_action_status_label || '',
      };
    },
  );

  const chatRankingMeetPeopleList = (filteredChatRankingData || []).map((e) => {
    const rank =
      (filteredChatRankingData?.findIndex((d) => d.user_id === e.user_id) ??
        -1) + 1;
    return {
      userId: e.user_id,
      avatarId: e.user.ava_id,
      about: e.user.abt ?? '',
      userName: e.user.user_name,
      age: e.user.age,
      region: region(e.user.region),
      voiceCallWaiting: e.user.voice_call_waiting,
      videoCallWaiting: e.user.video_call_waiting,
      isNewUser: e.user.is_new,
      isCalling: !!safeLoginData.find((d) => d.user_id === e.user_id)
        ?.is_calling,
      isLive: !!safeLoginData.find((d) => d.user_id === e.user_id)?.is_live_now,
      lastLoginTime: e.user.last_login_time,
      hasStory: !!safeLoginData.find((d) => d.user_id === e.user_id)
        ?.has_story_movie,
      isCallWaiting: isCallWaiting(e.user_id),
      ...(rank && { rank }),
      hasLovense: e.has_lovense,
      call_status: e.user.call_status,
      last_action_status_label: e.user.last_action_status_label,
    };
  });

  const _trimArrayToMultipleOfThree = (arr: any[]): any[] => {
    const removeCount = arr.length % 3;
    return arr.slice(0, arr.length - removeCount);
  };

  // 未認証ユーザー用：人気女の子ランキング（get_category_ranking_for_utage_webデータを使用）
  if (!isAuthenticated) {
    const filteredPopularRankingData = rankingData?.filter(
      (e) => bannedUserIdList.indexOf(e.user_id) === -1,
    );

    const popularRankingMeetPeopleList = (filteredPopularRankingData || []).map(
      (e, index) => {
        const rank = index + 1;
        return {
          userId: e.user_id,
          avatarId: e.user.ava_id,
          about: e.user.abt ?? '',
          userName: e.user.user_name,
          age: e.user.age,
          region: region(e.user.region),
          voiceCallWaiting: e.user.voice_call_waiting,
          videoCallWaiting: e.user.video_call_waiting,
          isNewUser: e.user.is_new,
          isCalling: !!safeLoginData.find((d) => d.user_id === e.user_id)
            ?.is_calling,
          isLive: !!safeLoginData.find((d) => d.user_id === e.user_id)
            ?.is_live_now,
          lastLoginTime: e.user.last_login_time,
          hasStory: !!safeLoginData.find((d) => d.user_id === e.user_id)
            ?.has_story_movie,
          isCallWaiting: isCallWaiting(e.user_id),
          rank,
          hasLovense: e.has_lovense,
          call_status: e.user.call_status,
          last_action_status_label: e.user.last_action_status_label || '',
        };
      },
    );

    return {
      props: {
        data: {
          type: 'success',
          isAuthenticated: false,
          popularRankingMeetPeople: popularRankingMeetPeopleList,
        },
      },
    };
  }

  // 認証済みユーザー用：従来のランキング表示
  return {
    props: {
      data: {
        type: 'success',
        isAuthenticated: true,
        videochatRankingMeetPeople: videochatRankingMeetPeopleList,
        twoshotRankingMeetPeople: twoshotRankingMeetPeopleList,
        chatRankingMeetPeople: chatRankingMeetPeopleList,
      },
    },
  };
};
