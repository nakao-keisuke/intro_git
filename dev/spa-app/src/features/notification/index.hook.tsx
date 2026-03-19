import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import {
  type GetUserInfoForWebResponseData,
  getUserInfoForWebRequest,
} from '@/apis/get-user-inf-for-web';
import {
  type LstNotiResponseData,
  lstNotiRequest,
  lstNotiRequestWithFilter,
} from '@/apis/lst-noti';
import { USER_DETAIL_NOTIFICATION_TYPES } from '@/constants/notificationTypes';
import type { ResponseData } from '@/types/NextApi';
import { getUserToken } from '@/utils/cookie';
import { postToJambo } from '@/utils/jambo';
import { region } from '@/utils/region';
import { isMobileUserAgent } from '@/utils/userAgent';

export type EnhancedNotificationData = LstNotiResponseData & {
  bustSize?: string;
  hLevel?: string;
  hasLovense?: boolean;
  videoCallWaiting?: boolean;
  voiceCallWaiting?: boolean;
  age?: number;
  regionName?: string;
};

export const getServerSideProps: GetServerSideProps<
  ResponseData<{
    notifications: EnhancedNotificationData[];
    selectedTab?: string;
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

  const { tab } = context.query;
  const notiType = typeof tab === 'string' ? tab : undefined;

  const request = notiType
    ? lstNotiRequestWithFilter(token, notiType)
    : lstNotiRequest(token);

  const { code, data } = await postToJambo<LstNotiResponseData[]>(
    request,
    context.req,
  );

  if (code || !data) {
    return {
      props: {
        type: 'error',
        message: 'エラーが発生しました',
      },
    };
  }

  // 足あととイイネ通知のユーザーIDを取得
  const userIds = data
    .filter((notification) =>
      USER_DETAIL_NOTIFICATION_TYPES.includes(notification.notiType as any),
    )
    .map((notification) => notification.notiUserId)
    .filter((id, index, self) => self.indexOf(id) === index); // 重複除去

  // ユーザー詳細情報を取得
  const userDetailsPromises = userIds.map((userId) => {
    const userInfoRequest = getUserInfoForWebRequest(userId);
    return postToJambo<GetUserInfoForWebResponseData>(
      userInfoRequest,
      context.req,
    );
  });

  const userDetailsResponses = await Promise.all(userDetailsPromises);

  // ユーザー詳細情報をマッピング
  const userDetailsMap = new Map<string, GetUserInfoForWebResponseData>();
  userDetailsResponses.forEach((response) => {
    if (response.code === 0 && response.data) {
      userDetailsMap.set(response.data.user_id, response.data);
    }
  });

  // 通知データに詳細情報を追加
  const enhancedNotifications: EnhancedNotificationData[] = data.map(
    (notification) => {
      const userDetails = userDetailsMap.get(notification.notiUserId);
      return {
        ...notification,
        bustSize: userDetails?.bust_size || '',
        hLevel: userDetails?.h_level || '',
        hasLovense: userDetails?.has_lovense || false,
        videoCallWaiting: userDetails?.video_call_waiting || false,
        voiceCallWaiting: userDetails?.voice_call_waiting || false,
        age: userDetails?.age || 0,
        regionName: region(userDetails?.region || 0),
      };
    },
  );

  return {
    props: {
      type: 'success',
      notifications: enhancedNotifications,
      selectedTab: notiType || 'all',
    },
  };
};
